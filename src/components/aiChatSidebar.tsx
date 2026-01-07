import { useState, useRef, useEffect, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faPaperPlaneTop,
    faXmark,
    faSparkles,
    faCircleUser,
    faChevronDown,
    faCheck,
} from '@fortawesome/pro-regular-svg-icons'
import * as ts from '../features/tools/toolSlice'
import { Listbox } from '@headlessui/react'
import { getActiveProviderAPIKey } from '../features/ai/apiKeyUtils'
import { streamAIResponse, DEFAULT_MODELS, AIProvider } from '../features/ai/providers'
import * as ssel from '../features/settings/settingsSelectors'
import cx from 'classnames'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

interface ModelOption {
    value: string
    label: string
    provider: AIProvider
    isFree?: boolean
}

interface ProviderGroup {
    provider: AIProvider
    name: string
    models: ModelOption[]
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
    const [selectedModel, setSelectedModel] = useState<string>('auto')
    const [streamingContent, setStreamingContent] = useState('')
    const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const abortControllerRef = useRef<AbortController | null>(null)
    const handleSendRef = useRef<(() => Promise<void>) | null>(null)

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
                Math.min(textareaRef.current.scrollHeight, 300) + 'px'
        }
    }, [input])

    // Listen for query from Command+K and focus textarea
    useEffect(() => {
        if (aiSidebarOpen && textareaRef.current) {
            // Check if there's a query from Command+K
            if (typeof window !== 'undefined' && (window as any).__codexChatQuery) {
                const query = (window as any).__codexChatQuery
                delete (window as any).__codexChatQuery
                // Set input and auto-send
                setInput(query)
                setTimeout(() => {
                    if (query.trim() && !isGenerating && handleSendRef.current) {
                        handleSendRef.current()
                    }
                }, 300)
            } else {
                // Just focus the textarea when sidebar opens
                setTimeout(() => {
                    textareaRef.current?.focus()
                }, 100)
            }
        }
    }, [aiSidebarOpen])

    // Organize models by provider sections
    const providerGroups = useMemo((): ProviderGroup[] => {
        const groups: ProviderGroup[] = []
        
        // Add Auto option as first group
        const currentProvider = settings.aiProvider || 'openai'
        groups.push({
            provider: currentProvider as AIProvider,
            name: 'Default',
            models: [{
                value: 'auto',
                label: `Auto (${getProviderDisplayName(currentProvider)})`,
                provider: currentProvider as AIProvider,
            }],
        })

        // Group all providers with their models
        const providers: AIProvider[] = ['openai', 'claude', 'gemini', 'openrouter']
        
        providers.forEach((provider) => {
            const models = DEFAULT_MODELS[provider] || []
            const modelOptions: ModelOption[] = []

            models.forEach((model) => {
                const isFree = model.includes(':free')
                const cleanModel = model.replace(':free', '')
                const displayName = formatModelName(cleanModel, provider)
                
                modelOptions.push({
                    value: model,
                    label: displayName,
                    provider,
                    isFree,
                })
            })

            if (modelOptions.length > 0) {
                groups.push({
                    provider,
                    name: getProviderDisplayName(provider),
                    models: modelOptions,
                })
            }
        })

        return groups
    }, [settings.aiProvider])

    // Get the actual model to use for API call
    const getModelToUse = async (): Promise<{ model: string; provider: AIProvider; apiKey: string }> => {
        const providerInfo = await getActiveProviderAPIKey(settings)
        if (!providerInfo) {
            throw new Error('No API key configured. Please set up an API key in Settings or .env file.')
        }

        if (selectedModel === 'auto') {
            return {
                model: providerInfo.model,
                provider: providerInfo.provider as AIProvider,
                apiKey: providerInfo.apiKey!,
            }
        }

        // User selected a specific model
        const currentProvider = settings.aiProvider || 'openai'

        // If using OpenRouter, we can use any OpenRouter model (including cross-provider models)
        if (currentProvider === 'openrouter') {
            // Keep the :free suffix if present, OpenRouter handles it
            return {
                model: selectedModel,
                provider: 'openrouter',
                apiKey: providerInfo.apiKey!,
            }
        }

        // For direct providers (OpenAI, Gemini, Claude), remove :free suffix and use model directly
        const selectedModelClean = selectedModel.replace(':free', '')
        return {
            model: selectedModelClean,
            provider: currentProvider as AIProvider,
            apiKey: providerInfo.apiKey!,
        }
    }

    const handleSend = async () => {
        if (!input.trim() || isGenerating) return

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

        // Abort any previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }
        abortControllerRef.current = new AbortController()

        try {
            const { model, provider, apiKey } = await getModelToUse()

            // Prepare messages for API
            const apiMessages = [
                ...messages.map((m) => ({
                    role: m.role as 'user' | 'assistant' | 'system',
                    content: m.content,
                })),
                { role: 'user' as const, content: userInput },
            ]

            // Create assistant message placeholder
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

            // Stream response
            let fullContent = ''
            const providerConfig = {
                provider,
                apiKey,
                enabled: true,
                defaultModel: model,
            }

            for await (const chunk of streamAIResponse(providerConfig, apiMessages)) {
                if (abortControllerRef.current?.signal.aborted) {
                    break
                }
                fullContent += chunk
                setStreamingContent(fullContent)
            }

            // Clear streaming state FIRST to prevent duplicate rendering
            setStreamingContent('')
            setStreamingMessageId(null)
            
            // Then update the assistant message with final content (only once)
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === assistantMessageId
                        ? { ...msg, content: fullContent }
                        : msg
                )
            )
        } catch (error: any) {
            const errorMessage =
                error.message || 'Failed to get response. Please check your API key and try again.'
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

    // Update handleSendRef when handleSend changes
    useEffect(() => {
        handleSendRef.current = handleSend
    }, [handleSend])

    const selectedModelOption = useMemo(() => {
        for (const group of providerGroups) {
            const model = group.models.find((m) => m.value === selectedModel)
            if (model) return model
        }
        return providerGroups[0]?.models[0]
    }, [selectedModel, providerGroups])

    const getProviderIcon = (_provider: AIProvider) => {
        // Return icon component for provider
        return <FontAwesomeIcon icon={faSparkles} />
    }

    return (
        <div className="ai-sidebar">
            {/* Header */}
            <div className="ai-sidebar__header">
                <div className="ai-sidebar__header-left">
                    <FontAwesomeIcon icon={faSparkles} />
                    <span>CodeX AI</span>
                </div>
                <button
                    onClick={() => dispatch(ts.untriggerAICommandPalette())}
                    className="ai-sidebar__close-btn"
                    aria-label="Close AI Assistant"
                >
                    <FontAwesomeIcon icon={faXmark} />
                </button>
            </div>

            {/* Messages */}
            <div className="ai-sidebar__messages ai-chat-messages">
                {messages.length === 0 && (
                    <div className="ai-sidebar__empty">
                        <div className="ai-sidebar__empty-icon">
                            <FontAwesomeIcon icon={faSparkles} />
                        </div>
                        <div className="ai-sidebar__empty-text">
                            <p className="ai-sidebar__empty-title">
                                What can I do for you?
                            </p>
                            <p className="ai-sidebar__empty-subtitle">
                                Ask me anything about your code
                            </p>
                        </div>
                    </div>
                )}

                {messages.map((message) => {
                    // Only show streaming content if this is the active streaming message AND message has no content yet
                    const isStreaming = message.id === streamingMessageId && streamingContent && !message.content
                    const displayContent = isStreaming ? streamingContent : (message.content || '')
                    
                    // Don't render empty assistant messages (they're placeholders that haven't started streaming)
                    if (message.role === 'assistant' && !displayContent && !isStreaming) {
                        return null
                    }
                    
                    return (
                        <div key={message.id} className="ai-message">
                            <div className="ai-message__avatar">
                                <FontAwesomeIcon
                                    icon={
                                        message.role === 'user'
                                            ? faCircleUser
                                            : faSparkles
                                    }
                                />
                            </div>
                            <div className="ai-message__content-wrapper">
                                <div className="ai-message__content">
                                    {displayContent}
                                </div>
                                <div className="ai-message__timestamp">
                                    {message.timestamp.toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </div>
                            </div>
                        </div>
                    )
                })}

                {isGenerating && !streamingContent && (
                    <div className="ai-message">
                        <div className="ai-message__avatar">
                            <FontAwesomeIcon icon={faSparkles} />
                        </div>
                        <div className="typing-indicator-codex">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input with Model Selection - Reference Design */}
            <div className="ai-sidebar__input-wrapper">
                <div className="ai-sidebar__input-container">
                    <div className="ai-sidebar__textarea-wrapper">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="What can I do for you?"
                            className="ai-sidebar__textarea"
                            disabled={isGenerating}
                        />
                    </div>

                    <div className="ai-sidebar__input-footer">
                        <div className="ai-sidebar__input-controls">
                            {/* Model Selector */}
                            <Listbox value={selectedModel} onChange={setSelectedModel}>
                                <div className="relative" style={{ zIndex: 10002 }}>
                                    <Listbox.Button className="ai-sidebar__model-select-btn">
                                        <span className="ai-sidebar__model-select-content">
                                            {getProviderIcon(selectedModelOption?.provider || 'openai')}
                                            <span className="ai-sidebar__model-select-text">
                                                {selectedModelOption?.label || 'Select Model'}
                                            </span>
                                            <FontAwesomeIcon icon={faChevronDown} size="xs" className="ai-sidebar__model-select-chevron" />
                                        </span>
                                    </Listbox.Button>
                                    <Listbox.Options className="ai-sidebar__model-dropdown">
                                        {providerGroups.map((group) => (
                                            <div key={group.provider} className="ai-sidebar__provider-group">
                                                <div className="ai-sidebar__provider-group-label">
                                                    {group.name}
                                                </div>
                                                {group.models.map((model) => (
                                                    <Listbox.Option
                                                        key={model.value}
                                                        value={model.value}
                                                        className={({ active }) =>
                                                            cx('ai-sidebar__model-option', {
                                                                'ai-sidebar__model-option--active': active,
                                                            })
                                                        }
                                                    >
                                                        {({ selected }) => (
                                                            <div className="ai-sidebar__model-option-content">
                                                                <div className="ai-sidebar__model-option-left">
                                                                    {getProviderIcon(model.provider)}
                                                                    <span>{model.label}</span>
                                                                </div>
                                                                {selected && (
                                                                    <FontAwesomeIcon icon={faCheck} className="ai-sidebar__model-check" />
                                                                )}
                                                            </div>
                                                        )}
                                                    </Listbox.Option>
                                                ))}
                                            </div>
                                        ))}
                                    </Listbox.Options>
                                </div>
                            </Listbox>

                            <div className="ai-sidebar__input-divider" />

                            {/* Send Button */}
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isGenerating}
                                className="ai-sidebar__send-btn-inline"
                                aria-label="Send message"
                            >
                                <FontAwesomeIcon 
                                    icon={faPaperPlaneTop} 
                                    className={cx('ai-sidebar__send-icon', {
                                        'ai-sidebar__send-icon--disabled': !input.trim() || isGenerating,
                                    })}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Helper functions
function getProviderDisplayName(provider: string): string {
    const names: Record<string, string> = {
        openai: 'OpenAI',
        openrouter: 'OpenRouter',
        gemini: 'Gemini',
        claude: 'Claude',
    }
    return names[provider] || 'AI'
}

function formatModelName(model: string, provider: string): string {
    // Remove provider prefix for cleaner display
    if (provider === 'openrouter') {
        // Format: "anthropic/claude-3.5-sonnet" -> "Claude 3.5 Sonnet"
        const parts = model.split('/')
        if (parts.length > 1) {
            const modelName = parts[1]
            return modelName
                .replace(/-/g, ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase())
        }
    }
    
    // For direct providers, format the model name
    return model
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase())
        .replace(/\d+(\w+)/g, (m) => m.toUpperCase())
}
