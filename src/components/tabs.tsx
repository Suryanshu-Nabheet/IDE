import * as React from 'react'
import { useEffect, useRef } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose } from '@fortawesome/free-solid-svg-icons'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { getFile, getTab } from '../features/selectors'
import { setDraggingTab, stopDraggingTab } from '../features/globalSlice'

import { getIconElement } from './filetree'

import * as gs from '../features/globalSlice'
import * as gt from '../features/globalThunks'
import * as gsel from '../features/selectors'
import { faTableColumns, faTableRows } from '@fortawesome/pro-regular-svg-icons'
import { HoverState } from '../features/window/state'

// Actions needed for this component
// selectTab(tid: number) - select a tab
// closeTab(tid: number) - close a tab

// Selectors needed for this component
// getActiveTabs() - get the list of active tabs

// Objects needed for this component
// Tab - {id: number, name: string, path: string, is_active: boolean}

function Tab({ tid }: { tid: number }) {
    const dispatch = useAppDispatch()
    const tab = useAppSelector(getTab(tid))
    const file = useAppSelector(getFile(tab.fileId))
    const tabDiv = React.useRef<HTMLDivElement>(null)

    let name = tab.isMulti ? 'multifile' : file.name
    if (!tab.isMulti && !file.saved) name += ' *'

    function revertTabsChildrenEvents() {
        if (tabDiv.current) {
            tabDiv.current.style.background = ''
            const tabs =
                tabDiv.current.parentElement?.getElementsByClassName('tab')
            for (const tab of tabs || []) {
                tab.childNodes.forEach((child) => {
                    const childElement = child as HTMLElement
                    childElement.style.pointerEvents = ''
                })
            }
        }
    }

    return (
        <div
            draggable="true"
            onDragStart={(_e) => {
                dispatch(setDraggingTab(tid))
            }}
            onDragEnd={(_e) => {
                revertTabsChildrenEvents() // revert for current pane
                dispatch(stopDraggingTab())
            }}
            className={`tab ${tab.isActive ? 'tab__is_active' : ''} ${
                file.deleted == true ? 'tab__is_deleted' : ''
            }`}
            onClick={() => {
                dispatch(gs.selectTab(tid))
            }}
            onDragOver={(event) => {
                event.preventDefault()
                if (tabDiv.current) {
                    tabDiv.current.style.background = 'rgba(255, 255, 255, 0.3)'
                    tabDiv.current.childNodes.forEach((child) => {
                        const childElement = child as HTMLElement
                        childElement.style.pointerEvents = 'none' // we don't want onDragLeave event for tab children while reordering
                    })
                }
            }}
            onDragLeave={(event) => {
                event.preventDefault()
                if (tabDiv.current) {
                    tabDiv.current.style.background = ''
                }
            }}
            onDrop={(event) => {
                event.preventDefault()
                revertTabsChildrenEvents() // revert for new pane
            }}
            ref={tabDiv}
            onContextMenu={() => dispatch(gs.rightClickTab(tid))}
        >
            <div
                onMouseDown={(e) => {
                    if (e.button == 1) {
                        // middle click
                        e.stopPropagation()
                        dispatch(gt.closeTab(tid))
                    }
                }}
            >
                <div className="tab__icon">{getIconElement(file.name)}</div>
                <div className="tab__name">{name}</div>
                <div
                    className="tab__close"
                    onClick={(e) => {
                        e.stopPropagation()
                        dispatch(gt.closeTab(tid))
                    }}
                >
                    <FontAwesomeIcon icon={faClose} />
                </div>
            </div>
        </div>
    )
}

function TabRemainder({ children }: { children: React.ReactNode }) {
    const containerDiv = useRef<HTMLDivElement>(null)
    function revertTabsChildrenEvents() {
        if (containerDiv.current) {
            containerDiv.current.style.background = ''
            const tabs =
                containerDiv.current.parentElement?.getElementsByClassName(
                    'tab'
                )
            for (const tab of tabs || []) {
                tab.childNodes.forEach((child) => {
                    const childElement = child as HTMLElement
                    childElement.style.pointerEvents = ''
                })
            }
        }
    }
    return (
        <div
            className="w-full"
            ref={containerDiv}
            onDragOver={(event) => {
                event.preventDefault()
                if (containerDiv.current) {
                    containerDiv.current.style.background =
                        'rgba(255, 255, 255, 0.3)'
                    containerDiv.current.childNodes.forEach((child) => {
                        const childElement = child as HTMLElement
                        childElement.style.pointerEvents = 'none' // we don't want onDragLeave event for tab children while reordering
                    })
                }
            }}
            onDragLeave={(event) => {
                event.preventDefault()
                if (containerDiv.current) {
                    containerDiv.current.style.background = ''
                }
            }}
            onDrop={(event) => {
                event.preventDefault()
                revertTabsChildrenEvents() // revert for new pane
            }}
        >
            {children}
        </div>
    )
}

export function TabBar({ tabIds }: { tabIds: number[] }) {
    // Add event listener to translate vertical scroll to horizontal scroll
    const dispatch = useAppDispatch()
    const tabBarRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const tabBar = tabBarRef.current
        if (tabBar) {
            tabBar.addEventListener('wheel', (e) => {
                if (e.deltaY !== 0) {
                    e.preventDefault()
                    tabBar.scrollLeft += e.deltaY
                }
            })
        }
    }, [tabBarRef])

    const currentPane = useAppSelector(gsel.getCurrentPane)
    const currentTab = useAppSelector(gsel.getCurrentTab(currentPane!))

    return (
        <div className="window__tabbarcontainer">
            <div className="tabbar" ref={tabBarRef}>
                <div className="w-full flex" ref={tabBarRef}>
                    {tabIds.map((tabId) => (
                        <Tab key={tabId} tid={tabId} />
                    ))}
                    <TabRemainder>
                        {currentPane != null && currentTab != null && (
                            <div className="tabbar__hoverbuttons">
                                <div
                                    className="tabbar__hoverbutton"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        dispatch(
                                            gs.splitPaneAndOpenFile({
                                                paneId: currentPane,
                                                hoverState: HoverState.Right,
                                            })
                                        )
                                    }}
                                >
                                    <FontAwesomeIcon icon={faTableColumns} />
                                </div>
                                <div
                                    className="tabbar__hoverbutton"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        dispatch(
                                            gs.splitPaneAndOpenFile({
                                                paneId: currentPane,
                                                hoverState: HoverState.Bottom,
                                            })
                                        )
                                    }}
                                >
                                    <FontAwesomeIcon icon={faTableRows} />
                                </div>
                            </div>
                        )}
                    </TabRemainder>
                </div>
            </div>
        </div>
    )
}
