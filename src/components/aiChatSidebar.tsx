/**
 * AIChatSidebar — Advanced Agentic AI Assistant
 * All styling via Tailwind utility classes.
 * Single unified message per AI turn (no fragmented bubbles).
 */
import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { Codicon } from './codicon'
import * as ts from '../features/tools/toolSlice'
import { getActiveProviderAPIKey } from '../features/ai/apiKeyUtils'
import { streamAIResponseWithTools } from '../features/ai/providersWithTools'
import { AI_TOOLS, AI_SYSTEM_PROMPT, executeToolCall } from '../features/ai/tools'
import { openFile, fileWasUpdated } from '../features/globalSlice'
import * as ssel from '../features/settings/settingsSelectors'
import { toggleSettings, setSettingsTab } from '../features/settings/settingsSlice'
import { getActiveFileId } from '../features/window/paneUtils'
import { getPathForFileId } from '../features/window/fileUtils'
import { FullState } from '../features/window/state'
import { CodeBlock, ToolCallCard, PlanCard } from './aiCodeBlock'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import '../styles/aiCodeBlock.css'

// ─── Quick prompts ──────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
    { label: 'Explain this file', icon: 'book' },
    { label: 'Find potential bugs', icon: 'bug' },
    { label: 'Add TypeScript types', icon: 'symbol-class' },
    { label: 'Write unit tests', icon: 'beaker' },
    { label: 'Refactor for readability', icon: 'wand' },
    { label: 'Optimize performance', icon: 'dashboard' },
]

// ─── Types ───────────────────────────────────────────────────────────────────
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

// ─── Shimmer Loader ───────────────────────────────────────────────────────────
function ShimmerLoader({ label }: { label?: string }) {
    return (
        <div className="flex flex-col gap-1.5 py-2">
            {/* Sweeping shimmer bar */}
            <div
                className="h-0.5 rounded-full bg-[length:200%_100%] animate-shimmer"
                style={{
                    background: 'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--accent) 40%, transparent) 25%, var(--accent) 50%, color-mix(in srgb, var(--accent) 40%, transparent) 75%, transparent 100%)',
                    backgroundSize: '200% 100%',
                }}
            />
            {label && (
                <span className="text-[10px] text-ui-fg-muted opacity-60 italic tracking-wide">
                    {label}
                </span>
            )}
        </div>
    )
}

// ─── Typing cursor ────────────────────────────────────────────────────────────
function TypingCursor() {
    return (
        <span
            className="inline-block w-0.5 h-3.5 rounded-sm bg-accent ml-0.5 align-text-bottom animate-blink"
            aria-hidden="true"
        />
    )
}

// ─── Markdown Renderer (stable — no re-render jitter) ────────────────────────
function AiMarkdown({ content }: { content: string }) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                code({ node: _n, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '')
                    const lang = match ? match[1] : 'plaintext'
                    const code = String(children).replace(/\n$/, '')
                    return !inline ? (
                        <CodeBlock code={code} language={lang} />
                    ) : (
                        <code
                            className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-ui-bg-elevated border border-ui-border text-ui-fg"
                            {...props}
                        >
                            {children}
                        </code>
                    )
                },
                a: ({ href, children, ...p }: any) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2 hover:opacity-75 transition-opacity" {...p}>{children}</a>
                ),
                p: ({ children }: any) => (
                    <p className="mb-2.5 last:mb-0 leading-relaxed text-[13px] text-ui-fg">{children}</p>
                ),
                ul: ({ children }: any) => (
                    <ul className="list-disc pl-5 mb-2.5 space-y-1 text-[13px] text-ui-fg">{children}</ul>
                ),
                ol: ({ children }: any) => (
                    <ol className="list-decimal pl-5 mb-2.5 space-y-1 text-[13px] text-ui-fg">{children}</ol>
                ),
                li: ({ children }: any) => <li className="leading-relaxed">{children}</li>,
                h1: ({ children }: any) => (
                    <h1 className="text-base font-bold mb-2 mt-3 text-ui-fg border-b border-ui-border pb-1.5">{children}</h1>
                ),
                h2: ({ children }: any) => (
                    <h2 className="text-[13px] font-bold mb-1.5 mt-3 text-ui-fg">{children}</h2>
                ),
                h3: ({ children }: any) => (
                    <h3 className="text-[12px] font-semibold mb-1 mt-2 text-ui-fg">{children}</h3>
                ),
                blockquote: ({ children }: any) => (
                    <blockquote className="border-l-[3px] border-accent pl-3 py-1 my-2 bg-[color:color-mix(in_srgb,var(--accent)_5%,transparent)] rounded-r text-ui-fg-muted italic text-[12px]">
                        {children}
                    </blockquote>
                ),
                table: ({ children }: any) => (
                    <div className="overflow-x-auto my-2 rounded border border-ui-border">
                        <table className="w-full border-collapse text-[12px]">{children}</table>
                    </div>
                ),
                thead: ({ children }: any) => (
                    <thead className="bg-ui-bg-elevated">{children}</thead>
                ),
                th: ({ children }: any) => (
                    <th className="px-3 py-1.5 text-left font-semibold text-[11px] uppercase tracking-wide text-ui-fg-muted border-b border-ui-border">{children}</th>
                ),
                td: ({ children }: any) => (
                    <td className="px-3 py-1.5 text-ui-fg border-b border-ui-border">{children}</td>
                ),
                tr: ({ children }: any) => (
                    <tr className="hover:bg-ui-hover transition-colors">{children}</tr>
                ),
                hr: () => <hr className="border-ui-border my-3" />,
                strong: ({ children }: any) => <strong className="font-semibold text-ui-fg">{children}</strong>,
                em: ({ children }: any) => <em className="italic text-ui-fg-muted">{children}</em>,
                pre: ({ children }: any) => <>{children}</>,
            }}
        >
            {content}
        </ReactMarkdown>
    )
}

