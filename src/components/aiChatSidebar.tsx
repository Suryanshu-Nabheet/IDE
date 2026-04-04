import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { Codicon } from './codicon'
import * as ts from '../features/tools/toolSlice'
import { getActiveProviderAPIKey } from '../features/ai/apiKeyUtils'
import { streamAIResponseWithTools } from '../features/ai/providersWithTools'
import {
    AI_TOOLS,
    AI_SYSTEM_PROMPT,
    executeToolCall,
} from '../features/ai/tools'
import { openFile, fileWasUpdated } from '../features/globalSlice'
import * as ssel from '../features/settings/settingsSelectors'
import {
    toggleSettings,
    setSettingsTab,
} from '../features/settings/settingsSlice'
import { getActiveFileId } from '../features/window/paneUtils'
import { getPathForFileId } from '../features/window/fileUtils'
import { FullState } from '../features/window/state'
import { CodeBlock, ToolCallCard, PlanCard } from './aiCodeBlock'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import '../styles/aiCodeBlock.css'

// Quick prompts shown in the empty state
const QUICK_PROMPTS = [
    'Explain the current file',
    'Find potential bugs in this code',
    'Add TypeScript types to this file',
    'Write unit tests for the selected code',
    'Refactor this for better readability',
    'What does this function do?',
]

// Typing cursor component
function TypingCursor() {
    return <span className="ai-typing-cursor" aria-hidden="true" />
}

// Thinking dots animation
function ThinkingDots() {
    return (
        <span className="ai-thinking-dots" aria-label="AI is thinking">
            <span /><span /><span />
        </span>
    )
}

interface ToolCallState {
    id: string
    name: string
    arguments: Record<string, any>
    result?: string
    success?: boolean
    isExecuting: boolean
    needsApproval?: boolean
}

interface Message {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: Date
    toolCalls?: ToolCallState[]
    plan?: string
}

// Reusable markdown renderer
function AiMarkdown({ content }: { content: string }) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                code({ node: _node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '')
                    const language = match ? match[1] : 'plaintext'
                    const code = String(children).replace(/\n$/, '')
                    return !inline ? (
                        <CodeBlock code={code} language={language} />
                    ) : (
                        <code className={`ai-inline-code ${className || ''}`} {...props}>
                            {children}
                        </code>
                    )
                },
                a({ href, children, ...props }: any) {
                    return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
                },
                p({ children }: any) {
                    return <p className="ai-md-p">{children}</p>
                },
                ul({ children }: any) {
                    return <ul className="ai-md-ul">{children}</ul>
                },
                ol({ children }: any) {
                    return <ol className="ai-md-ol">{children}</ol>
                },
                li({ children }: any) {
                    return <li className="ai-md-li">{children}</li>
                },
                h1({ children }: any) { return <h1 className="ai-md-h1">{children}</h1> },
                h2({ children }: any) { return <h2 className="ai-md-h2">{children}</h2> },
                h3({ children }: any) { return <h3 className="ai-md-h3">{children}</h3> },
                blockquote({ children }: any) {
                    return <blockquote className="ai-md-blockquote">{children}</blockquote>
                },
                table({ children }: any) {
                    return <div className="ai-md-table-wrap"><table className="ai-md-table">{children}</table></div>
                },
                hr() { return <hr className="ai-md-hr" /> },
            }}
        >
            {content}
        </ReactMarkdown>
    )
}

