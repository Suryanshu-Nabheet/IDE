import React, { useEffect, useRef } from 'react'
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

// ============================================
// TAB COMPONENT
// ============================================
interface TabProps {
    tid: number
}

function Tab({ tid }: TabProps) {
    const dispatch = useAppDispatch()
    const tab = useAppSelector(getTab(tid))
    const file = useAppSelector(getFile(tab.fileId))
    const tabRef = useRef<HTMLDivElement>(null)

    if (!tab || !file) return null

    const fileName = tab.isMulti ? 'multifile' : file.name
    const isModified = !tab.isMulti && !file.saved
    const isActive = tab.isActive
    const isDeleted = file.deleted

    // ============================================
    // EVENT HANDLERS
    // ============================================
    const handleClick = () => {
        dispatch(gs.selectTab(tid))
    }

    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation()
        dispatch(gt.closeTab(tid))
    }

    const handleMiddleClick = (e: React.MouseEvent) => {
        if (e.button === 1) {
            e.stopPropagation()
            dispatch(gt.closeTab(tid))
        }
    }

    const handleContextMenu = () => {
        dispatch(gs.rightClickTab(tid))
    }

    const handleDragStart = () => {
        dispatch(setDraggingTab(tid))
    }

    const handleDragEnd = () => {
        revertTabStyles()
        dispatch(stopDraggingTab())
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        if (tabRef.current) {
            tabRef.current.style.background = 'var(--any-bg-lighter)'
        }
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        if (tabRef.current) {
            tabRef.current.style.background = ''
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        revertTabStyles()
    }

    const revertTabStyles = () => {
        if (tabRef.current) {
            tabRef.current.style.background = ''
            const tabs =
                tabRef.current.parentElement?.getElementsByClassName('tab')
            for (const t of tabs || []) {
                const tabElement = t as HTMLElement
                tabElement.childNodes.forEach((child) => {
                    const childElement = child as HTMLElement
                    childElement.style.pointerEvents = ''
                })
            }
        }
    }

    // ============================================
    // RENDER
    // ============================================
    return (
        <div
            ref={tabRef}
            draggable
            className={`tab ${isActive ? 'tab__is_active' : ''} ${
                isDeleted ? 'tab__is_deleted' : ''
            }`}
            onClick={handleClick}
            onMouseDown={handleMiddleClick}
            onContextMenu={handleContextMenu}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* File Icon */}
            <div className="tab__icon">{getIconElement(fileName)}</div>

            {/* File Name */}
            <div className="tab__name">{fileName}</div>

            {/* Modified Indicator */}
            {isModified && <div className="tab__modified">●</div>}

            {/* Close Button */}
            <div className="tab__close" onClick={handleClose}>
                <FontAwesomeIcon icon={faXmark} />
            </div>
        </div>
    )
}

// ============================================
// TAB REMAINDER (Action Buttons Area)
// ============================================
interface TabRemainderProps {
    children: React.ReactNode
}

function TabRemainder({ children }: TabRemainderProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
    }

    return (
        <div
            ref={containerRef}
            className="tab-remainder"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {children}
        </div>
    )
}

// ============================================
// TAB BAR COMPONENT
// ============================================
interface TabBarProps {
    tabIds: number[]
}

export function TabBar({ tabIds }: TabBarProps) {
    const dispatch = useAppDispatch()
    const tabBarRef = useRef<HTMLDivElement>(null)
    const currentPane = useAppSelector(gsel.getCurrentPane)
    const currentTab = useAppSelector(gsel.getCurrentTab(currentPane!))

    // ============================================
    // HORIZONTAL SCROLL WITH MOUSE WHEEL
    // ============================================
    useEffect(() => {
        const tabBar = tabBarRef.current
        if (!tabBar) return

        const handleWheel = (e: WheelEvent) => {
            if (e.deltaY !== 0) {
                e.preventDefault()
                tabBar.scrollLeft += e.deltaY
            }
        }

        tabBar.addEventListener('wheel', handleWheel, { passive: false })
        return () => tabBar.removeEventListener('wheel', handleWheel)
    }, [])

    // ============================================
    // ACTION HANDLERS
    // ============================================
    const handleSplitRight = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (currentPane != null) {
            dispatch(
                gs.splitPaneAndOpenFile({
                    paneId: currentPane,
                    hoverState: HoverState.Right,
                })
            )
        }
    }

    const handleSplitDown = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (currentPane != null) {
            dispatch(
                gs.splitPaneAndOpenFile({
                    paneId: currentPane,
                    hoverState: HoverState.Bottom,
                })
            )
        }
    }

    // ============================================
    // RENDER
    // ============================================
    return (
        <div className="window__tabbarcontainer">
            {/* Scrollable Tab List */}
            <div ref={tabBarRef} className="tabbar">
                {tabIds.map((tabId) => (
                    <Tab key={tabId} tid={tabId} />
                ))}
            </div>

            {/* Action Buttons */}
            <TabRemainder>
                {currentPane != null && currentTab != null && (
                    <div className="tabbar__actions">
                        <button
                            className="tabbar__action-btn"
                            title="Split Right"
                            onClick={handleSplitRight}
                        >
                            <FontAwesomeIcon icon={faTableColumns} />
                        </button>
                        <button
                            className="tabbar__action-btn"
                            title="Split Down"
                            onClick={handleSplitDown}
                        >
                            <FontAwesomeIcon icon={faTableRows} />
                        </button>
                    </div>
                )}
            </TabRemainder>
        </div>
    )
}
