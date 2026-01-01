import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import { SearchAddon } from 'xterm-addon-search'
import 'xterm/css/xterm.css'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { FullState } from '../features/window/state'
import * as gs from '../features/globalSlice'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faTerminal } from '@fortawesome/free-solid-svg-icons'
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

    // Retry fitting mainly for when tab switches from hidden->visible
    const fitTerminal = useCallback(() => {
        if (!session.fitAddon) return

        let attempts = 0
        const tryFit = () => {
            try {
                session.fitAddon.fit()
                const dims = session.fitAddon.proposeDimensions()

                // If dimensions are valid, sync with backend
                if (dims && dims.cols > 0 && dims.rows > 0) {
                    connector.terminalResize(session.id, dims.cols, dims.rows)
                } else if (isActive && attempts < 10) {
                    // If 0x0, DOM might not be painted yet. Retry.
                    attempts++
                    setTimeout(tryFit, 50)
                }
            } catch (e) {
                console.warn('Fit error', e)
            }
        }

        // Initial try
        requestAnimationFrame(tryFit)
    }, [session, isActive])

    // Attach xterm to DOM once
    useEffect(() => {
        if (containerRef.current && !attachedRef.current) {
            session.instance.open(containerRef.current)
            attachedRef.current = true
            fitTerminal()
        }
    }, [session, fitTerminal])

    // Handle ResizeObserver for this specific instance
    useEffect(() => {
        if (!containerRef.current || !isActive) return

        const observer = new ResizeObserver(() => {
            fitTerminal()
        })

        observer.observe(containerRef.current)

        // Force fit when becoming active
        fitTerminal()
        session.instance.focus()

        return () => observer.disconnect()
    }, [isActive, session, fitTerminal])

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 bg-black"
            style={{
                display: isActive ? 'block' : 'none',
                // Keep dimensions even when hidden (though display:none overrides, this helps transition)
                minWidth: '100px',
                minHeight: '100px',
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
    const [session, setSession] = useState<Session | null>(null)
    const [height, setHeight] = useState(300)

    // Refs
    const creatingRef = useRef(false) // Lock for async creation

    // --- Actions ---

    const ensureDefaultSession = useCallback(async () => {
        if (session || creatingRef.current) return
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

            // 2. Request Backend Session (Default Shell)
            const { id } = await connector.terminalCreate(80, 24)

            // 3. Setup Input Handling
            term.onData((data) => {
                connector.terminalInto(id, data)
            })

            const newSession: Session = {
                id,
                title: 'Terminal',
                instance: term,
                fitAddon,
            }

            setSession(newSession)
        } catch (err) {
            console.error('Failed to load Terminal:', err)
            // Retry after delay if failed (backend might not be ready)
            setTimeout(() => {
                creatingRef.current = false
                ensureDefaultSession()
            }, 1000)
        } finally {
            creatingRef.current = false
        }
    }, [session])

    // --- Effects ---

    // 1. Initial Creation & Auto-Recovery
    useEffect(() => {
        if (isOpen && !session) {
            ensureDefaultSession()
        }
    }, [isOpen, session, ensureDefaultSession])

    // 2. Global Event Listener (Singleton)
    useEffect(() => {
        const onData = (_: any, { id, data }: { id: string; data: string }) => {
            if (session && session.id === id) {
                session.instance.write(data)
            }
        }

        const onExit = (_: any, { id }: { id: string }) => {
            if (session && session.id === id) {
                session.instance.dispose()
                setSession(null)
                // Effect 1 will trigger re-creation because session is now null
            }
        }

        connector.registerIncData(onData)
        connector.registerTerminalExited(onExit)

        return () => {
            connector.deregisterIncData(onData)
            connector.deregisterTerminalExited(onExit)
        }
    }, [session])

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
            className="flex flex-col w-full bg-black border-t border-gray-900"
            style={{ height: height }}
        >
            {/* Dragger */}
            <div
                className="w-full h-1 bg-transparent hover:bg-accent cursor-row-resize transition-all opacity-0 hover:opacity-100"
                onMouseDown={() => setIsDragging(true)}
            />

            {/* Header / Tabs Area */}
            <div className="flex bg-black-soft h-9 border-b border-gray-900 items-center px-4 select-none justify-between">
                <div className="flex items-center text-[11px] font-bold uppercase tracking-wider text-ui-fg-muted">
                    <FontAwesomeIcon
                        icon={faTerminal}
                        className="mr-2 text-accent"
                    />
                    <span>Terminal</span>
                </div>
                <button
                    onClick={() => dispatch(gs.closeTerminal())}
                    className="icon-button text-xs"
                    title="Close Panel"
                >
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            </div>

            <div className="flex-1 relative bg-black overflow-hidden">
                {session ? (
                    <TerminalInstance session={session} isActive={true} />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-[#666]">
                        <p className="mb-2">Initializing Local Terminal...</p>
                    </div>
                )}
            </div>
        </div>
    )
}