// Message bubble component for rendered messages
function MessageBubble({
    message,
    onToolApproval,
    onRetry,
}: {
    message: Message
    onToolApproval: (toolId: string, approved: boolean) => void
    onRetry?: () => void
}) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        await navigator.clipboard.writeText(message.content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const isUser = message.role === 'user'

    return (
        <div className="ai-message">
            <div className={isUser ? 'user-message-container' : 'assistant-message-container'}>
                {!isUser && (
                    <div className="ai-avatar">
                        <Codicon name="sparkle" style={{ fontSize: '11px' }} />
                    </div>
                )}
                <div className={isUser ? 'user-message-box' : 'assistant-message-flow'}>
                    {/* Plan card */}
                    {message.plan && <PlanCard planMarkdown={message.plan} />}

                    <div className="ai-message__content">
                        {/* Tool calls */}
                        {message.toolCalls && message.toolCalls.length > 0 && (
                            <div className="tool-calls-container">
                                {message.toolCalls.map((tc) => (
                                    <ToolCallCard
                                        key={tc.id}
                                        toolName={tc.name}
                                        arguments={tc.arguments}
                                        result={tc.result}
                                        success={tc.success}
                                        isExecuting={tc.isExecuting}
                                        needsApproval={tc.needsApproval}
                                        onAccept={() => onToolApproval(tc.id, true)}
                                        onReject={() => onToolApproval(tc.id, false)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Content */}
                        {message.content && (
                            <div className="markdown-container">
                                <AiMarkdown content={message.content} />
                            </div>
                        )}
                    </div>

                    {/* Footer with actions */}
                    <div className="ai-message__footer">
                        <span className="ai-message__timestamp">
                            {message.timestamp.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                            })}
                        </span>
                        <div className="ai-message__actions">
                            {!isUser && message.content && (
                                <button
                                    className="ai-msg-action-btn"
                                    onClick={handleCopy}
                                    title={copied ? 'Copied!' : 'Copy message'}
                                >
                                    <Codicon name={copied ? 'check' : 'copy'} style={{ fontSize: '10px' }} />
                                </button>
                            )}
                            {onRetry && (
                                <button
                                    className="ai-msg-action-btn"
                                    onClick={onRetry}
                                    title="Edit and resend"
                                >
                                    <Codicon name="edit" style={{ fontSize: '10px' }} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function AIChatSidebar() {
    const dispatch = useAppDispatch()
    const settings = useAppSelector(ssel.getSettings)
    const aiSidebarOpen = useAppSelector(
        (state: FullState) => state.toolState?.aiCommandPaletteTriggered
    )
    const rootPath = useAppSelector((state: FullState) => state.global.rootPath)
    const activeFileId = useAppSelector((state: FullState) =>
        getActiveFileId(state.global)
    )
    const activeFilePath = useAppSelector((state: FullState) =>
        activeFileId ? getPathForFileId(state.global, activeFileId) : null
    )

    // State
    const [messages, setMessages] = useState<Message[]>([])
    // plan state removed, now part of messages or streaming state
    const [currentPlan, setCurrentPlan] = useState<string | null>(null)
    const [input, setInput] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [streamedText, setStreamedText] = useState('')
    const [pendingToolCalls, setPendingToolCalls] = useState<ToolCallState[]>(
        []
    )

    // Refs
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const abortControllerRef = useRef<AbortController | null>(null)
    const confirmationResolvers = useRef<
        Record<string, { resolve: (v: boolean) => void; reject: () => void }>
    >({})

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
        if (provider === 'ollama') return true
        return false
    }, [settings])

    // Get current provider display name
    const providerDisplayName = useMemo(() => {
        const provider = settings.aiProvider || 'ollama'
        const modelName =
            provider === 'openai'
                ? settings.openAIModel
                : provider === 'openrouter'
                ? settings.openRouterModel
                : provider === 'gemini'
                ? settings.geminiModel
                : provider === 'claude'
                ? settings.claudeModel
                : settings.ollamaModel || 'llama3'

        return {
            provider: provider.charAt(0).toUpperCase() + provider.slice(1),
            model: modelName || 'Default',
        }
    }, [settings])

    // Auto-scroll to bottom
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages, streamedText, pendingToolCalls, scrollToBottom])

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height =
                Math.min(textareaRef.current.scrollHeight, 200) + 'px'
        }
    }, [input])

    // Handle Command+K query injection
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
                    if (query.trim() && !isGenerating) {
                        handleSend()
                    }
                }, 300)
            } else {
                setTimeout(() => {
                    textareaRef.current?.focus()
                }, 100)
            }
        }
    }, [aiSidebarOpen])

    // Get model configuration
    const getModelToUse = useCallback(async (): Promise<{
        model: string
        provider: any
        apiKey: string
    }> => {
        const providerInfo = await getActiveProviderAPIKey(settings)

        if (!providerInfo) {
            return {
                model: 'llama3',
                provider: 'ollama',
                apiKey: 'ollama',
            }
        }

        const currentProvider = settings.aiProvider || 'ollama'
        if (currentProvider === 'openrouter') {
            return {
                model: providerInfo.model,
                provider: 'openrouter',
                apiKey: providerInfo.apiKey!,
            }
        }

        const selectedModelClean = providerInfo.model.replace(':free', '')
        return {
            model: selectedModelClean,
            provider: currentProvider,
            apiKey: providerInfo.apiKey!,
        }
    }, [settings])

    // Recursive function to handle AI turn
    const processTurn = useCallback(
        async (
            currentMessages: any[],
            currentModel: any,
            provider: any,
            apiKey: any
        ) => {
            let currentContent = ''
            const currentToolCalls: ToolCallState[] = []

            // Cleanup old resolvers
            confirmationResolvers.current = {}

            // Create placeholder for assistant message
            const assistantId = (Date.now() + Math.random()).toString()
            const assistantMessage: Message = {
                id: assistantId,
                role: 'assistant',
                content: '',
                timestamp: new Date(),
                toolCalls: [],
            }

            // Update UI with empty assistant message to show thinking
            // Note: we don't add it to 'messages' yet to prevent flicker, we use streaming states

            const providerConfig = {
                provider,
                apiKey,
                enabled: true,
                defaultModel: currentModel,
                baseUrl: (settings as any).ollama?.baseUrl,
            }

            try {
                const stream = streamAIResponseWithTools(
                    providerConfig,
                    currentMessages, // @ts-ignore
                    {
                        tools: AI_TOOLS,
                        maxToolCalls: 50,
                        signal: abortControllerRef.current?.signal,
                    }
                )

                // 1. Stream the response (Text + Tool Calls)
                for await (const chunk of stream) {
                    if (abortControllerRef.current?.signal.aborted)
                        throw new Error('Aborted')

                    if (chunk.type === 'text') {
                        const text = chunk.content || ''
                        currentContent += text

                        // Robust Plan Parsing
                        const planStart = currentContent.indexOf('<plan>')
                        const planEnd = currentContent.indexOf('</plan>')

                        let visibleContent = currentContent

                        if (planStart !== -1) {
                            if (planEnd !== -1) {
                                // Plan is complete
                                const planContent = currentContent.substring(
                                    planStart + 6,
                                    planEnd
                                )
                                setCurrentPlan(planContent.trim())
                                // Remove plan block from visible chat
                                visibleContent =
                                    currentContent.substring(0, planStart) +
                                    currentContent.substring(planEnd + 7)
                            } else {
                                // Plan is streaming...
                                const partialPlan = currentContent.substring(
                                    planStart + 6
                                )
                                setCurrentPlan(partialPlan.trim())
                                // Hide plan streaming from chat
                                visibleContent = currentContent.substring(
                                    0,
                                    planStart
                                )
                            }
                        }

                        // Regex to find potential JSON objects. This is a heuristic.
                        // Matches { "name": "...", "arguments": ... } across lines
                        const jsonToolRegexCheck =
                            /\{\s*"name"\s*:\s*"[^"]+"\s*,\s*"arguments"\s*:\s*\{[\s\S]*?\}\s*\}/g
                        let match

                        // We iterate to find all matches in the current content
                        while (
                            (match =
                                jsonToolRegexCheck.exec(currentContent)) !==
                            null
                        ) {
                            try {
                                const jsonStr = match[0]
                                const parsed = JSON.parse(jsonStr)

                                if (parsed.name && parsed.arguments) {
                                    // It's a valid tool call!
                                    // De-duplication: check if we already have this exact tool call
                                    const alreadyExists = currentToolCalls.some(
                                        (tc) =>
                                            tc.name === parsed.name &&
                                            JSON.stringify(tc.arguments) ===
                                                JSON.stringify(parsed.arguments)
                                    )

                                    if (!alreadyExists) {
                                        const toolCallId = `call_${Date.now()}_${Math.random()
                                            .toString(36)
                                            .substr(2, 9)}`
                                        const newToolCall: ToolCallState = {
                                            id: toolCallId,
                                            name: parsed.name,
                                            arguments: parsed.arguments,
                                            isExecuting: false,
                                        }
                                        currentToolCalls.push(newToolCall)
                                        setPendingToolCalls([
                                            ...currentToolCalls,
                                        ])
                                    }

                                    // Remove the JSON string from visible content
                                    visibleContent = visibleContent
                                        .replace(jsonStr, '')
                                        .trim()
                                }
                            } catch (e) {
                                // Not valid JSON or partial JSON, ignore
                            }
                        }

                        // Also detect tool calls from standard Markdown code blocks
                        const markdownJsonRegex = /```json\s*(\{[\s\S]*?\})\s*```/g
                        let mdMatch
                        while (
                            (mdMatch =
                                markdownJsonRegex.exec(currentContent)) !== null
                        ) {
                            try {
                                const jsonStr = mdMatch[1]
                                const parsed = JSON.parse(jsonStr)

                                if (parsed.name && parsed.arguments) {
                                    const alreadyExists = currentToolCalls.some(
                                        (tc) =>
                                            tc.name === parsed.name &&
                                            JSON.stringify(tc.arguments) ===
                                                JSON.stringify(parsed.arguments)
                                    )

                                    if (!alreadyExists) {
                                        const toolCallId = `call_${Date.now()}_${Math.random()
                                            .toString(36)
                                            .substr(2, 9)}`
                                        const newToolCall: ToolCallState = {
                                            id: toolCallId,
                                            name: parsed.name,
                                            arguments: parsed.arguments,
                                            isExecuting: false,
                                        }
                                        currentToolCalls.push(newToolCall)
                                        setPendingToolCalls([
                                            ...currentToolCalls,
                                        ])
                                    }
                                }
                            } catch (e) {}
                        }

                        setStreamedText(visibleContent)
                    } else if (chunk.type === 'tool_call' && chunk.toolCall) {
                        const newToolCall: ToolCallState = {
                            id: chunk.toolCall.id,
                            name: chunk.toolCall.name,
                            arguments: chunk.toolCall.arguments,
                            isExecuting: false,
                        }
                        currentToolCalls.push(newToolCall)
                        setPendingToolCalls([...currentToolCalls])
                    } else if (chunk.type === 'error') {
                        currentContent += `\n\nError: ${chunk.error}`
                        setStreamedText(currentContent)
                    }
                }

                // 2. Finalize the assistant message in UI
                const finalizedAssistantMessage: Message = {
                    ...assistantMessage,
                    content: currentContent
                        .replace(/<plan>[\s\S]*?<\/plan>/g, '')
                        .trim(), // Clean content one last time
                    toolCalls: currentToolCalls,
                    plan: currentPlan || undefined,
                }

                // Add the completed message to the history
                setMessages((prev) => [...prev, finalizedAssistantMessage])

                // Reset streaming states
                setStreamedText('')
                setCurrentPlan(null)
                setPendingToolCalls([])

                // 3. If no tool calls, we are done
                if (currentToolCalls.length === 0) {
                    return
                }

                // 4. Executing Tools
                const toolResults = []

                for (const toolCall of currentToolCalls) {
                    try {
                        // Check for approval Requirement (Wait for User)
                        // Only require approval for DESTRUCTIVE operations:
                        // - edit_file: modifies existing code
                        // - delete_file: removes files
                        // - run_terminal_command: executes arbitrary commands
                        // NOTE: write_file (creating new files) does NOT require approval
                        if (
                            toolCall.name === 'edit_file' ||
                            toolCall.name === 'delete_file' ||
                            toolCall.name === 'run_terminal_command'
                        ) {
                            // Update UI to show WAITING state
                            setMessages((prev) =>
                                prev.map((m) => {
                                    if (m.id === assistantId && m.toolCalls) {
                                        return {
                                            ...m,
                                            toolCalls: m.toolCalls.map((tc) =>
                                                tc.id === toolCall.id
                                                    ? {
                                                          ...tc,
                                                          isExecuting: false,
                                                          needsApproval: true,
                                                      }
                                                    : tc
                                            ),
                                        }
                                    }
                                    return m
                                })
                            )

                            // Wait for User Confirmation
                            try {
                                const approved = await new Promise<boolean>(
                                    (resolve, reject) => {
                                        confirmationResolvers.current[
                                            toolCall.id
                                        ] = { resolve, reject }
                                    }
                                )

                                delete confirmationResolvers.current[
                                    toolCall.id
                                ]

                                if (!approved) {
                                    // User Rejected
                                    toolResults.push({
                                        id: toolCall.id,
                                        name: toolCall.name,
                                        result: 'User rejected',
                                        success: false,
                                    })

                                    // Update UI to Rejected
                                    setMessages((prev) =>
                                        prev.map((m) => {
                                            if (
                                                m.id === assistantId &&
                                                m.toolCalls
                                            ) {
                                                return {
                                                    ...m,
                                                    toolCalls: m.toolCalls.map(
                                                        (tc) =>
                                                            tc.id ===
                                                            toolCall.id
                                                                ? {
                                                                      ...tc,
                                                                      isExecuting:
                                                                          false,
                                                                      needsApproval:
                                                                          false,
                                                                      success:
                                                                          false,
                                                                      result: 'User rejected',
                                                                  }
                                                                : tc
                                                    ),
                                                }
                                            }
                                            return m
                                        })
                                    )
                                    continue // Skip execution
                                }
                            } catch (e) {
                                // Promise rejected (e.g. stop generation)
                                throw new Error('Aborted')
                            }
                        }

                        // Update UI to show execution started
                        setMessages((prev) =>
                            prev.map((m) => {
                                if (m.id === assistantId && m.toolCalls) {
                                    return {
                                        ...m,
                                        toolCalls: m.toolCalls.map((tc) =>
                                            tc.id === toolCall.id
                                                ? {
                                                      ...tc,
                                                      isExecuting: true,
                                                      needsApproval: false,
                                                  }
                                                : tc
                                        ),
                                    }
                                }
                                return m
                            })
                        )

                        const result = await executeToolCall(
                            {
                                id: toolCall.id,
                                name: toolCall.name,
                                arguments: toolCall.arguments,
                            },
                            rootPath || '',
                            dispatch,
                            { openFile, fileWasUpdated }
                        )

                        toolResults.push({
                            toolCallId: toolCall.id,
                            result: result.result,
                            name: toolCall.name,
                        })

                        setMessages((prev) =>
                            prev.map((m) => {
                                if (m.id === assistantId && m.toolCalls) {
                                    return {
                                        ...m,
                                        toolCalls: m.toolCalls.map((tc) =>
                                            tc.id === toolCall.id
                                                ? {
                                                      ...tc,
                                                      isExecuting: false,
                                                      success: result.success,
                                                      result: result.result,
                                                  }
                                                : tc
                                        ),
                                    }
                                }
                                return m
                            })
                        )
                    } catch (e: any) {
                        // Handle execution error
                        toolResults.push({
                            toolCallId: toolCall.id,
                            result: `Error: ${e.message}`,
                            name: toolCall.name,
                        })

                        setMessages((prev) =>
                            prev.map((m) => {
                                if (m.id === assistantId && m.toolCalls) {
                                    return {
                                        ...m,
                                        toolCalls: m.toolCalls.map((tc) =>
                                            tc.id === toolCall.id
                                                ? {
                                                      ...tc,
                                                      isExecuting: false,
                                                      success: false,
                                                      result: e.message,
                                                  }
                                                : tc
                                        ),
                                    }
                                }
                                return m
                            })
                        )
                    }
                }

                // 5. Construct History for Next Turn
                // Note: API needs pure message objects, not our UI Message type
                const nextMessages = [
                    ...currentMessages,
                    {
                        role: 'assistant',
                        content: currentContent || null, // Some providers require content to be null if tool_calls present
                        tool_calls: currentToolCalls.map((tc) => ({
                            id: tc.id,
                            type: 'function',
                            function: {
                                name: tc.name, // Must include arguments in history
                                arguments: JSON.stringify(tc.arguments),
                            },
                        })),
                    },
                    ...toolResults.map((tr) => ({
                        role: 'tool',
                        tool_call_id: tr.toolCallId,
                        name: tr.name,
                        content: tr.result,
                    })),
                ]

                // 6. Recursively call for next turn
                await processTurn(nextMessages, currentModel, provider, apiKey)
            } catch (error: any) {
                if (error.message === 'Aborted') throw error
                console.error('Error in processTurn:', error)
                setMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now().toString(),
                        role: 'assistant',
                        content: `System Error: ${error.message}`,
                        timestamp: new Date(),
                    },
                ])
            }
        },
        [
            rootPath,
            settings,
            setMessages,
            setStreamedText,
            setPendingToolCalls,
            dispatch,
        ]
    )

    // Send message
    const handleSend = useCallback(async () => {
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

        const updatedMessages = [...messages, userMessage]
        setMessages(updatedMessages)
        setInput('')
        setIsGenerating(true)
        setStreamedText('')
        setCurrentPlan(null)
        setPendingToolCalls([])

        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }
        abortControllerRef.current = new AbortController()

        try {
            const { model, provider, apiKey } = await getModelToUse()

            // Prepare Initial Messages with System Prompt
            // We need to construct the chain from scratch if we want to include the system prompt correctly for every request

            const contextMessage = `STARTING CONTEXT:
Project Root: ${rootPath || 'No folder open'}
Active File: ${activeFilePath || 'No file open'}
`
            const apiMessages = [
                { role: 'system', content: AI_SYSTEM_PROMPT },
                { role: 'system', content: contextMessage },
                ...updatedMessages.flatMap((m) => {
                    if (m.role === 'user') {
                        return [{ role: 'user', content: m.content }]
                    }

                    // For assistant messages, handle tool calls
                    const messages: any[] = []

                    const toolCalls = m.toolCalls?.map((tc) => ({
                        id: tc.id,
                        type: 'function',
                        function: {
                            name: tc.name, // Must include arguments in history
                            arguments: JSON.stringify(tc.arguments),
                        },
                    }))

                    messages.push({
                        role: 'assistant',
                        content: m.content || null,
                        tool_calls:
                            toolCalls && toolCalls.length > 0
                                ? toolCalls
                                : undefined,
                    })

                    // We also need to append the Tool Results if they exist in the UI state?
                    // The UI 'Message' type aggregates the result into `toolCalls[i].result`
                    // But the API expects separate 'tool' role messages following the assistant message.

                    if (m.toolCalls) {
                        m.toolCalls.forEach((tc) => {
                            if (tc.result || tc.success === false) {
                                // If result exists (even empty string if success) or failure
                                messages.push({
                                    role: 'tool',
                                    tool_call_id: tc.id,
                                    name: tc.name,
                                    content:
                                        tc.result ||
                                        (tc.success ? 'Success' : 'Failed'),
                                })
                            }
                        })
                    }

                    return messages
                }),
            ]

            await processTurn(apiMessages, model, provider, apiKey)
        } catch (error: any) {
            if (error.message !== 'Aborted') {
                const errorMessage = error.message || 'Failed to get response.'
                setMessages((prev) => [
                    ...prev,
                    {
                        id: (Date.now() + 1).toString(),
                        role: 'assistant',
                        content: `❌ Error: ${errorMessage}`,
                        timestamp: new Date(),
                    },
                ])
            }
        } finally {
            setIsGenerating(false)
            abortControllerRef.current = null
        }
    }, [
        input,
        isGenerating,
        isAIConfigured,
        messages,
        settings,
        getModelToUse,
        rootPath,
        dispatch,
        processTurn,
    ])

    // Handle keyboard shortcuts
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
            }
        },
        [handleSend]
    )

    // Clear chat
    const handleClearChat = useCallback(() => {
        setMessages([])
        setStreamedText('')
        setCurrentPlan(null)
        setPendingToolCalls([])
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            abortControllerRef.current = null
        }
        setIsGenerating(false)

        // Reject all pending confirmations to prevent memory leaks
        Object.values(confirmationResolvers.current).forEach((r) => {
            try {
                r.reject()
            } catch (e) {
                // Ignore rejection errors during cleanup
            }
        })
        confirmationResolvers.current = {}
    }, [])

    // Stop generation
    const handleStopGeneration = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            abortControllerRef.current = null
        }
        setIsGenerating(false)

        // Save whatever we have so far
        if (streamedText || pendingToolCalls.length > 0) {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: streamedText + ' [Stopped]',
                    timestamp: new Date(),
                    toolCalls: pendingToolCalls,
                },
            ])
        }

        setStreamedText('')
        setCurrentPlan(null)
        setPendingToolCalls([])

        // Reject all pending confirmations
        Object.values(confirmationResolvers.current).forEach((r) => r.reject())
        confirmationResolvers.current = {}
    }, [streamedText, pendingToolCalls])

    const handleToolApproval = useCallback(
        (toolId: string, approved: boolean) => {
            if (confirmationResolvers.current[toolId]) {
                confirmationResolvers.current[toolId].resolve(approved)
            }
        },
        []
    )

    // Close sidebar
    const handleClose = useCallback(() => {
        dispatch(ts.untriggerAICommandPalette())
    }, [dispatch])

    // Configure AI
    const handleConfigureAI = useCallback(() => {
        dispatch(setSettingsTab('AI'))
        dispatch(toggleSettings())
    }, [dispatch])

    // --- RENDER: Not Configured State ---
    if (!isAIConfigured) {
        return (
            <div className="ai-sidebar">
                {/* Header - matches filetree__project-header style */}
                <div
                    className="ai-sidebar__header"
                    style={{ borderTop: '1px solid var(--pane-border)' }}
                >
                    <div className="ai-sidebar__header-left">
                        <Codicon
                            name="sparkle"
                            style={{ color: 'var(--accent)', fontSize: '13px' }}
                        />
                        <span>AI Assistant</span>
                    </div>
                    <button
                        onClick={handleClose}
                        className="ai-sidebar__close-btn"
                        type="button"
                        title="Close AI Panel"
                    >
                        <Codicon name="close" />
                    </button>
                </div>

                {/* Not Configured State */}
                <div className="ai-sidebar__messages" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <div className="ai-sidebar__empty">
                        <div className="ai-sidebar__empty-icon">
                            <Codicon name="sparkle" style={{ fontSize: '28px', color: 'var(--accent)' }} />
                        </div>
                        <div className="ai-sidebar__empty-text">
                            <div className="ai-sidebar__empty-title">AI Not Configured</div>
                            <div className="ai-sidebar__empty-subtitle">
                                Configure an AI provider (Ollama, OpenAI, Claude, etc.) to start chatting.
                            </div>
                        </div>
                        <button
                            onClick={handleConfigureAI}
                            style={{
                                marginTop: '8px',
                                padding: '8px 20px',
                                backgroundColor: 'var(--accent)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '12px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'background-color 0.15s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
                            type="button"
                        >
                            Configure AI Provider
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // --- RENDER: Main Chat Interface ---
    return (
        <div className="ai-sidebar">
            {/* Header - mirrors filetree__project-header exactly */}
            <div
                className="ai-sidebar__header"
                style={{ borderTop: '1px solid var(--pane-border)' }}
            >
                <div className="ai-sidebar__header-left">
                    <Codicon
                        name="sparkle"
                        style={{ color: 'var(--accent)', fontSize: '13px' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.05em' }}>
                            {providerDisplayName.provider.toUpperCase()}
                        </span>
                        <span style={{
                            fontSize: '9px',
                            fontWeight: 400,
                            textTransform: 'none',
                            letterSpacing: 0,
                            color: 'var(--ui-fg-muted)',
                            opacity: 0.6,
                        }}>
                            {providerDisplayName.model}
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    {messages.length > 0 && (
                        <button
                            onClick={handleClearChat}
                            className="ai-sidebar__close-btn"
                            title="Clear Chat"
                            type="button"
                        >
                            <Codicon name="trash" style={{ fontSize: '11px' }} />
                        </button>
                    )}
                    <button
                        onClick={handleClose}
                        className="ai-sidebar__close-btn"
                        title="Close AI Panel (⌘L)"
                        type="button"
                    >
                        <Codicon name="close" style={{ fontSize: '12px' }} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="ai-sidebar__messages">
                {messages.length === 0 && (
                    <div className="ai-sidebar__empty">
                        <div className="ai-sidebar__empty-icon">
                            <Codicon name="sparkle" style={{ fontSize: '32px', color: 'var(--accent)' }} />
                        </div>
                        <div className="ai-sidebar__empty-text">
                            <div className="ai-sidebar__empty-title">AI Assistant</div>
                            <div className="ai-sidebar__empty-subtitle">
                                Ask anything about your code, get suggestions, or let AI edit files directly.
                            </div>
                        </div>
                        <div className="ai-quick-prompts">
                            {QUICK_PROMPTS.map((prompt) => (
                                <button
                                    key={prompt}
                                    className="ai-quick-prompt-chip"
                                    onClick={() => {
                                        setInput(prompt)
                                        setTimeout(() => textareaRef.current?.focus(), 50)
                                    }}
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((message) => (
                    <MessageBubble
                        key={message.id}
                        message={message}
                        onToolApproval={handleToolApproval}
                        onRetry={message.role === 'user' ? () => {
                            setInput(message.content)
                            setTimeout(() => textareaRef.current?.focus(), 50)
                        } : undefined}
                    />
                ))}

                {/* Streaming Content Display */}
                {isGenerating && (
                    <div className="ai-message">
                        <div className="assistant-message-container">
                            <div className="assistant-message-flow">
                                {/* Streaming Plan */}
                                {currentPlan && (
                                    <PlanCard planMarkdown={currentPlan} />
                                )}

                                <div className="ai-message__content">
                                    {/* Streaming tool calls */}
                                    {pendingToolCalls.length > 0 && (
                                        <div className="tool-calls-container">
                                            {pendingToolCalls.map((tc) => (
                                                <ToolCallCard
                                                    key={tc.id}
                                                    toolName={tc.name}
                                                    arguments={tc.arguments}
                                                    result={tc.result}
                                                    success={tc.success}
                                                    isExecuting={tc.isExecuting}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    <div className="markdown-container">
                                        {streamedText ? (
                                            <>
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        code({ node: _node, inline, className, children, ...props }: any) {
                                                            const match = /language-(\w+)/.exec(className || '')
                                                            const language = match ? match[1] : 'typescript'
                                                            const code = String(children).replace(/\n$/, '')
                                                            return !inline ? (
                                                                <CodeBlock code={code} language={language} />
                                                            ) : (
                                                                <code className={className} {...props}>{children}</code>
                                                            )
                                                        },
                                                    }}
                                                >
                                                    {streamedText}
                                                </ReactMarkdown>
                                                <TypingCursor />
                                            </>
                                        ) : (
                                            <div className="ai-thinking-state">
                                                <ThinkingDots />
                                                <span className="ai-thinking-label">Thinking</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area — full-width, flush bottom */}
            <div className="ai-sidebar__input-container">
                <div className="ai-sidebar__input-wrapper">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything... (Shift+Enter for new line)"
                        rows={1}
                        className="ai-sidebar__textarea"
                        disabled={isGenerating}
                    />
                    <div className="ai-sidebar__input-toolbar">
                        <div className="ai-sidebar__input-status">
                            {isGenerating ? (
                                <span className="ai-sidebar__generating-indicator">
                                    <ThinkingDots />
                                    <span>Generating...</span>
                                </span>
                            ) : null}
                        </div>
                        <div className="ai-sidebar__input-actions">
                            {isGenerating && (
                                <button
                                    onClick={handleStopGeneration}
                                    className="ai-sidebar__icon-btn ai-sidebar__stop-btn"
                                    title="Stop Generation"
                                    type="button"
                                >
                                    <Codicon name="close" />
                                </button>
                            )}
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isGenerating}
                                className={`ai-sidebar__icon-btn ai-sidebar__send-btn ${(!input.trim() || isGenerating) ? 'disabled' : ''}`}
                                title="Send Message (Enter)"
                                type="button"
                            >
                                <Codicon name="send" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
