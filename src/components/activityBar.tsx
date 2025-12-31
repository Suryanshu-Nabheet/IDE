import React from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import {
    getLeftTab,
    getLeftSideExpanded,
} from '../features/tools/toolSelectors'
import {
    openFileTree,
    openSearch,
    collapseLeftSide,
    expandLeftSide,
} from '../features/tools/toolSlice'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faFiles,
    faMagnifyingGlass,
    faGear,
    faUserCircle,
} from '@fortawesome/pro-regular-svg-icons'

export const ActivityBar = () => {
    const dispatch = useAppDispatch()
    const activeTab = useAppSelector(getLeftTab)
    const isExpanded = useAppSelector(getLeftSideExpanded)

    const handleTabClick = (tab: 'filetree' | 'search') => {
        if (activeTab === tab && isExpanded) {
            dispatch(collapseLeftSide())
        } else {
            if (tab === 'filetree') {
                dispatch(openFileTree())
            } else {
                dispatch(openSearch())
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
            </div>
            <div className="activity-bar__bottom">
                <div className="activity-bar__item" title="Accounts">
                    <FontAwesomeIcon icon={faUserCircle} />
                </div>
                <div className="activity-bar__item" title="Settings">
                    <FontAwesomeIcon icon={faGear} />
                </div>
            </div>
        </div>
    )
}
