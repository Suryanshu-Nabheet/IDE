import { useState, useRef, useEffect } from 'react'
import { useAppDispatch } from '../app/hooks'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faPaperPlaneTop,
    faXmark,
    faSparkles,
    faCircleUser,
} from '@fortawesome/pro-regular-svg-icons'
import * as ts from '../features/tools/toolSlice'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

export function AIChatSidebar() {
    const dispatch = useAppDispatch()
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
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

    return (
        <div className="ai-sidebar">
            {/* Header */}
            <div className="ai-sidebar__header">
                <div className="ai-sidebar__header-left">
                    <FontAwesomeIcon icon={faSparkles} />
                    <span>AI Assistant</span>
                </div>
                <button
                    onClick={() => dispatch(ts.untriggerAICommandPalette())}
                    className="ai-sidebar__close-btn"
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
                                Start a conversation
                            </p>
                            <p className="ai-sidebar__empty-subtitle">
                                Ask me anything about your code
                            </p>
                        </div>
                    </div>
                )}

                {messages.map((message) => (
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
                                {message.content}
                            </div>
                            <div className="ai-message__timestamp">
                                {message.timestamp.toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </div>
                        </div>
                    </div>
                ))}

                {isGenerating && (
                    <div className="ai-message">
                        <div className="ai-message__avatar">
                            <FontAwesomeIcon icon={faSparkles} />
                        </div>
                        <div className="typing-indicator-vscode">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="ai-sidebar__input-wrapper">
                <div className="ai-sidebar__input-container">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask AI anything..."
                        className="ai-sidebar__textarea"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isGenerating}
                        className="ai-sidebar__send-btn"
                        style={{
                            backgroundColor:
                                input.trim() && !isGenerating
                                    ? 'var(--accent)'
                                    : 'var(--any-bg-lighter)',
                            opacity: input.trim() && !isGenerating ? 1 : 0.5,
                        }}
                    >
                        <FontAwesomeIcon icon={faPaperPlaneTop} />
                    </button>
                </div>
            </div>
        </div>
    )
}
