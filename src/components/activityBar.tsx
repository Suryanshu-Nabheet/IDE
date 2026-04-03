import React, { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import {
    getLeftTab,
    getLeftSideExpanded,
} from '../features/tools/toolSelectors'
import {
    openFileTree,
    openSearch,
    openGit,
    openExtensions,
    collapseLeftSide,
    expandLeftSide,
} from '../features/tools/toolSlice'
import { Codicon } from './codicon'

export const ActivityBar = () => {
    const dispatch = useAppDispatch()
    const activeTab = useAppSelector(getLeftTab)
    const isExpanded = useAppSelector(getLeftSideExpanded)
    const [showMore, setShowMore] = useState(false)

    const handleTabClick = (
        tab: 'filetree' | 'search' | 'git' | 'extensions'
    ) => {
        if (activeTab === tab && isExpanded) {
            dispatch(collapseLeftSide())
        } else {
            if (tab === 'filetree') {
                dispatch(openFileTree())
            } else if (tab === 'search') {
                dispatch(openSearch())
            } else if (tab === 'git') {
                dispatch(openGit())
            } else if (tab === 'extensions') {
                dispatch(openExtensions())
            }
            dispatch(expandLeftSide())
            setShowMore(false)
        }
    }

    const navItems = [
        { id: 'filetree', icon: 'files', title: 'Explorer' },
        { id: 'search', icon: 'search', title: 'Search' },
        { id: 'git', icon: 'source-control', title: 'Source Control' },
        { id: 'extensions', icon: 'extensions', title: 'Extensions' },
    ]

    return (
        <div className="w-full h-[42px] min-h-[42px] bg-[var(--sidebar-bg)] flex items-center justify-center relative flex-shrink-0 z-[100] border-b border-[var(--ui-border)]">
            {/* Centered Button Container */}
            <div className="flex items-center gap-1">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        className={`
                            w-[28px] h-[28px] flex items-center justify-center rounded-[5px] cursor-pointer transition-all duration-200
                            ${
                                activeTab === item.id && isExpanded
                                    ? 'bg-[var(--ui-active,rgba(255,255,255,0.1))] text-[var(--ui-fg)]'
                                    : 'text-[var(--ui-fg-muted)] hover:text-[var(--ui-fg)] hover:bg-[var(--ui-hover,rgba(255,255,255,0.08))]'
                            }
                        `}
                        onClick={() => handleTabClick(item.id as any)}
                        title={item.title}
                        type="button"
                    >
                        <Codicon
                            name={item.icon}
                            style={{ fontSize: '17px' }}
                        />
                    </button>
                ))}

                {/* Divider */}
                <div className="w-[1px] h-4 bg-[var(--ui-border)] mx-1 opacity-20" />

                {/* More Menu Toggle */}
                <button
                    className={`
                        w-[28px] h-[28px] flex items-center justify-center rounded-[5px] cursor-pointer transition-all duration-200
                        ${
                            showMore
                                ? 'bg-[var(--ui-active,rgba(255,255,255,0.1))] text-[var(--ui-fg)]'
                                : 'text-[var(--ui-fg-muted)] hover:text-[var(--ui-fg)] hover:bg-[var(--ui-hover,rgba(255,255,255,0.08))]'
                        }
                    `}
                    onClick={() => setShowMore(!showMore)}
                    title="More Views"
                    type="button"
                >
                    <Codicon name="chevron-down" style={{ fontSize: '12px' }} />
                </button>
            </div>

            {/* Dropdown Menu - High z-index to prevent being hidden */}
            {showMore && (
                <>
                    {/* Backdrop to close menu */}
                    <div
                        className="fixed inset-0"
                        style={{ zIndex: 9998 }}
                        onClick={() => setShowMore(false)}
                    />

                    {/* Menu - Matches sidebar width exactly */}
                    <div
                        className="absolute w-56 bg-[var(--sidebar-bg)] border border-[var(--ui-border)] rounded-lg shadow-2xl flex flex-col"
                        style={{
                            top: '46px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 9999,
                            background: 'var(--ui-bg-elevated)',
                            backdropFilter: 'blur(12px)',
                        }}
                    >
                        <button
                            className="px-4 py-3 hover:bg-[var(--ui-hover)] text-xs text-[var(--ui-fg)] flex items-center justify-between transition-colors text-left opacity-50 cursor-not-allowed first:rounded-t-lg"
                            onClick={(e) => {
                                e.preventDefault()
                                setShowMore(false)
                            }}
                            type="button"
                            title="Coming soon"
                            disabled
                        >
                            <span>Run and Debug</span>
                            <span className="text-[9px] text-[var(--ui-fg-muted)]">
                                Soon
                            </span>
                        </button>
                        <button
                            className="px-4 py-3 hover:bg-[var(--ui-hover)] text-xs text-[var(--ui-fg)] flex items-center justify-between transition-colors text-left opacity-50 cursor-not-allowed last:rounded-b-lg"
                            onClick={(e) => {
                                e.preventDefault()
                                setShowMore(false)
                            }}
                            type="button"
                            title="Coming soon"
                            disabled
                        >
                            <span>Remote Explorer</span>
                            <span className="text-[9px] text-[var(--ui-fg-muted)]">
                                Soon
                            </span>
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
