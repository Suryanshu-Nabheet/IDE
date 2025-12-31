import React, { useEffect, useRef, useState, useCallback, memo } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import { SearchAddon } from 'xterm-addon-search'
import 'xterm/css/xterm.css'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { FullState } from '../features/window/state'
import * as gs from '../features/globalSlice'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faPlus, faTerminal } from '@fortawesome/free-solid-svg-icons'
import { throttleCallback } from './componentUtils'

// --- Configuration ---

const THEME = {
    background: '#000000',
    foreground: '#d4d4d4',
    cursor: '#ffffff',
    selection: '#264f78',
    black: '#000000',
    red: '#cd3131',
    green: '#0dbc79',
    yellow: '#e5e510',
    blue: '#2472c8',
    magenta: '#bc3fbc',
    cyan: '#11a8cd',
    white: '#e5e5e5',
    brightBlack: '#666666',
    brightRed: '#f14c4c',
    brightGreen: '#23d18b',
    brightYellow: '#f5f543',
    brightBlue: '#3b8eea',
    brightMagenta: '#d670d6',
    brightCyan: '#29b8db',
    brightWhite: '#ffffff',
}

const FONT_OPTIONS = {
    fontFamily:
        "'JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace",
    fontSize: 13,
    lineHeight: 1.4,
    cursorBlink: true,
    cursorStyle: 'block' as const,
    allowTransparency: false,
}

// --- Types ---

interface Session {
    id: string
    title: string
    instance: Terminal
    fitAddon: FitAddon
}

// --- Sub-Components ---

/**
 * Renders the top tab bar for the terminal
 */
const TerminalTabs = memo(
    ({
        sessions,
        activeId,
        onSwitch,
        onClose,
        onCreate,
        onHide,
    }: {
        sessions: Session[]
        activeId: string | null
        onSwitch: (id: string) => void
        onClose: (id: string) => void
        onCreate: () => void
        onHide: () => void
    }) => {
        return (
            <div className="flex bg-[#111] h-9 border-b border-[#252525] items-center px-0 select-none">
                <div className="flex flex-1 overflow-x-auto no-scrollbar items-end pl-2">
                    {sessions.map((s) => (
                        <div
                            key={s.id}
                            onClick={() => onSwitch(s.id)}
                            className={`
                            flex items-center px-3 py-1.5 mr-1 text-xs cursor-pointer rounded-t-sm border-t-2 min-w-[120px] max-w-[200px] border-x border-x-transparent
                            transition-colors duration-75
                            ${
                                activeId === s.id
                                    ? 'bg-black text-white border-t-blue-500 border-x-[#252525]'
                                    : 'bg-[#1e1e1e] text-[#888] border-t-transparent hover:bg-[#252525] hover:text-[#ccc]'
                            }
                        `}
                        >
                            <FontAwesomeIcon
                                icon={faTerminal}
                                className={`mr-2 text-[10px] ${
                                    activeId === s.id
                                        ? 'text-blue-400'
                                        : 'opacity-50'
                                }`}
                            />
                            <span className="truncate flex-1 font-mono">
                                {s.title}
                            </span>
                            <div
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onClose(s.id)
                                }}
                                className="ml-2 w-5 h-5 flex items-center justify-center rounded hover:bg-[#333] text-transparent hover:text-white group-hover:text-gray-500 transition-all opacity-0 hover:opacity-100 group-hover:opacity-100"
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={onCreate}
                        className="flex items-center justify-center w-8 h-8 mb-0.5 text-[#888] hover:text-white transition-colors"
                        title="New Terminal"
                    >
                        <FontAwesomeIcon icon={faPlus} size="sm" />
                    </button>
                </div>

                <div className="flex items-center px-3 border-l border-[#333] h-full">
                    <button
                        onClick={onHide}
                        className="text-[#888] hover:text-white p-1 transition-colors"
                        title="Close Panel"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
            </div>
        )
    }
)

/**
 * Single Terminal Instance Wrapper
 * Handles layout fitting and attaching to DOM
 */
const TerminalInstance = ({
    session,
    isActive,
}: {
    session: Session
    isActive: boolean
}) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const attachedRef = useRef(false)

    // Attach xterm to DOM once
    useEffect(() => {
        if (containerRef.current && !attachedRef.current) {
            session.instance.open(containerRef.current)
            session.fitAddon.fit()
            attachedRef.current = true
        }
    }, [session])

    // Handle ResizeObserver for this specific instance
    useEffect(() => {
        if (!containerRef.current || !isActive) return

        const observer = new ResizeObserver(() => {
            // Debounce slightly to prevent thrashing
            requestAnimationFrame(() => {
                try {
                    session.fitAddon.fit()
                    const dims = session.fitAddon.proposeDimensions()
                    if (dims) {
                        connector.terminalResize(
                            session.id,
                            dims.cols,
                            dims.rows
                        )
                    }
                } catch (e) {
                    console.warn('Resize error', e)
                }
            })
        })

        observer.observe(containerRef.current)
        // Also fit immediately
        session.fitAddon.fit()
        session.instance.focus()

        return () => observer.disconnect()
    }, [isActive, session])

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 bg-black"
            style={{
                display: isActive ? 'block' : 'none',
                visibility: isActive ? 'visible' : 'hidden',
                zIndex: isActive ? 10 : 0,
                paddingLeft: '12px',
                paddingTop: '8px',
            }}
        />
    )
}

