import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from './app/hooks'
import { PaneHolder } from './components/pane'
import * as gs from './features/globalSlice'
import * as cs from './features/chat/chatSlice'
import * as ct from './features/chat/chatThunks'
import * as ts from './features/tools/toolSlice'
import * as csel from './features/chat/chatSelectors'
import * as tsel from './features/tools/toolSelectors'
import * as ssel from './features/settings/settingsSelectors'
import { initializeExtensions } from './features/extensions/extensionsSlice'
// import { store } from './app/store'

import {
    getFocusedTab,
    getFolders,
    getPaneStateBySplits,
    getRootPath,
} from './features/selectors'

import { ChatPopup, CommandBar } from './components/markdown'
import { SettingsPopup } from './components/settingsPane'
import { FeedbackArea, LeftSide } from './components/search'
import { WelcomeScreen } from './components/welcomeScreen'
import { TitleBar } from './components/titlebar'
import { BottomTerminal } from './components/terminal'
import { throttleCallback } from './components/componentUtils'
import { ErrorPopup } from './components/errors'
import { SSHPopup } from './components/sshPopup'
import { GitClonePopup } from './components/gitClonePopup'

import { ActivityBar } from './components/activityBar'
import { StatusBar } from './components/statusBar'
import { AIChatSidebar } from './components/aiChatSidebar'

