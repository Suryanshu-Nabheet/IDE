import * as React from 'react'
import { useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faXmark,
    faTableColumns,
    faTableRows,
} from '@fortawesome/pro-regular-svg-icons'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { getFile, getTab } from '../features/selectors'
import { setDraggingTab, stopDraggingTab } from '../features/globalSlice'
import { getIconElement } from './filetree'
import * as gs from '../features/globalSlice'
import * as gt from '../features/globalThunks'
import * as gsel from '../features/selectors'
import { HoverState } from '../features/window/state'

function Tab({ tid }: { tid: number }) {
    const dispatch = useAppDispatch()
    const tab = useAppSelector(getTab(tid))
    const file = useAppSelector(getFile(tab.fileId))
    const tabDiv = React.useRef<HTMLDivElement>(null)

    if (!tab || !file) return null

    const name = tab.isMulti ? 'multifile' : file.name
    const isModified = !tab.isMulti && !file.saved

    function revertTabsChildrenEvents() {
        if (tabDiv.current) {
            tabDiv.current.style.background = ''
            const tabs =
                tabDiv.current.parentElement?.getElementsByClassName('tab')
            for (const t of tabs || []) {
                const tabElement = t as HTMLElement
                tabElement.childNodes.forEach((child) => {
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
                revertTabsChildrenEvents()
                dispatch(stopDraggingTab())
            }}
            className={`tab ${tab.isActive ? 'tab__is_active' : ''} ${
                file.deleted ? 'tab__is_deleted' : ''
            }`}
            onClick={() => {
                dispatch(gs.selectTab(tid))
            }}
            onDragOver={(event) => {
                event.preventDefault()
                if (tabDiv.current) {
                    tabDiv.current.style.background = 'var(--any-bg-lighter)'
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
                revertTabsChildrenEvents()
            }}
            ref={tabDiv}
            onContextMenu={() => dispatch(gs.rightClickTab(tid))}
            onMouseDown={(e) => {
                if (e.button === 1) {
                    e.stopPropagation()
                    dispatch(gt.closeTab(tid))
                }
            }}
        >
            <div className="tab__icon">{getIconElement(file.name)}</div>
            <div className="tab__name">
                {name}
                {isModified && <span className="tab__modified">●</span>}
            </div>
            <div
                className="tab__close"
                onClick={(e) => {
                    e.stopPropagation()
                    dispatch(gt.closeTab(tid))
                }}
            >
                <FontAwesomeIcon icon={faXmark} />
            </div>
        </div>
    )
}

function TabRemainder({ children }: { children: React.ReactNode }) {
    const containerDiv = useRef<HTMLDivElement>(null)

    return (
        <div
            className="tab-remainder"
            ref={containerDiv}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
                event.preventDefault()
            }}
        >
            {children}
        </div>
    )
}

export function TabBar({ tabIds }: { tabIds: number[] }) {
    const dispatch = useAppDispatch()
    const tabBarRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const tabBar = tabBarRef.current
        if (tabBar) {
            const handleWheel = (e: WheelEvent) => {
                if (e.deltaY !== 0) {
                    e.preventDefault()
                    tabBar.scrollLeft += e.deltaY
                }
            }
            tabBar.addEventListener('wheel', handleWheel, { passive: false })
            return () => tabBar.removeEventListener('wheel', handleWheel)
        }
    }, [])

    const currentPane = useAppSelector(gsel.getCurrentPane)
    const currentTab = useAppSelector(gsel.getCurrentTab(currentPane!))

    return (
        <div className="window__tabbarcontainer">
            <div className="tabbar" ref={tabBarRef}>
                {tabIds.map((tabId) => (
                    <Tab key={tabId} tid={tabId} />
                ))}
            </div>
            <TabRemainder>
                {currentPane != null && currentTab != null && (
                    <div className="tabbar__actions">
                        <button
                            className="tabbar__action-btn"
                            title="Split Right"
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
                        </button>
                        <button
                            className="tabbar__action-btn"
                            title="Split Down"
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
                        </button>
                    </div>
                )}
            </TabRemainder>
        </div>
    )
}
