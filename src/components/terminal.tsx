import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Terminal } from 'xterm'
// @ts-ignore - xterm-addon-fit types issue
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import { SearchAddon } from 'xterm-addon-search'
import 'xterm/css/xterm.css'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { FullState } from '../features/window/state'
import * as gs from '../features/globalSlice'
import * as ssel from '../features/settings/settingsSelectors'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { throttleCallback } from './componentUtils'

export const BottomTerminal: React.FC = () => {
    const dispatch = useAppDispatch()
    const isOpen = useAppSelector(
        (state: FullState) => state.global.terminalOpen
    )
    const settings = useAppSelector(ssel.getSettings)
    const availableThemes = useAppSelector(
        (state: any) => state.extensionsState.availableThemes
    )

    const terminalRef = useRef<Terminal | null>(null)
    const fitAddonRef = useRef<FitAddon | null>(null)
    const containerRef = useRef<HTMLDivElement | null>(null)
    const terminalIdRef = useRef<string | null>(null)
    const observerRef = useRef<ResizeObserver | null>(null)
    const [height, setHeight] = useState(300)
    const [isDragging, setIsDragging] = useState(false)
    const [isMaximized, setIsMaximized] = useState(false)
    const dataHandlerRef = useRef<
        ((_: any, payload: { id: string; data: string }) => void) | null
    >(null)
    const exitHandlerRef = useRef<
        ((_: any, payload: { id: string; exitCode: number }) => void) | null
    >(null)

    const fitTerminal = useCallback(() => {
        if (!fitAddonRef.current || !containerRef.current || !isOpen) return
        try {
            fitAddonRef.current.fit()
            const dims = fitAddonRef.current.proposeDimensions()
            if (
                dims &&
                dims.cols > 0 &&
                dims.rows > 0 &&
                terminalIdRef.current
            ) {
                connector.terminalResize(
                    terminalIdRef.current,
                    dims.cols,
                    dims.rows
                )
            }
        } catch (e) {
            // Silent error handling
        }
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) {
            if (observerRef.current) {
                observerRef.current.disconnect()
                observerRef.current = null
            }
            return
        }

        if (!terminalRef.current && containerRef.current) {
            // Helper to get CSS var
            const getVar = (name: string, fallback: string) => {
                if (typeof document === 'undefined') return fallback
                return (
                    getComputedStyle(document.documentElement)
                        .getPropertyValue(name)
                        .trim() || fallback
                )
            }

            const terminalTheme = {
                background: getVar('--terminal-bg', '#000000'),
                foreground: getVar('--terminal-fg', '#e5e5e5'),
                cursor: getVar('--terminal-cursor', '#3b82f6'),
                selection: getVar('--terminal-selection', '#3b82f640'),
                black: getVar('--terminal-ansi-black', '#000000'),
                red: getVar('--terminal-ansi-red', '#cd3131'),
                green: getVar('--terminal-ansi-green', '#0dbc79'),
                yellow: getVar('--terminal-ansi-yellow', '#e5e510'),
                blue: getVar('--terminal-ansi-blue', '#2472c8'),
                magenta: getVar('--terminal-ansi-magenta', '#bc3fbc'),
                cyan: getVar('--terminal-ansi-cyan', '#11a8cd'),
                white: getVar('--terminal-ansi-white', '#e5e5e5'),
                brightBlack: getVar('--terminal-ansi-bright-black', '#666666'),
                brightRed: getVar('--terminal-ansi-bright-red', '#f14c4c'),
                brightGreen: getVar('--terminal-ansi-bright-green', '#23d18b'),
                brightYellow: getVar(
                    '--terminal-ansi-bright-yellow',
                    '#f5f543'
                ),
                brightBlue: getVar('--terminal-ansi-bright-blue', '#3b8eea'),
                brightMagenta: getVar(
                    '--terminal-ansi-bright-magenta',
                    '#d670d6'
                ),
                brightCyan: getVar('--terminal-ansi-bright-cyan', '#29b8db'),
                brightWhite: getVar('--terminal-ansi-bright-white', '#e5e5e5'),
            }

            const term = new Terminal({
                theme: terminalTheme,
                fontFamily:
                    settings.fontFamily || "'JetBrains Mono', monospace",
                fontSize: parseInt(settings.fontSize || '13'),
                lineHeight: 1.4,
                cursorBlink: true,
                cursorStyle: 'block',
                allowTransparency: false,
            })

            const fitAddon = new FitAddon()
            const linkAddon = new WebLinksAddon((e, url) => {
                e.preventDefault()
                connector.terminalClickLink(url)
            })
            const searchAddon = new SearchAddon()

            term.loadAddon(fitAddon)
            term.loadAddon(linkAddon)
            term.loadAddon(searchAddon)

            term.open(containerRef.current)
            terminalRef.current = term
            fitAddonRef.current = fitAddon

            connector
                .terminalCreate(80, 24)
                .then((result: { id: string }) => {
                    terminalIdRef.current = result.id
                    term.onData((data) => {
                        connector.terminalInto(result.id, data)
                    })
                    setTimeout(() => {
                        fitTerminal()
                        term.focus()
                    }, 100)
                })
                .catch(() => {
                    // Silent error handling
                })
        } else if (terminalRef.current && isOpen) {
            setTimeout(() => {
                fitTerminal()
                terminalRef.current?.focus()
            }, 50)
        }
    }, [isOpen, settings, availableThemes, fitTerminal])

    useEffect(() => {
        if (!dataHandlerRef.current) {
            const dataHandler = (
                _: any,
                payload: { id: string; data: string }
            ) => {
                if (
                    terminalRef.current &&
                    terminalIdRef.current === payload.id
                ) {
                    try {
                        terminalRef.current.write(payload.data)
                    } catch (e) {
                        // Silent error handling
                    }
                }
            }

            const exitHandler = (
                _: any,
                payload: { id: string; exitCode: number }
            ) => {
                if (terminalIdRef.current === payload.id) {
                    try {
                        if (terminalRef.current) {
                            terminalRef.current.dispose()
                            terminalRef.current = null
                        }
                        if (fitAddonRef.current) {
                            fitAddonRef.current = null
                        }
                        terminalIdRef.current = null
                    } catch (e) {
                        // Silent error handling
                    }
                }
            }

            connector.registerIncData(dataHandler)
            connector.registerTerminalExited(exitHandler)
            dataHandlerRef.current = dataHandler
            exitHandlerRef.current = exitHandler

            return () => {
                if (dataHandlerRef.current) {
                    connector.deregisterIncData(dataHandlerRef.current)
                    dataHandlerRef.current = null
                }
                if (exitHandlerRef.current) {
                    connector.deregisterTerminalExited(exitHandlerRef.current)
                    exitHandlerRef.current = null
                }
            }
        }
    }, [])

    useEffect(() => {
        if (!containerRef.current || !isOpen) {
            if (observerRef.current) {
                observerRef.current.disconnect()
                observerRef.current = null
            }
            return
        }

        const observer = new ResizeObserver(() => {
            fitTerminal()
        })

        observer.observe(containerRef.current)
        observerRef.current = observer
        fitTerminal()

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect()
                observerRef.current = null
            }
        }
    }, [isOpen, fitTerminal])

    useEffect(() => {
        if (terminalRef.current) {
            const fontFamily =
                settings.fontFamily || "'JetBrains Mono', monospace"
            const fontSize = parseInt(settings.fontSize || '13')
            terminalRef.current.options.fontFamily = fontFamily
            terminalRef.current.options.fontSize = fontSize

            // Delay theme update to ensure DOM CSS variables are fully propagated
            // This prevents "hallucinations" where getComputedStyle reads stale values
            const timer = setTimeout(() => {
                // Helper to get CSS var
                const getVar = (name: string, fallback: string) => {
                    if (typeof document === 'undefined') return fallback
                    return (
                        getComputedStyle(document.documentElement)
                            .getPropertyValue(name)
                            .trim() || fallback
                    )
                }

                // FULL Dynamic Theme Update - Syncs XTerm with Container CSS
                const terminalTheme = {
                    background: getVar('--terminal-bg', '#000000'),
                    foreground: getVar('--terminal-fg', '#e5e5e5'),
                    cursor: getVar('--terminal-cursor', '#3b82f6'),
                    selection: getVar('--terminal-selection', '#3b82f640'),
                    black: getVar('--terminal-ansi-black', '#000000'),
                    red: getVar('--terminal-ansi-red', '#cd3131'),
                    green: getVar('--terminal-ansi-green', '#0dbc79'),
                    yellow: getVar('--terminal-ansi-yellow', '#e5e510'),
                    blue: getVar('--terminal-ansi-blue', '#2472c8'),
                    magenta: getVar('--terminal-ansi-magenta', '#bc3fbc'),
                    cyan: getVar('--terminal-ansi-cyan', '#11a8cd'),
                    white: getVar('--terminal-ansi-white', '#e5e5e5'),
                    brightBlack: getVar(
                        '--terminal-ansi-bright-black',
                        '#666666'
                    ),
                    brightRed: getVar('--terminal-ansi-bright-red', '#f14c4c'),
                    brightGreen: getVar(
                        '--terminal-ansi-bright-green',
                        '#23d18b'
                    ),
                    brightYellow: getVar(
                        '--terminal-ansi-bright-yellow',
                        '#f5f543'
                    ),
                    brightBlue: getVar(
                        '--terminal-ansi-bright-blue',
                        '#3b8eea'
                    ),
                    brightMagenta: getVar(
                        '--terminal-ansi-bright-magenta',
                        '#d670d6'
                    ),
                    brightCyan: getVar(
                        '--terminal-ansi-bright-cyan',
                        '#29b8db'
                    ),
                    brightWhite: getVar(
                        '--terminal-ansi-bright-white',
                        '#e5e5e5'
                    ),
                }

                if (terminalRef.current) {
                    terminalRef.current.options.theme = terminalTheme
                }
            }, 100)

            return () => clearTimeout(timer)
        }
    }, [settings, availableThemes])

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === '`') {
                dispatch(gs.toggleTerminal())
            }
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [dispatch])

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

    useEffect(() => {
        return () => {
            if (terminalRef.current) {
                try {
                    terminalRef.current.dispose()
                } catch (e) {
                    // Silent error handling
                }
                terminalRef.current = null
            }
            if (terminalIdRef.current) {
                try {
                    connector.terminalKill(terminalIdRef.current)
                } catch (e) {
                    // Silent error handling
                }
                terminalIdRef.current = null
            }
            if (observerRef.current) {
                observerRef.current.disconnect()
                observerRef.current = null
            }
        }
    }, [])

    if (!isOpen) return null

    const maxHeight = isMaximized ? window.innerHeight - 50 : height

    return (
        <div
            className="terminal-container"
            style={{ height: `${maxHeight}px` }}
        >
            <div
                className="terminal-dragger"
                onMouseDown={() => setIsDragging(true)}
            />
            <div className="terminal-header">
                <div className="terminal-title">
                    <span>Terminal</span>
                </div>
                <div className="terminal-actions">
                    <button
                        className="terminal-action-btn"
                        onClick={() => setIsMaximized(!isMaximized)}
                        title={isMaximized ? 'Restore' : 'Maximize'}
                    >
                        <FontAwesomeIcon icon={faChevronUp} />
                    </button>
                    <button
                        className="terminal-action-btn"
                        onClick={() => dispatch(gs.closeTerminal())}
                        title="Close Panel"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
            </div>
            <div className="terminal-content">
                <div ref={containerRef} className="terminal-instance-wrapper" />
            </div>
        </div>
    )
}
