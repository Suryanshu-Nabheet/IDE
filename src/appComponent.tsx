import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from './app/hooks'
import { PaneHolder } from './components/pane'
import * as gs from './features/globalSlice'
import * as cs from './features/chat/chatSlice'
import * as ct from './features/chat/chatThunks'
import * as ts from './features/tools/toolSlice'
import * as csel from './features/chat/chatSelectors'
import * as tsel from './features/tools/toolSelectors'

import {
    getFocusedTab,
    getFolders,
    getPaneStateBySplits,
    getRootPath,
    getZoomFactor,
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

import { ActivityBar } from './components/activityBar'
import { StatusBar } from './components/statusBar'
import { AIChatSidebar } from './components/aiChatSidebar'

export function App() {
    const dispatch = useAppDispatch()
    const rootPath = useAppSelector(getRootPath)
    const folders = useAppSelector(getFolders)
    const leftSideExpanded = useAppSelector(tsel.getLeftSideExpanded)
    const welcomeDismissed = useAppSelector(tsel.getWelcomeDismissed)

    const paneSplits = useAppSelector(getPaneStateBySplits)

    const zoomFactor = useAppSelector(getZoomFactor)

    const TITLEBAR_HEIGHT = 38
    const STATUS_BAR_HEIGHT = 22
    const ACTIVITY_BAR_WIDTH = 48

    const titleHeight = TITLEBAR_HEIGHT + 'px'
    const statusBarHeight = STATUS_BAR_HEIGHT + 'px'
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

    const screenState =
        Object.keys(folders).length <= 1 && !welcomeDismissed
            ? 'welcome'
            : 'normal'

    const [dragging, setDragging] = useState(false)
    const [leftSideWidth, setLeftSideWidth] = useState(250)

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
        function handleMouseUp() {
            setDragging(false)
        }
        document.addEventListener('mouseup', handleMouseUp)
        return () => {
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [])

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
                        <ChatPopup />
                        <ErrorPopup />
                        <SettingsPopup />
                        <FeedbackArea />
                        <SSHPopup />
                        <AIChatSidebar />
                    </>
                )}
            </div>
            <StatusBar />
        </>
    )
}
