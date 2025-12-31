import { useState, useRef, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faPaperPlaneTop,
    faXmark,
    faSparkles,
    faCircleUser,
} from '@fortawesome/pro-regular-svg-icons'
import * as ts from '../features/tools/toolSlice'
import * as tsel from '../features/tools/toolSelectors'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

const MIN_WIDTH = 300
const MAX_WIDTH = 800
const DEFAULT_WIDTH = 420

export function AIChatSidebar() {
    const dispatch = useAppDispatch()
    const isOpen = useAppSelector(tsel.aiCommandPaletteTriggeredSelector)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [width, setWidth] = useState(DEFAULT_WIDTH)
    const [isResizing, setIsResizing] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height =
                Math.min(textareaRef.current.scrollHeight, 120) + 'px'
        }
    }, [input])

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return
            const newWidth = window.innerWidth - e.clientX
            if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
                setWidth(newWidth)
            }
        }

        const handleMouseUp = () => {
            setIsResizing(false)
        }

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isResizing])

    const handleSend = async () => {
        if (!input.trim() || isGenerating) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMessage])
        setInput('')
        setIsGenerating(true)

        setTimeout(() => {
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content:
                    "I'm your AI coding assistant. I can help you write, debug, and optimize code.",
                timestamp: new Date(),
            }
            setMessages((prev) => [...prev, aiMessage])
            setIsGenerating(false)
        }, 1000)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    if (!isOpen) return null

    const TITLEBAR_HEIGHT = 38
    const STATUS_BAR_HEIGHT = 22
    const TOP_POSITION = TITLEBAR_HEIGHT
    const BOTTOM_GAP = STATUS_BAR_HEIGHT + 2

    return (
        <>
            {/* Resize Handle */}
            <div
                onMouseDown={() => setIsResizing(true)}
                style={{
                    position: 'fixed',
                    right: `${width}px`,
                    top: `${TOP_POSITION}px`,
                    bottom: `${BOTTOM_GAP}px`,
                    width: '4px',
                    cursor: 'ew-resize',
                    zIndex: 31,
                    backgroundColor: isResizing
                        ? 'var(--accent)'
                        : 'transparent',
                    transition: 'background-color 0.1s ease',
                }}
                onMouseEnter={(e) => {
                    if (!isResizing) {
                        e.currentTarget.style.backgroundColor =
                            'var(--pane-border)'
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isResizing) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                    }
                }}
            />

            {/* Sidebar */}
            <div
                style={{
                    position: 'fixed',
                    right: 0,
                    top: `${TOP_POSITION}px`,
                    bottom: `${BOTTOM_GAP}px`,
                    width: `${width}px`,
                    backgroundColor: 'var(--sidebar-bg)',
                    borderLeft: '1px solid var(--pane-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 30,
                    overflow: 'hidden',
                }}
            >
                {/* Header */}
                <div
                    style={{
                        height: '35px',
                        minHeight: '35px',
                        maxHeight: '35px',
                        padding: '0 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: 'var(--sidebar-bg)',
                        borderBottom: '1px solid var(--pane-border)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                        color: 'var(--ui-fg)',
                        flexShrink: 0,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        <FontAwesomeIcon
                            icon={faSparkles}
                            style={{ fontSize: '11px' }}
                        />
                        <span>AI Assistant</span>
                    </div>
                    <button
                        onClick={() => dispatch(ts.untriggerAICommandPalette())}
                        style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '3px',
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--ui-fg)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            opacity: 0.7,
                            transition: 'all 0.1s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '1'
                            e.currentTarget.style.backgroundColor =
                                'var(--any-bg-lighter)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '0.7'
                            e.currentTarget.style.backgroundColor =
                                'transparent'
                        }}
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                {/* Messages */}
                <div
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        minHeight: 0,
                    }}
                    className="ai-chat-messages"
                >
                    {messages.length === 0 && (
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                gap: '12px',
                            }}
                        >
                            <div
                                style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '12px',
                                    backgroundColor: 'var(--any-bg-lighter)',
                                    border: '1px solid var(--pane-border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <FontAwesomeIcon
                                    icon={faSparkles}
                                    style={{
                                        fontSize: '28px',
                                        color: 'var(--ui-fg)',
                                        opacity: 0.5,
                                    }}
                                />
                            </div>
                            <div
                                style={{
                                    textAlign: 'center',
                                    maxWidth: '280px',
                                }}
                            >
                                <p
                                    style={{
                                        fontSize: '13px',
                                        color: 'var(--ui-fg)',
                                        marginBottom: '6px',
                                        fontWeight: 500,
                                    }}
                                >
                                    Start a conversation
                                </p>
                                <p
                                    style={{
                                        fontSize: '11px',
                                        color: 'var(--ui-fg)',
                                        opacity: 0.6,
                                        lineHeight: '1.5',
                                    }}
                                >
                                    Ask me anything about your code
                                </p>
                            </div>
                        </div>
                    )}

                    {messages.map((message) => (
                        <div
                            key={message.id}
                            style={{
                                display: 'flex',
                                gap: '12px',
                                alignItems: 'flex-start',
                            }}
                        >
                            <div
                                style={{
                                    width: '28px',
                                    height: '28px',
                                    minWidth: '28px',
                                    minHeight: '28px',
                                    borderRadius: '6px',
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'var(--any-bg-lighter)',
                                    border: '1px solid var(--pane-border)',
                                }}
                            >
                                <FontAwesomeIcon
                                    icon={
                                        message.role === 'user'
                                            ? faCircleUser
                                            : faSparkles
                                    }
                                    style={{
                                        color: 'var(--ui-fg)',
                                        fontSize: '14px',
                                    }}
                                />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                    style={{
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        backgroundColor:
                                            'var(--any-bg-lighter)',
                                        border: '1px solid var(--pane-border)',
                                        color: 'var(--ui-fg)',
                                        fontSize: '13px',
                                        lineHeight: '1.5',
                                        wordWrap: 'break-word',
                                        overflowWrap: 'break-word',
                                    }}
                                >
                                    {message.content}
                                </div>
                                <div
                                    style={{
                                        fontSize: '10px',
                                        color: 'var(--ui-fg)',
                                        opacity: 0.4,
                                        marginTop: '4px',
                                        paddingLeft: '2px',
                                    }}
                                >
                                    {message.timestamp.toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}

                    {isGenerating && (
                        <div
                            style={{
                                display: 'flex',
                                gap: '12px',
                                alignItems: 'flex-start',
                            }}
                        >
                            <div
                                style={{
                                    width: '28px',
                                    height: '28px',
                                    minWidth: '28px',
                                    minHeight: '28px',
                                    borderRadius: '6px',
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'var(--any-bg-lighter)',
                                    border: '1px solid var(--pane-border)',
                                }}
                            >
                                <FontAwesomeIcon
                                    icon={faSparkles}
                                    style={{
                                        color: 'var(--ui-fg)',
                                        fontSize: '14px',
                                    }}
                                />
                            </div>
                            <div
                                className="typing-indicator-vscode"
                                style={{ marginTop: '6px' }}
                            >
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div
                    style={{
                        borderTop: '1px solid var(--pane-border)',
                        padding: '12px',
                        backgroundColor: 'var(--sidebar-bg)',
                        flexShrink: 0,
                    }}
                >
                    <div
                        style={{
                            position: 'relative',
                            backgroundColor: 'var(--any-bg-lighter)',
                            borderRadius: '6px',
                            border: '1px solid var(--pane-border)',
                            transition: 'border-color 0.1s ease',
                        }}
                    >
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={(e) => {
                                const parent = e.currentTarget.parentElement
                                if (parent)
                                    parent.style.borderColor = 'var(--accent)'
                            }}
                            onBlur={(e) => {
                                const parent = e.currentTarget.parentElement
                                if (parent)
                                    parent.style.borderColor =
                                        'var(--pane-border)'
                            }}
                            placeholder="Ask AI anything..."
                            style={{
                                width: '100%',
                                minHeight: '36px',
                                maxHeight: '120px',
                                padding: '8px 44px 8px 12px',
                                border: 'none',
                                background: 'transparent',
                                color: 'var(--ui-fg)',
                                fontSize: '13px',
                                resize: 'none',
                                outline: 'none',
                                fontFamily: 'inherit',
                                lineHeight: '1.4',
                            }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isGenerating}
                            style={{
                                position: 'absolute',
                                right: '6px',
                                bottom: '6px',
                                width: '32px',
                                height: '32px',
                                borderRadius: '4px',
                                border: 'none',
                                backgroundColor:
                                    input.trim() && !isGenerating
                                        ? 'var(--accent)'
                                        : 'var(--any-bg-lighter)',
                                color:
                                    input.trim() && !isGenerating
                                        ? '#ffffff'
                                        : 'var(--ui-fg)',
                                cursor:
                                    input.trim() && !isGenerating
                                        ? 'pointer'
                                        : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity:
                                    input.trim() && !isGenerating ? 1 : 0.5,
                                transition: 'all 0.1s ease',
                            }}
                            onMouseEnter={(e) => {
                                if (input.trim() && !isGenerating) {
                                    e.currentTarget.style.opacity = '0.9'
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (input.trim() && !isGenerating) {
                                    e.currentTarget.style.opacity = '1'
                                }
                            }}
                        >
                            <FontAwesomeIcon
                                icon={faPaperPlaneTop}
                                style={{ fontSize: '13px' }}
                            />
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
