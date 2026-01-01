import React from 'react'
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
import {
    toggleSettings,
    setSettingsTab,
} from '../features/settings/settingsSlice'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faFiles,
    faMagnifyingGlass,
    faGear,
    faUserCircle,
    faCodeBranch,
    faPuzzlePiece,
} from '@fortawesome/pro-regular-svg-icons'

export const ActivityBar = () => {
    const dispatch = useAppDispatch()
    const activeTab = useAppSelector(getLeftTab)
    const isExpanded = useAppSelector(getLeftSideExpanded)

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
        }
    }

    return (
        <div className="activity-bar">
            <div className="activity-bar__top">
                <div
                    className={`activity-bar__item ${
                        activeTab === 'filetree' && isExpanded ? 'active' : ''
                    }`}
                    onClick={() => handleTabClick('filetree')}
                    title="Explorer"
                >
                    <FontAwesomeIcon icon={faFiles} />
                </div>
                <div
                    className={`activity-bar__item ${
                        activeTab === 'search' && isExpanded ? 'active' : ''
                    }`}
                    onClick={() => handleTabClick('search')}
                    title="Search"
                >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                </div>
                <div
                    className={`activity-bar__item ${
                        activeTab === 'git' && isExpanded ? 'active' : ''
                    }`}
                    onClick={() => handleTabClick('git')}
                    title="Source Control"
                >
                    <FontAwesomeIcon icon={faCodeBranch} />
                </div>
                <div
                    className={`activity-bar__item ${
                        activeTab === 'extensions' && isExpanded ? 'active' : ''
                    }`}
                    onClick={() => handleTabClick('extensions')}
                    title="Extensions"
                >
                    <FontAwesomeIcon icon={faPuzzlePiece} />
                </div>
            </div>
            <div className="activity-bar__bottom">
                <div
                    className="activity-bar__item"
                    title="Accounts"
                    onClick={() => dispatch(setSettingsTab('Account'))}
                >
                    <FontAwesomeIcon icon={faUserCircle} />
                </div>
                <div
                    className="activity-bar__item"
                    title="Settings"
                    onClick={() => dispatch(toggleSettings())}
                >
                    <FontAwesomeIcon icon={faGear} />
                </div>
            </div>
        </div>
    )
}