// ─── Tool Calls Group ─────────────────────────────────────────────────────────
function ToolCallsGroup({
    toolCalls,
    onToolApproval,
    isStreaming,
}: {
    toolCalls: ToolCallState[]
    onToolApproval: (id: string, approved: boolean) => void
    isStreaming: boolean
}) {
    const [expanded, setExpanded] = useState(true)
    const pendingApproval = toolCalls.find(tc => tc.needsApproval)
    const runningTool = toolCalls.find(tc => tc.isExecuting)
    const doneCount = toolCalls.filter(tc => tc.success !== undefined).length
    const totalCount = toolCalls.length
    const allDone = doneCount === totalCount && totalCount > 0

    useEffect(() => {
        if (pendingApproval) setExpanded(true)
    }, [pendingApproval])

    const borderClass = pendingApproval
        ? 'border-warn/40 shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-warning)_12%,transparent)]'
        : 'border-ui-border'

    const statusIcon = runningTool ? (
        <Codicon name="loading" className="codicon-modifier-spin" style={{ fontSize: 11, color: 'var(--accent)' }} />
    ) : pendingApproval ? (
        <Codicon name="shield" style={{ fontSize: 11, color: 'var(--color-warning)' }} />
    ) : allDone ? (
        <Codicon name="check-all" style={{ fontSize: 11, color: 'var(--color-success)' }} />
    ) : (
        <Codicon name="tools" style={{ fontSize: 11, color: 'var(--ui-fg-muted)' }} />
    )

    const headerLabel = runningTool
        ? `Running ${runningTool.name.replace(/_/g, ' ')}…`
        : pendingApproval
        ? 'Approval required'
        : allDone
        ? `${totalCount} action${totalCount !== 1 ? 's' : ''} completed`
        : `${totalCount} action${totalCount !== 1 ? 's' : ''}`

    return (
        <div className={`rounded-md border ${borderClass} overflow-hidden mb-2 transition-[border-color] duration-200`}>
            <button
                className="flex items-center gap-2 w-full px-2.5 py-1.5 text-left hover:bg-ui-hover transition-colors"
                onClick={() => setExpanded(e => !e)}
            >
                <span className="w-4 flex items-center justify-center shrink-0">{statusIcon}</span>
                <span className="text-[11px] font-medium text-ui-fg flex-1">{headerLabel}</span>
                <div className="flex items-center gap-2 shrink-0">
                    {isStreaming && runningTool && (
                        <div
                            className="w-7 h-0.5 rounded-full animate-shimmer-fast"
                            style={{
                                background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
                                backgroundSize: '200% 100%',
                            }}
                        />
                    )}
                    <span className="text-[10px] text-ui-fg-muted opacity-60 font-mono">{doneCount}/{totalCount}</span>
                    <Codicon name={expanded ? 'chevron-up' : 'chevron-down'} style={{ fontSize: 10, opacity: 0.5 }} />
                </div>
            </button>
            {expanded && (
                <div className="border-t border-ui-border divide-y divide-ui-border/50">
                    {toolCalls.map(tc => (
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
        </div>
    )
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({
    message,
    onToolApproval,
    onRetry,
    isStreaming = false,
    streamedText = '',
    pendingToolCalls = [],
    currentPlan,
}: {
    message: Message
    onToolApproval: (id: string, approved: boolean) => void
    onRetry?: () => void
    isStreaming?: boolean
    streamedText?: string
    pendingToolCalls?: ToolCallState[]
    currentPlan?: string | null
}) {
    const [copied, setCopied] = useState(false)
    const isUser = message.role === 'user'

    const handleCopy = async () => {
        const text = isStreaming ? streamedText : message.content
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const toolsToRender = isStreaming ? pendingToolCalls : (message.toolCalls ?? [])
    const contentToRender = isStreaming ? streamedText : message.content
    const planToRender = isStreaming ? currentPlan : message.plan
    const doneTools = toolsToRender.filter(tc => tc.success !== undefined).length
    const totalTools = toolsToRender.length

    /* ── User message ────────────────────────────────────────────────── */
    if (isUser) {
        return (
            <div className="group flex justify-end mb-4">
                <div className="max-w-[88%]">
                    <div className="bg-ui-bg-elevated border border-ui-border rounded-lg px-3.5 py-2.5 text-[13px] text-ui-fg leading-relaxed whitespace-pre-wrap break-words">
                        {message.content}
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] font-mono text-ui-fg-muted opacity-50">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </span>
                        {onRetry && (
                            <button
                                className="flex items-center justify-center w-5 h-5 rounded hover:bg-ui-hover text-ui-fg-muted hover:text-ui-fg transition-colors"
                                onClick={onRetry}
                                title="Edit and resend"
                            >
                                <Codicon name="edit" style={{ fontSize: 10 }} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    /* ── Assistant message ───────────────────────────────────────────── */
    return (
        <div className="group mb-5">
            {/* Header row */}
            <div className="flex items-center gap-2 mb-2">
                <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-accent border"
                    style={{
                        background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
                        borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)',
                    }}
                >
                    <Codicon name="sparkle" style={{ fontSize: 10 }} />
                </div>
                <span className="text-[11px] font-medium text-ui-fg-muted opacity-60">Assistant</span>

                {totalTools > 0 && (
                    <div
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-accent text-[9px] font-semibold border"
                        style={{
                            background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
                            borderColor: 'color-mix(in srgb, var(--accent) 20%, transparent)',
                        }}
                    >
                        <Codicon name="tools" style={{ fontSize: 9 }} />
                        <span>{isStreaming ? `${doneTools}/${totalTools}` : totalTools}</span>
                    </div>
                )}

                {isStreaming && (
                    <div className="ml-auto">
                        <span
                            className="block w-1.5 h-1.5 rounded-full bg-accent animate-live-dot"
                            style={{ boxShadow: '0 0 6px var(--accent)' }}
                        />
                    </div>
                )}
            </div>

            {/* Content area */}
            <div className="pl-7">
                {/* Plan card */}
                {planToRender && <PlanCard planMarkdown={planToRender} />}

                {/* Tool calls group */}
                {toolsToRender.length > 0 && (
                    <ToolCallsGroup
                        toolCalls={toolsToRender}
                        onToolApproval={onToolApproval}
                        isStreaming={isStreaming}
                    />
                )}

                {/* Text content */}
                {contentToRender ? (
                    <div className="text-[13px] text-ui-fg leading-relaxed">
                        <AiMarkdown content={contentToRender} />
                        {isStreaming && <TypingCursor />}
                    </div>
                ) : isStreaming ? (
                    <ShimmerLoader label={
                        toolsToRender.some(tc => tc.isExecuting)
                            ? `Running ${toolsToRender.find(tc => tc.isExecuting)?.name?.replace(/_/g, ' ')}…`
                            : totalTools > 0 && doneTools === totalTools
                            ? 'Synthesizing results…'
                            : 'Thinking…'
                    } />
                ) : null}

                {/* Footer */}
                {!isStreaming && (contentToRender || toolsToRender.length > 0) && (
                    <div className="flex items-center justify-end gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] font-mono text-ui-fg-muted opacity-50">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </span>
                        {contentToRender && (
                            <button
                                className="flex items-center justify-center w-5 h-5 rounded hover:bg-ui-hover text-ui-fg-muted hover:text-ui-fg transition-colors"
                                onClick={handleCopy}
                                title={copied ? 'Copied!' : 'Copy response'}
                            >
                                <Codicon name={copied ? 'check' : 'copy'} style={{ fontSize: 10 }} />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AIChatSidebar() {
    const dispatch = useAppDispatch()
    const settings = useAppSelector(ssel.getSettings)
    const rootPath = useAppSelector((state: FullState) => state.global.rootPath)
    const aiSidebarOpen = useAppSelector(
        (state: FullState) => state.toolState?.aiCommandPaletteTriggered
    )
    const activeFileId = useAppSelector((state: FullState) =>
        getActiveFileId(state.global)
    )
    const activeFilePath = useAppSelector((state: FullState) =>
        activeFileId ? getPathForFileId(state.global, activeFileId) : null
    )

    // ── State ────────────────────────────────────────────────────────────────
    const [messages, setMessages] = useState<Message[]>([])
    const [currentPlan, setCurrentPlan] = useState<string | null>(null)
    const [input, setInput] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [streamedText, setStreamedText] = useState('')
    const [pendingToolCalls, setPendingToolCalls] = useState<ToolCallState[]>([])

    // ── Refs ─────────────────────────────────────────────────────────────────
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const abortControllerRef = useRef<AbortController | null>(null)
    const confirmationResolvers = useRef<Record<string, { resolve: (v: boolean) => void; reject: () => void }>>({})

    // KEY ARCHITECTURE: single message ID + accumulated state persist across recursive turns
    const activeAssistantIdRef = useRef<string | null>(null)
    const accumulatedToolCallsRef = useRef<ToolCallState[]>([])
    // STREAMING BUG FIX: store ONLY completed-turn text; current-turn text is local
    const completedTurnTextRef = useRef<string>('')

    // ── Computed ─────────────────────────────────────────────────────────────
    const isAIConfigured = useMemo(() => {
        const p = settings.aiProvider
        if (p === 'openai') return !!(settings.useOpenAIKey && settings.openAIKey)
        if (p === 'openrouter') return !!(settings.useOpenRouterKey && settings.openRouterKey)
        if (p === 'gemini') return !!(settings.useGeminiKey && settings.geminiKey)
        if (p === 'claude') return !!(settings.useClaudeKey && settings.claudeKey)
        if (p === 'ollama') return true
        return false
    }, [settings])

    const providerInfo = useMemo(() => {
        const p = settings.aiProvider || 'ollama'
        const model =
            p === 'openai' ? settings.openAIModel
            : p === 'openrouter' ? settings.openRouterModel
            : p === 'gemini' ? settings.geminiModel
            : p === 'claude' ? settings.claudeModel
            : settings.ollamaModel || 'llama3'
        return { provider: p.charAt(0).toUpperCase() + p.slice(1), model: model || 'Default' }
    }, [settings])

    // ── Effects ───────────────────────────────────────────────────────────────
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, streamedText, pendingToolCalls])

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
        }
    }, [input])

    useEffect(() => {
        if (aiSidebarOpen && textareaRef.current) {
            if ((window as any).__codexChatQuery) {
                const query = (window as any).__codexChatQuery
                delete (window as any).__codexChatQuery
                setInput(query)
                setTimeout(() => { if (query.trim() && !isGenerating) handleSend() }, 300)
            } else {
                setTimeout(() => textareaRef.current?.focus(), 100)
            }
        }
    }, [aiSidebarOpen])

    // ── Model ─────────────────────────────────────────────────────────────────
    const getModelToUse = useCallback(async () => {
        const info = await getActiveProviderAPIKey(settings)
        if (!info) return { model: 'llama3', provider: 'ollama', apiKey: 'ollama' }
        const p = settings.aiProvider || 'ollama'
        if (p === 'openrouter') return { model: info.model, provider: 'openrouter', apiKey: info.apiKey! }
        return { model: info.model.replace(':free', ''), provider: p, apiKey: info.apiKey! }
    }, [settings])

    // ── THE CORE FIX: processTurn updates the single message, NEVER creates new ones ──
    const processTurn = useCallback(
        async (currentMessages: any[], currentModel: any, provider: any, apiKey: any) => {
            // Text for THIS turn only (reset per recursive call)
            let thisTurnText = ''
            const thisTurnToolCalls: ToolCallState[] = []

            const providerConfig = {
                provider, apiKey, enabled: true, defaultModel: currentModel,
                baseUrl: (settings as any).ollama?.baseUrl,
            }

            try {
                const stream = streamAIResponseWithTools(
                    providerConfig,
                    currentMessages,
                    // @ts-ignore
                    { tools: AI_TOOLS, maxToolCalls: 50, signal: abortControllerRef.current?.signal }
                )

                for await (const chunk of stream) {
                    if (abortControllerRef.current?.signal.aborted) throw new Error('Aborted')

                    if (chunk.type === 'text') {
                        const text = chunk.content || ''
                        thisTurnText += text

                        // Plan extraction
                        const ps = thisTurnText.indexOf('<plan>')
                        const pe = thisTurnText.indexOf('</plan>')
                        let visibleText = thisTurnText

                        if (ps !== -1) {
                            if (pe !== -1) {
                                setCurrentPlan(thisTurnText.substring(ps + 6, pe).trim())
                                visibleText = (thisTurnText.substring(0, ps) + thisTurnText.substring(pe + 7)).trim()
                            } else {
                                setCurrentPlan(thisTurnText.substring(ps + 6).trim())
                                visibleText = thisTurnText.substring(0, ps)
                            }
                        }

                        // STREAMING FIX: display = completed previous turns + THIS turn text only
                        // NO accumulation during streaming — visibleText is the full current turn state
                        const previousText = completedTurnTextRef.current
                        const display = previousText ? `${previousText}\n\n${visibleText}` : visibleText
                        setStreamedText(display)

                    } else if (chunk.type === 'tool_call' && chunk.toolCall) {
                        const tc: ToolCallState = {
                            id: chunk.toolCall.id,
                            name: chunk.toolCall.name,
                            arguments: chunk.toolCall.arguments,
                            isExecuting: false,
                        }
                        thisTurnToolCalls.push(tc)
                        accumulatedToolCallsRef.current = [...accumulatedToolCallsRef.current, tc]
                        setPendingToolCalls([...accumulatedToolCallsRef.current])

                    } else if (chunk.type === 'error') {
                        thisTurnText += `\n\nError: ${chunk.error}`
                        const prev = completedTurnTextRef.current
                        setStreamedText(prev ? `${prev}\n\n${thisTurnText}` : thisTurnText)
                    }
                }

                // ── Turn complete: no tool calls → finalize single message ──
                if (thisTurnToolCalls.length === 0) {
                    const cleanThisTurn = thisTurnText.replace(/<plan>[\s\S]*?<\/plan>/g, '').trim()
                    const finalContent = completedTurnTextRef.current
                        ? cleanThisTurn ? `${completedTurnTextRef.current}\n\n${cleanThisTurn}` : completedTurnTextRef.current
                        : cleanThisTurn

                    setMessages(prev => prev.map(m =>
                        m.id === activeAssistantIdRef.current
                            ? { ...m, content: finalContent, toolCalls: accumulatedToolCallsRef.current, plan: currentPlan || undefined }
                            : m
                    ))

                    setStreamedText('')
                    setCurrentPlan(null)
                    setPendingToolCalls([])
                    completedTurnTextRef.current = ''
                    return
                }

                // ── Has tool calls: store this turn's visited text, then execute tools ──
                const cleanThisTurn = thisTurnText.replace(/<plan>[\s\S]*?<\/plan>/g, '').trim()
                if (cleanThisTurn) {
                    completedTurnTextRef.current = completedTurnTextRef.current
                        ? `${completedTurnTextRef.current}\n\n${cleanThisTurn}`
                        : cleanThisTurn
                }

                const toolResults: any[] = []
                for (const toolCall of thisTurnToolCalls) {
                    try {
                        // Destructive ops need approval
                        if (['edit_file', 'delete_file', 'run_terminal_command'].includes(toolCall.name)) {
                            accumulatedToolCallsRef.current = accumulatedToolCallsRef.current.map(tc =>
                                tc.id === toolCall.id ? { ...tc, needsApproval: true } : tc
                            )
                            setPendingToolCalls([...accumulatedToolCallsRef.current])

                            try {
                                const approved = await new Promise<boolean>((resolve, reject) => {
                                    confirmationResolvers.current[toolCall.id] = { resolve, reject }
                                })
                                delete confirmationResolvers.current[toolCall.id]

                                if (!approved) {
                                    accumulatedToolCallsRef.current = accumulatedToolCallsRef.current.map(tc =>
                                        tc.id === toolCall.id ? { ...tc, needsApproval: false, success: false, result: 'Rejected by user' } : tc
                                    )
                                    setPendingToolCalls([...accumulatedToolCallsRef.current])
                                    toolResults.push({ toolCallId: toolCall.id, result: 'User rejected', name: toolCall.name })
                                    continue
                                }
                            } catch {
                                throw new Error('Aborted')
                            }
                        }

                        // Mark executing
                        accumulatedToolCallsRef.current = accumulatedToolCallsRef.current.map(tc =>
                            tc.id === toolCall.id ? { ...tc, isExecuting: true, needsApproval: false } : tc
                        )
                        setPendingToolCalls([...accumulatedToolCallsRef.current])

                        const result = await executeToolCall(
                            { id: toolCall.id, name: toolCall.name, arguments: toolCall.arguments },
                            rootPath || '',
                            dispatch,
                            { openFile, fileWasUpdated }
                        )

                        toolResults.push({ toolCallId: toolCall.id, result: result.result, name: toolCall.name })
                        accumulatedToolCallsRef.current = accumulatedToolCallsRef.current.map(tc =>
                            tc.id === toolCall.id ? { ...tc, isExecuting: false, success: result.success, result: result.result } : tc
                        )
                        setPendingToolCalls([...accumulatedToolCallsRef.current])
                    } catch (e: any) {
                        toolResults.push({ toolCallId: toolCall.id, result: `Error: ${e.message}`, name: toolCall.name })
                        accumulatedToolCallsRef.current = accumulatedToolCallsRef.current.map(tc =>
                            tc.id === toolCall.id ? { ...tc, isExecuting: false, success: false, result: e.message } : tc
                        )
                        setPendingToolCalls([...accumulatedToolCallsRef.current])
                    }
                }

                // Build next turn
                const nextMessages = [
                    ...currentMessages,
                    {
                        role: 'assistant',
                        content: thisTurnText || null,
                        tool_calls: thisTurnToolCalls.map(tc => ({
                            id: tc.id, type: 'function',
                            function: { name: tc.name, arguments: JSON.stringify(tc.arguments) },
                        })),
                    },
                    ...toolResults.map(tr => ({
                        role: 'tool', tool_call_id: tr.toolCallId, name: tr.name, content: tr.result,
                    })),
                ]

                // Recurse — same activeAssistantIdRef, same accumulated refs
                await processTurn(nextMessages, currentModel, provider, apiKey)

            } catch (error: any) {
                if (error.message === 'Aborted') throw error
                console.error('processTurn error:', error)
                setMessages(prev => prev.map(m =>
                    m.id === activeAssistantIdRef.current
                        ? { ...m, content: (m.content ? m.content + '\n\n' : '') + `**Error:** ${error.message}` }
                        : m
                ))
            }
        },
        [rootPath, settings, dispatch, currentPlan]
    )

    // ── Send ─────────────────────────────────────────────────────────────────
    const handleSend = useCallback(async () => {
        if (!input.trim() || isGenerating) return
        if (!isAIConfigured) {
            dispatch(setSettingsTab('AI'))
            dispatch(toggleSettings())
            return
        }

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        }

        // Create the ONE assistant placeholder for the entire response
        const assistantId = `${Date.now() + 1}`
        activeAssistantIdRef.current = assistantId
        accumulatedToolCallsRef.current = []
        completedTurnTextRef.current = ''

        const placeholder: Message = {
            id: assistantId,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            toolCalls: [],
        }

        const updatedMessages = [...messages, userMsg, placeholder]
        setMessages(updatedMessages)
        setInput('')
        setIsGenerating(true)
        setStreamedText('')
        setCurrentPlan(null)
        setPendingToolCalls([])

        if (abortControllerRef.current) abortControllerRef.current.abort()
        abortControllerRef.current = new AbortController()

        try {
            const { model, provider, apiKey } = await getModelToUse()

            const context = `CONTEXT:\nProject Root: ${rootPath || 'No folder open'}\nActive File: ${activeFilePath || 'No file open'}`
            const apiMessages = [
                { role: 'system', content: AI_SYSTEM_PROMPT },
                { role: 'system', content: context },
                ...messages.flatMap((m): any[] => {
                    if (m.role === 'user') return [{ role: 'user', content: m.content }]
                    const msgs: any[] = []
                    const tcs = m.toolCalls?.map(tc => ({
                        id: tc.id, type: 'function',
                        function: { name: tc.name, arguments: JSON.stringify(tc.arguments) },
                    }))
                    msgs.push({ role: 'assistant', content: m.content || null, tool_calls: tcs?.length ? tcs : undefined })
                    m.toolCalls?.forEach(tc => {
                        if (tc.result !== undefined) {
                            msgs.push({ role: 'tool', tool_call_id: tc.id, name: tc.name, content: tc.result || (tc.success ? 'Success' : 'Failed') })
                        }
                    })
                    return msgs
                }),
                { role: 'user', content: userMsg.content },
            ]

            await processTurn(apiMessages, model, provider, apiKey)
        } catch (error: any) {
            if (error.message !== 'Aborted') {
                setMessages(prev => prev.map(m =>
                    m.id === assistantId
                        ? { ...m, content: `**Error:** ${error.message || 'Failed to get response.'}` }
                        : m
                ))
            }
        } finally {
            setIsGenerating(false)
            setStreamedText('')
            setCurrentPlan(null)
            setPendingToolCalls([])
            completedTurnTextRef.current = ''
            abortControllerRef.current = null
        }
    }, [input, isGenerating, isAIConfigured, messages, getModelToUse, rootPath, activeFilePath, dispatch, processTurn])

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
    }, [handleSend])

    const handleClearChat = useCallback(() => {
        setMessages([])
        setStreamedText('')
        setCurrentPlan(null)
        setPendingToolCalls([])
        completedTurnTextRef.current = ''
        accumulatedToolCallsRef.current = []
        if (abortControllerRef.current) { abortControllerRef.current.abort(); abortControllerRef.current = null }
        setIsGenerating(false)
        Object.values(confirmationResolvers.current).forEach(r => { try { r.reject() } catch {} })
        confirmationResolvers.current = {}
    }, [])

    const handleStopGeneration = useCallback(() => {
        if (abortControllerRef.current) { abortControllerRef.current.abort(); abortControllerRef.current = null }
        setIsGenerating(false)
        if (activeAssistantIdRef.current) {
            const finalContent = completedTurnTextRef.current || streamedText
            setMessages(prev => prev.map(m =>
                m.id === activeAssistantIdRef.current
                    ? {
                        ...m,
                        content: finalContent.replace(/<plan>[\s\S]*?<\/plan>/g, '').trim() + ' *(stopped)*',
                        toolCalls: accumulatedToolCallsRef.current.length ? accumulatedToolCallsRef.current : m.toolCalls,
                    }
                    : m
            ))
        }
        setStreamedText('')
        setCurrentPlan(null)
        setPendingToolCalls([])
        completedTurnTextRef.current = ''
        Object.values(confirmationResolvers.current).forEach(r => r.reject())
        confirmationResolvers.current = {}
    }, [streamedText])

    const handleToolApproval = useCallback((toolId: string, approved: boolean) => {
        confirmationResolvers.current[toolId]?.resolve(approved)
    }, [])

    const handleClose = useCallback(() => dispatch(ts.untriggerAICommandPalette()), [dispatch])
    const handleConfigureAI = useCallback(() => {
        dispatch(setSettingsTab('AI'))
        dispatch(toggleSettings())
    }, [dispatch])

    const activeFileName = activeFilePath?.split('/').pop()

    // ── Shared header ─────────────────────────────────────────────────────────
    const Header = () => (
        <div
            className="flex items-center gap-2 px-3 h-10 shrink-0 border-b border-t border-ui-border"
            style={{ borderTopColor: 'var(--pane-border)' }}
        >
            {/* Icon */}
            <div
                className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-accent border"
                style={{
                    background: 'color-mix(in srgb, var(--accent) 14%, transparent)',
                    borderColor: 'color-mix(in srgb, var(--accent) 28%, transparent)',
                }}
            >
                <Codicon name="sparkle" style={{ fontSize: 11, color: 'var(--accent)' }} />
            </div>

            {/* Provider + model */}
            <div className="flex flex-col leading-none min-w-0">
                <span className="text-[10px] font-bold tracking-widest uppercase text-ui-fg">{providerInfo.provider}</span>
                <span className="text-[9px] text-ui-fg-muted opacity-50 truncate max-w-[90px]">{providerInfo.model}</span>
            </div>

            {/* Active file chip */}
            {activeFileName && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-ui-border bg-ui-bg-elevated text-[10px] text-ui-fg-muted max-w-[110px] overflow-hidden">
                    <Codicon name="file" style={{ fontSize: 9 }} />
                    <span className="truncate">{activeFileName}</span>
                </div>
            )}

            <div className="flex items-center gap-0.5 ml-auto">
                {messages.length > 0 && (
                    <button
                        className="w-6 h-6 flex items-center justify-center rounded hover:bg-ui-hover text-ui-fg-muted hover:text-ui-fg transition-colors"
                        onClick={handleClearChat}
                        title="New chat"
                    >
                        <Codicon name="add" style={{ fontSize: 11 }} />
                    </button>
                )}
                <button
                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-ui-hover text-ui-fg-muted hover:text-ui-fg transition-colors"
                    onClick={handleClose}
                    title="Close (⌘L)"
                >
                    <Codicon name="close" style={{ fontSize: 12 }} />
                </button>
            </div>
        </div>
    )

    // ── Not configured ────────────────────────────────────────────────────────
    if (!isAIConfigured) {
        return (
            <div className="ai-sidebar flex flex-col h-full w-full bg-sidebar">
                <Header />
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="flex flex-col items-center text-center gap-3 max-w-[240px] relative">
                        <div
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full pointer-events-none animate-glow-pulse"
                            style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--accent) 18%, transparent) 0%, transparent 70%)' }}
                        />
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center relative z-10 border"
                            style={{
                                background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
                                borderColor: 'color-mix(in srgb, var(--accent) 24%, transparent)',
                            }}
                        >
                            <Codicon name="sparkle" style={{ fontSize: 26, color: 'var(--accent)' }} />
                        </div>
                        <p className="text-sm font-bold text-ui-fg -tracking-wide">AI Not Configured</p>
                        <p className="text-[11px] text-ui-fg-muted opacity-60 leading-snug">
                            Connect an AI provider to start your agentic coding session.
                        </p>
                        <button
                            className="mt-1 px-5 py-2 bg-accent text-white text-[12px] font-semibold rounded-md hover:opacity-90 hover:-translate-y-px transition-all"
                            onClick={handleConfigureAI}
                        >
                            Configure AI Provider
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // ── Main chatbox ──────────────────────────────────────────────────────────
    const runningToolName = pendingToolCalls.find(tc => tc.isExecuting)?.name?.replace(/_/g, ' ')
    const genStatusText = runningToolName
        ? `Running ${runningToolName}…`
        : pendingToolCalls.length > 0
        ? 'Analyzing…'
        : 'Generating…'

    return (
        <div className="ai-sidebar flex flex-col h-full w-full bg-sidebar">
            <Header />

            {/* Messages */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-3 flex flex-col gap-0 min-h-0 [scrollbar-width:thin]">
                {/* Empty state */}
                {messages.length === 0 && (
                    <div className="flex flex-col items-center text-center gap-3 my-auto max-w-[260px] mx-auto relative py-8">
                        <div
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full pointer-events-none animate-glow-pulse"
                            style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--accent) 16%, transparent) 0%, transparent 70%)' }}
                        />
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center relative z-10 border"
                            style={{
                                background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
                                borderColor: 'color-mix(in srgb, var(--accent) 24%, transparent)',
                            }}
                        >
                            <Codicon name="sparkle" style={{ fontSize: 26, color: 'var(--accent)' }} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[14px] font-bold text-ui-fg -tracking-wide mb-1">AI Assistant</p>
                            <p className="text-[11px] text-ui-fg-muted opacity-60 leading-snug">
                                Reads files, runs commands, edits code, and thinks through complex multi-file tasks.
                            </p>
                        </div>
                        <div className="flex flex-col gap-1 w-full mt-1">
                            {QUICK_PROMPTS.map(({ label, icon }) => (
                                <button
                                    key={label}
                                    className="flex items-center gap-2 text-left px-3 py-2 rounded-md border border-ui-border bg-ui-bg-elevated text-[11px] text-ui-fg hover:border-accent hover:text-accent hover:translate-x-1 hover:bg-[color-mix(in_srgb,var(--accent)_6%,transparent)] transition-all"
                                    onClick={() => { setInput(label); setTimeout(() => textareaRef.current?.focus(), 50) }}
                                >
                                    <Codicon name={icon} style={{ fontSize: 11, opacity: 0.65 }} />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Message list */}
                {messages.map(message => {
                    const isStreamingThis = isGenerating && message.id === activeAssistantIdRef.current

                    // Skip empty placeholder visually when streaming state is rendering it
                    if (
                        !isStreamingThis &&
                        message.role === 'assistant' &&
                        !message.content &&
                        (!message.toolCalls || message.toolCalls.length === 0)
                    ) return null

                    return (
                        <MessageBubble
                            key={message.id}
                            message={message}
                            onToolApproval={handleToolApproval}
                            onRetry={message.role === 'user' ? () => {
                                setInput(message.content)
                                setTimeout(() => textareaRef.current?.focus(), 50)
                            } : undefined}
                            isStreaming={isStreamingThis}
                            streamedText={isStreamingThis ? streamedText : undefined}
                            pendingToolCalls={isStreamingThis ? pendingToolCalls : undefined}
                            currentPlan={isStreamingThis ? currentPlan : undefined}
                        />
                    )
                })}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-ui-border">
                {/* Progress bar */}
                {isGenerating && (
                    <div className="h-0.5 w-full overflow-hidden" style={{ background: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}>
                        <div
                            className="h-full w-2/5 rounded-full animate-progress"
                            style={{ background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }}
                        />
                    </div>
                )}
                <div className="p-3">
                    <div
                        className={`rounded-lg border overflow-hidden transition-all ${
                            isGenerating
                                ? 'border-[color-mix(in_srgb,var(--accent)_35%,transparent)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--accent)_10%,transparent)]'
                                : 'border-ui-border focus-within:border-[rgba(255,255,255,0.18)]'
                        }`}
                        style={{ background: 'var(--input-bg)' }}
                    >
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={isGenerating ? 'AI is working…' : 'Ask anything… (Shift+Enter for new line)'}
                            rows={1}
                            disabled={isGenerating}
                            className="w-full bg-transparent text-ui-fg text-[13px] font-mono px-3.5 py-2.5 resize-none outline-none border-none placeholder:text-ui-fg-muted placeholder:opacity-50 max-h-[200px] leading-relaxed"
                        />
                        <div className="flex items-center justify-between px-2.5 pb-2.5">
                            {/* Status */}
                            <div className="flex items-center gap-2 min-w-0">
                                {isGenerating && (
                                    <div className="flex items-center gap-1.5">
                                        <span
                                            className="block w-1.5 h-1.5 rounded-full bg-accent animate-live-dot shrink-0"
                                            style={{ boxShadow: '0 0 5px var(--accent)' }}
                                        />
                                        <span className="text-[10px] text-accent font-medium tracking-wide">{genStatusText}</span>
                                    </div>
                                )}
                            </div>
                            {/* Actions */}
                            <div className="flex items-center gap-1">
                                {isGenerating && (
                                    <button
                                        onClick={handleStopGeneration}
                                        className="w-7 h-7 flex items-center justify-center rounded border border-ui-border hover:border-danger/50 text-danger hover:bg-[color-mix(in_srgb,var(--color-error)_10%,transparent)] transition-all"
                                        title="Stop"
                                    >
                                        <Codicon name="square-filled" style={{ fontSize: 10 }} />
                                    </button>
                                )}
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isGenerating}
                                    className={`w-7 h-7 flex items-center justify-center rounded transition-all ${
                                        input.trim() && !isGenerating
                                            ? 'bg-accent text-white hover:opacity-85'
                                            : 'border border-ui-border text-ui-fg-muted opacity-40 cursor-not-allowed'
                                    }`}
                                    title="Send (Enter)"
                                >
                                    <Codicon name="send" style={{ fontSize: 12 }} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