export function App() {
    const dispatch = useAppDispatch()
    const rootPath = useAppSelector(getRootPath)
    const folders = useAppSelector(getFolders)
    const leftSideExpanded = useAppSelector(tsel.getLeftSideExpanded)
    const aiSidebarOpen = useAppSelector(tsel.aiCommandPaletteTriggeredSelector)
    const welcomeDismissed = useAppSelector(tsel.getWelcomeDismissed)

    const paneSplits = useAppSelector(getPaneStateBySplits)

    const TITLEBAR_HEIGHT = 38
    const STATUS_BAR_HEIGHT = 22

    const titleHeight = TITLEBAR_HEIGHT + 'px'
    const windowHeight = `calc(100vh - ${TITLEBAR_HEIGHT}px - ${STATUS_BAR_HEIGHT}px)`

    const commandBarOpen = useAppSelector(csel.getIsCommandBarOpen)
    const currentActiveTab = useAppSelector(getFocusedTab)

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            const AI_KEYS = ['k', 'l', 'Backspace', 'Enter']
            //
            const isControl = connector.PLATFORM_CM_KEY === 'Ctrl'
            if ((isControl && e.ctrlKey) || (!isControl && e.metaKey)) {
                if (AI_KEYS.includes(e.key)) {
                    if (e.shiftKey && e.key == 'Enter') {
                        dispatch(ct.pressAICommand('Shift-Enter'))
                        e.stopPropagation()
                    } else {
                        dispatch(
                            ct.pressAICommand(
                                e.key as 'k' | 'l' | 'Backspace' | 'Enter'
                            )
                        )
                        if (e.key != 'Backspace' && e.key != 'Enter') {
                            // Bug where I'm not sure why this is needed
                            e.stopPropagation()
                        }
                    }
                } else if (e.key == 'e' && e.shiftKey) {
                    dispatch(ct.pressAICommand('singleLSP'))
                    e.stopPropagation()
                } else if (e.key == 'h') {
                    dispatch(ct.pressAICommand('history'))
                    e.stopPropagation()
                }
            }

            // if meta key is pressed, focus can be anywhere
            if (e.metaKey) {
                if (e.key === 'b') {
                    dispatch(ts.toggleLeftSide())
                }
            }

            // if the escape key
            if (e.key === 'Escape') {
                dispatch(cs.setChatOpen(false))
                if (commandBarOpen) {
                    dispatch(cs.abortCommandBar())
                }
            }
        },
        [dispatch, currentActiveTab, commandBarOpen]
    )

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown, { capture: true })
        // Don't forget to clean up
        return function cleanup() {
            document.removeEventListener('keydown', handleKeyDown, {
                capture: true,
            })
        }
    }, [handleKeyDown])

    useLayoutEffect(() => {
        if (rootPath == null) {
            dispatch(gs.initState(null))
        }
    }, [rootPath])

    useEffect(() => {
        dispatch(initializeExtensions())
    }, [dispatch])

    const screenState =
        Object.keys(folders as object).length <= 1 && !welcomeDismissed
            ? 'welcome'
            : 'normal'

    const [dragging, setDragging] = useState(false)
    const [leftSideWidth, setLeftSideWidth] = useState(250)
    const [rightSideWidth, setRightSideWidth] = useState(420)
    const [rightDragging, setRightDragging] = useState(false)

    useEffect(() => {
        const throttledMouseMove = throttleCallback((event: any) => {
            if (dragging) {
                event.preventDefault()
                event.stopPropagation()

                const diff = event.clientX
                setLeftSideWidth(diff)
            }
        }, 10)
        document.addEventListener('mousemove', throttledMouseMove)
        return () => {
            document.removeEventListener('mousemove', throttledMouseMove)
        }
    }, [dragging])

    useEffect(() => {
        const throttledMouseMove = throttleCallback((event: any) => {
            if (rightDragging) {
                event.preventDefault()
                event.stopPropagation()

                const diff = window.innerWidth - event.clientX
                setRightSideWidth(Math.max(300, Math.min(diff, 800)))
            }
        }, 10)
        document.addEventListener('mousemove', throttledMouseMove)
        return () => {
            document.removeEventListener('mousemove', throttledMouseMove)
        }
    }, [rightDragging])

    useEffect(() => {
        function handleMouseUp() {
            setDragging(false)
            setRightDragging(false)
        }
        document.addEventListener('mouseup', handleMouseUp)
        return () => {
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [])

    const settings = useAppSelector(ssel.getSettings)
    const availableThemes = useAppSelector(
        (state) => state.extensionsState.availableThemes
    )

    // Global Settings Applicator
    useEffect(() => {
        const root = document.documentElement

        // 1. Font Settings
        if (settings.fontFamily) {
            root.style.setProperty(
                '--font-mono',
                `${settings.fontFamily}, monospace`
            )
        }
        if (settings.fontSize) {
            root.style.setProperty(
                '--editor-font-size',
                `${settings.fontSize}px`
            )
            // Also update main base font size if desired for UI
            // root.style.setProperty('--font-size-base', `${settings.fontSize}px`)
        }

        // 2. Theme Settings
        const themeName = settings.theme || 'codex-dark'
        const theme = availableThemes[themeName]

        if (theme) {
            const c = theme.colors
            root.style.setProperty('--background', c.background)
            root.style.setProperty('--sidebar-bg', c.background)
            root.style.setProperty('--activity-bar-bg', c.background)
            root.style.setProperty('--title-bar-background', c.background)
            root.style.setProperty('--title-bar-background', c.background)
            root.style.setProperty('--titlebar-fg', c.foreground)

            // Force high contrast for activity bar icons as requested
            const isDark = theme.type === 'dark'
            const activeColor = isDark ? '#ffffff' : '#1f1f1f' // White or nearly black
            const inactiveColor = isDark
                ? 'rgba(255, 255, 255, 0.4)'
                : 'rgba(0, 0, 0, 0.4)'

            root.style.setProperty('--activity-bar-fg', activeColor)
            root.style.setProperty('--activity-bar-fg-muted', inactiveColor)

            // root.style.setProperty('--activity-bar-fg', c.foreground)
            // root.style.setProperty(
            //     '--activity-bar-fg-muted',
            //     `color-mix(in srgb, ${c.foreground}, transparent 50%)`
            // )
            root.style.setProperty('--tab-bg', c.background)
            root.style.setProperty('--ui-bg', c.background)
            root.style.setProperty('--panel-bg', c.background)

            root.style.setProperty('--text', c.foreground)
            root.style.setProperty('--ui-fg', c.foreground)
            root.style.setProperty(
                '--ui-fg-muted',
                `color-mix(in srgb, ${c.foreground}, transparent 50%)`
            )

            root.style.setProperty('--accent', c.keyword)
            root.style.setProperty('--selection', c.selection)

            root.style.setProperty('--ui-border', c.lineHighlight)
            root.style.setProperty('--ui-border-subtle', c.lineHighlight)
            root.style.setProperty('--pane-border', c.lineHighlight)
            root.style.setProperty('--sidebar-border', c.lineHighlight)

            // Tab Settings
            root.style.setProperty('--tab-active-bg', c.background)
            // Use color-mix for inactive tabs to be slightly different from bg
            const inactiveMix = theme.type === 'dark' ? 'white' : 'black'
            root.style.setProperty(
                '--tab-inactive-bg',
                `color-mix(in srgb, ${c.background}, ${inactiveMix} 8%)`
            )
            root.style.setProperty('--tab-border', c.lineHighlight)
            root.style.setProperty('--tab-hover-bg', c.lineHighlight)
            root.style.setProperty(
                '--tab-inactive-font',
                `color-mix(in srgb, ${c.foreground}, transparent 40%)`
            )
        }
    }, [settings, availableThemes])

    return (
        <>
            {commandBarOpen && <CommandBar parentCaller={'commandBar'} />}
            <TitleBar
                titleHeight={titleHeight}
                useButtons={screenState === 'normal'}
            />
            <div className="window relative" style={{ height: windowHeight }}>
                {screenState === 'welcome' && <WelcomeScreen />}
                {screenState === 'normal' && (
                    <>
                        <ActivityBar />
                        <div
                            className={`app__lefttopwrapper ${
                                leftSideExpanded ? 'flex' : 'hidden'
                            }`}
                            style={{ width: leftSideWidth + 'px' }}
                        >
                            <LeftSide />
                        </div>
                        <div
                            className="leftDrag"
                            onMouseDown={() => {
                                setDragging(true)
                            }}
                        ></div>
                        <div className="app__righttopwrapper">
                            <div className="app__paneholderwrapper">
                                <PaneHolder paneIds={paneSplits} depth={1} />
                            </div>
                            <div className="app__terminalwrapper">
                                <BottomTerminal />
                            </div>
                        </div>
                        {/* Right Sidebar for AI Chat */}
                        {aiSidebarOpen && (
                            <>
                                <div
                                    className="rightDrag"
                                    onMouseDown={() => {
                                        setRightDragging(true)
                                    }}
                                ></div>
                                <div
                                    className="app__rightsidebarwrapper flex"
                                    style={{ width: rightSideWidth + 'px' }}
                                >
                                    <AIChatSidebar />
                                </div>
                            </>
                        )}

                        <ChatPopup />
                        <ErrorPopup />
                        <SettingsPopup />
                        <FeedbackArea />
                        <SSHPopup />
                        <GitClonePopup />
                    </>
                )}
                {screenState === 'normal' && <StatusBar />}
            </div>
        </>
    )
}