// --- Main Component ---

export const BottomTerminal: React.FC = () => {
    const dispatch = useAppDispatch()
    const isOpen = useAppSelector(
        (state: FullState) => state.global.terminalOpen
    ) // Redux State

    // Local State
    const [sessions, setSessions] = useState<Session[]>([])
    const [activeId, setActiveId] = useState<string | null>(null)
    const [height, setHeight] = useState(300)

    // Refs
    const creatingRef = useRef(false) // Lock for async creation

    // --- Actions ---

    const createNewSession = useCallback(async () => {
        if (creatingRef.current) return
        creatingRef.current = true

        try {
            // 1. Initialize XTerm
            const term = new Terminal({ theme: THEME, ...FONT_OPTIONS })
            const fitAddon = new FitAddon()
            const linkAddon = new WebLinksAddon((e, url) => {
                e.preventDefault()
                connector.terminalClickLink(url)
            })
            const searchAddon = new SearchAddon()

            term.loadAddon(fitAddon)
            term.loadAddon(linkAddon)
            term.loadAddon(searchAddon)

            // 2. Request Backend Session
            const { id, shell } = await connector.terminalCreate(80, 24)

            // 3. Setup Input Handling
            term.onData((data) => {
                connector.terminalInto(id, data)
            })

            const newSession: Session = {
                id,
                title: shell || 'Terminal',
                instance: term,
                fitAddon,
            }

            setSessions((prev) => [...prev, newSession])
            setActiveId(id)
        } catch (err) {
            console.error('Failed to create terminal:', err)
        } finally {
            creatingRef.current = false
        }
    }, [])

    const killSession = useCallback(
        async (id: string) => {
            await connector.terminalKill(id)
            setSessions((prev) => {
                const session = prev.find((s) => s.id === id)
                session?.instance.dispose()
                const next = prev.filter((s) => s.id !== id)
                return next
            })
            if (activeId === id) {
                setSessions((current) => {
                    const last = current[current.length - 1]
                    setActiveId(last ? last.id : null)
                    return current
                })
            }
        },
        [activeId]
    )

    // --- Effects ---

    // 1. Initial Creation
    useEffect(() => {
        if (isOpen && sessions.length === 0 && !creatingRef.current) {
            createNewSession()
        }
    }, [isOpen])

    // 2. Global Event Listener (Singleton)
    useEffect(() => {
        const onData = (_: any, { id, data }: { id: string; data: string }) => {
            setSessions((current) => {
                const session = current.find((s) => s.id === id)
                session?.instance.write(data)
                return current
            })
        }

        const onExit = (_: any, { id }: { id: string }) => {
            setSessions((current) => {
                const session = current.find((s) => s.id === id)
                session?.instance.dispose()
                const next = current.filter((s) => s.id !== id)
                // If we killed the active one, logic to switch handled in state update usually,
                // but here we might need to explicit switch if killSession wasn't called.
                return next
            })
            setActiveId((curr) => (curr === id ? null : curr))
        }

        connector.registerIncData(onData)
        connector.registerTerminalExited(onExit)

        return () => {
            connector.deregisterIncData(onData)
            connector.deregisterTerminalExited(onExit)
        }
    }, [])

    // 3. ShortCuts
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === '`') {
                dispatch(gs.toggleTerminal())
            }
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [dispatch])

    // --- Dragging Logic ---
    const [isDragging, setIsDragging] = useState(false)
    useEffect(() => {
        const handleMove = throttleCallback((e: MouseEvent) => {
            if (!isDragging) return
            const newHeight = window.innerHeight - e.clientY
            setHeight(
                Math.max(100, Math.min(newHeight, window.innerHeight - 50))
            )
        }, 10)
        const handleUp = () => setIsDragging(false)

        if (isDragging) {
            window.addEventListener('mousemove', handleMove)
            window.addEventListener('mouseup', handleUp)
        }
        return () => {
            window.removeEventListener('mousemove', handleMove)
            window.removeEventListener('mouseup', handleUp)
        }
    }, [isDragging])

    if (!isOpen) return null

    return (
        <div
            className="flex flex-col w-full bg-black border-t border-[#333]"
            style={{ height: height }}
        >
            {/* Dragger */}
            <div
                className="w-full h-1 bg-[#252525] hover:bg-blue-500 cursor-row-resize transition-colors opacity-50 hover:opacity-100"
                onMouseDown={() => setIsDragging(true)}
            />

            <TerminalTabs
                sessions={sessions}
                activeId={activeId}
                onCreate={createNewSession}
                onClose={killSession}
                onSwitch={setActiveId}
                onHide={() => dispatch(gs.closeTerminal())}
            />

            <div className="flex-1 relative bg-black overflow-hidden">
                {sessions.map((s) => (
                    <TerminalInstance
                        key={s.id}
                        session={s}
                        isActive={activeId === s.id}
                    />
                ))}

                {sessions.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-[#666]">
                        <p className="mb-2">No active terminals</p>
                        <button
                            onClick={createNewSession}
                            className="text-blue-500 hover:text-blue-400 text-sm hover:underline"
                        >
                            Create Terminal
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
