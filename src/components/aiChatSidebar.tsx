import { useState, useRef, useEffect, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faPaperPlaneTop,
    faXmark,
    faSparkles,
    faCircleUser,
    faGear,
    faArrowRight,
} from '@fortawesome/pro-regular-svg-icons'
import * as ts from '../features/tools/toolSlice'
import { getActiveProviderAPIKey } from '../features/ai/apiKeyUtils'
import { streamAIResponse, AIProvider } from '../features/ai/providers'
import * as ssel from '../features/settings/settingsSelectors'
import {
    toggleSettings,
    setSettingsTab,
} from '../features/settings/settingsSlice'
import cx from 'classnames'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

export function AIChatSidebar() {
    const dispatch = useAppDispatch()
    const settings = useAppSelector(ssel.getSettings)
    const aiSidebarOpen = useAppSelector(
        (state: any) => state.toolsState?.aiCommandPaletteTriggered
    )
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [streamingContent, setStreamingContent] = useState('')
    const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
        null
    )
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const abortControllerRef = useRef<AbortController | null>(null)
    const handleSendRef = useRef<(() => Promise<void>) | null>(null)

    // Check if AI is configured
    const isAIConfigured = useMemo(() => {
        const provider = settings.aiProvider
        if (provider === 'openai')
            return !!(settings.useOpenAIKey && settings.openAIKey)
        if (provider === 'openrouter')
            return !!(settings.useOpenRouterKey && settings.openRouterKey)
        if (provider === 'gemini')
            return !!(settings.useGeminiKey && settings.geminiKey)
        if (provider === 'claude')
            return !!(settings.useClaudeKey && settings.claudeKey)
        return false
    }, [settings])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, streamingContent])

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height =
                Math.min(textareaRef.current.scrollHeight, 200) + 'px'
        }
    }, [input])

    // Listen for query from Command+K
    useEffect(() => {
        if (aiSidebarOpen && textareaRef.current) {
            if (
                typeof window !== 'undefined' &&
                (window as any).__codexChatQuery
            ) {
                const query = (window as any).__codexChatQuery
                delete (window as any).__codexChatQuery
                setInput(query)
                setTimeout(() => {
                    if (
                        query.trim() &&
                        !isGenerating &&
                        handleSendRef.current
                    ) {
                        handleSendRef.current()
                    }
                }, 300)
            } else {
                setTimeout(() => {
                    textareaRef.current?.focus()
                }, 100)
            }
        }
    }, [aiSidebarOpen])

    const getModelToUse = async (): Promise<{
        model: string
        provider: AIProvider
        apiKey: string
    }> => {
        const providerInfo = await getActiveProviderAPIKey(settings)

        if (process.env.NODE_ENV === 'development') {
            console.log('[AI Chat] Provider info:', providerInfo)
        }

        if (!providerInfo) {
            throw new Error('No API key configured.')
        }

        const currentProvider = settings.aiProvider || 'openai'
        if (currentProvider === 'openrouter') {
            if (process.env.NODE_ENV === 'development') {
                console.log(
                    '[AI Chat] Using OpenRouter with model:',
                    providerInfo.model
                )
            }
            return {
                model: providerInfo.model,
                provider: 'openrouter',
                apiKey: providerInfo.apiKey!,
            }
        }

        const selectedModelClean = providerInfo.model.replace(':free', '')
        return {
            model: selectedModelClean,
            provider: currentProvider as AIProvider,
            apiKey: providerInfo.apiKey!,
        }
    }

    const handleSend = async () => {
        if (!input.trim() || isGenerating) return

        if (!isAIConfigured) {
            dispatch(setSettingsTab('AI'))
            dispatch(toggleSettings())
            return
        }

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMessage])
        const userInput = input.trim()
        setInput('')
        setIsGenerating(true)
        setStreamingContent('')

        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }
        abortControllerRef.current = new AbortController()

        try {
            const { model, provider, apiKey } = await getModelToUse()

            const apiMessages = [
                ...messages.map((m) => ({
                    role: m.role as 'user' | 'assistant' | 'system',
                    content: m.content,
                })),
                { role: 'user' as const, content: userInput },
            ]

            const assistantMessageId = Date.now().toString() + '_assistant'
            setStreamingMessageId(assistantMessageId)
            setMessages((prev) => [
                ...prev,
                {
                    id: assistantMessageId,
                    role: 'assistant',
                    content: '',
                    timestamp: new Date(),
                },
            ])

            let fullContent = ''
            const providerConfig = {
                provider,
                apiKey,
                enabled: true,
                defaultModel: model,
            }

            for await (const chunk of streamAIResponse(
                providerConfig,
                apiMessages
            )) {
                if (abortControllerRef.current?.signal.aborted) {
                    break
                }
                fullContent += chunk
                setStreamingContent(fullContent)
            }

            setStreamingContent('')
            setStreamingMessageId(null)

            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === assistantMessageId
                        ? { ...msg, content: fullContent }
                        : msg
                )
            )
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to get response.'
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: `Error: ${errorMessage}`,
                    timestamp: new Date(),
                },
            ])
            setStreamingContent('')
            setStreamingMessageId(null)
        } finally {
            setIsGenerating(false)
            abortControllerRef.current = null
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    useEffect(() => {
        handleSendRef.current = handleSend
    }, [handleSend])

    // --- RENDER ---

    if (!isAIConfigured) {
        return (
            <div className="h-full flex flex-col bg-[var(--sidebar-bg)] border-l border-[var(--ui-border)]">
                {/* Header - Matching topbar height (35px) */}
                <div className="h-[35px] min-h-[35px] flex items-center justify-between px-4 border-b border-[var(--ui-border)] bg-[var(--sidebar-bg)]">
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon
                            icon={faSparkles}
                            className="text-[var(--accent)] text-xs"
                        />
                        <span className="text-[11px] font-semibold text-[var(--ui-fg)] tracking-wide uppercase">
                            CodeX AI
                        </span>
                    </div>
                    <button
                        onClick={() => dispatch(ts.untriggerAICommandPalette())}
                        className="w-6 h-6 flex items-center justify-center rounded text-[var(--ui-fg-muted)] hover:text-[var(--ui-fg)] hover:bg-[var(--ui-hover)] transition-colors"
                    >
                        <FontAwesomeIcon icon={faXmark} className="text-xs" />
                    </button>
                </div>

                {/* Empty State */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 rounded-lg bg-[var(--ui-bg-elevated)] flex items-center justify-center mb-5 border border-[var(--ui-border)]">
                        <FontAwesomeIcon
                            icon={faGear}
                            className="text-2xl text-[var(--accent)]"
                        />
                    </div>
                    <h3 className="text-base font-semibold text-[var(--ui-fg)] mb-2">
                        Setup AI Engine
                    </h3>
                    <p className="text-xs text-[var(--ui-fg-muted)] mb-6 leading-relaxed max-w-[240px]">
                        Connect your preferred AI provider to unlock intelligent
                        code generation and chat features.
                    </p>
                    <button
                        onClick={() => {
                            dispatch(setSettingsTab('AI'))
                            dispatch(toggleSettings())
                        }}
                        className="group flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium rounded-lg transition-all"
                    >
                        Configure Now
                        <FontAwesomeIcon
                            icon={faArrowRight}
                            className="text-xs group-hover:translate-x-0.5 transition-transform"
                        />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col bg-[var(--sidebar-bg)] border-l border-[var(--ui-border)]">
            {/* Header - Matching topbar height (35px) */}
            <div className="h-[35px] min-h-[35px] flex items-center justify-between px-4 border-b border-[var(--ui-border)] bg-[var(--sidebar-bg)]">
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon
                        icon={faSparkles}
                        className="text-[var(--accent)] text-xs"
                    />
                    <span className="text-[11px] font-semibold text-[var(--ui-fg)] tracking-wide uppercase">
                        CodeX AI
                    </span>
                </div>
                <button
                    onClick={() => dispatch(ts.untriggerAICommandPalette())}
                    className="w-6 h-6 flex items-center justify-center rounded text-[var(--ui-fg-muted)] hover:text-[var(--ui-fg)] hover:bg-[var(--ui-hover)] transition-colors"
                >
                    <FontAwesomeIcon icon={faXmark} className="text-xs" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50 pb-16">
                        <div className="w-12 h-12 rounded-lg bg-[var(--ui-bg-elevated)] flex items-center justify-center mb-3 border border-[var(--ui-border)]">
                            <FontAwesomeIcon
                                icon={faSparkles}
                                className="text-lg text-[var(--ui-fg-muted)]"
                            />
                        </div>
                        <h4 className="text-sm font-medium text-[var(--ui-fg)] mb-1">
                            Ready to assist
                        </h4>
                        <p className="text-xs text-[var(--ui-fg-muted)]">
                            Ask me anything about your code
                        </p>
                    </div>
                )}

                {messages.map((message) => {
                    const isStreaming =
                        message.id === streamingMessageId &&
                        streamingContent &&
                        !message.content
                    const displayContent = isStreaming
                        ? streamingContent
                        : message.content || ''

                    if (
                        message.role === 'assistant' &&
                        !displayContent &&
                        !isStreaming
                    )
                        return null

                    return (
                        <div
                            key={message.id}
                            className={cx(
                                'flex gap-3 animate-in fade-in slide-in-from-bottom-1 duration-200',
                                message.role === 'user'
                                    ? 'flex-row-reverse'
                                    : 'flex-row'
                            )}
                        >
                            {/* Avatar */}
                            <div
                                className={cx(
                                    'w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5',
                                    message.role === 'user'
                                        ? 'bg-[var(--ui-bg-elevated)] text-[var(--ui-fg-muted)] border border-[var(--ui-border)]'
                                        : 'bg-[var(--accent)] text-white'
                                )}
                            >
                                <FontAwesomeIcon
                                    icon={
                                        message.role === 'user'
                                            ? faCircleUser
                                            : faSparkles
                                    }
                                    className="text-xs"
                                />
                            </div>

                            {/* Message Content */}
                            <div
                                className={cx(
                                    'flex-1 min-w-0 text-[13px] leading-relaxed break-words',
                                    message.role === 'user'
                                        ? 'bg-[var(--ui-bg-elevated)] text-[var(--ui-fg)] px-3 py-2 rounded-lg border border-[var(--ui-border)]'
                                        : 'text-[var(--ui-fg)] pt-0.5'
                                )}
                            >
                                {message.role === 'assistant' ? (
                                    <pre className="whitespace-pre-wrap font-sans text-[var(--ui-fg)] leading-relaxed">
                                        {displayContent}
                                    </pre>
                                ) : (
                                    displayContent
                                )}
                            </div>
                        </div>
                    )
                })}

                {isGenerating && !streamingContent && (
                    <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-md bg-[var(--accent)] flex items-center justify-center shrink-0">
                            <FontAwesomeIcon
                                icon={faSparkles}
                                className="text-white text-xs"
                            />
                        </div>
                        <div className="flex items-center gap-1 h-7">
                            <div className="w-1 h-1 bg-[var(--ui-fg-muted)] rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-1 h-1 bg-[var(--ui-fg-muted)] rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-1 h-1 bg-[var(--ui-fg-muted)] rounded-full animate-bounce" />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-[var(--sidebar-bg)] border-t border-[var(--ui-border)]">
                <div className="relative bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg focus-within:border-[var(--accent)] transition-colors">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask a question..."
                        rows={1}
                        className="w-full bg-transparent text-[var(--input-fg)] placeholder-[var(--input-placeholder)] text-[13px] px-3 py-2.5 focus:outline-none resize-none min-h-[38px] max-h-[150px]"
                        disabled={isGenerating}
                    />

                    <div className="px-2 pb-2 flex justify-between items-center">
                        <div className="text-[9px] text-[var(--ui-fg-muted)] font-semibold px-1.5 py-0.5 rounded bg-[var(--ui-bg-elevated)] uppercase tracking-wider">
                            {settings.aiProvider ? settings.aiProvider : 'AI'}
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isGenerating}
                            className={cx(
                                'w-7 h-7 flex items-center justify-center rounded-md transition-all',
                                !input.trim() || isGenerating
                                    ? 'text-[var(--ui-fg-muted)] opacity-30 cursor-not-allowed'
                                    : 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] active:scale-95'
                            )}
                        >
                            <FontAwesomeIcon
                                icon={faPaperPlaneTop}
                                className="text-xs"
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
