import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faCodeBranch,
    faCircleCheck,
    faBell,
    faTowerBroadcast,
} from '@fortawesome/pro-regular-svg-icons'

export const StatusBar = () => {
    return (
        <div className="status-bar">
            <div className="status-bar__left">
                <div
                    className="status-bar__item status-bar__item--main"
                    title="Connections"
                >
                    <FontAwesomeIcon icon={faTowerBroadcast} className="mr-2" />
                    <span>Connected</span>
                </div>
                <div className="status-bar__item" title="Git Branch">
                    <FontAwesomeIcon icon={faCodeBranch} className="mr-2" />
                    <span>main*</span>
                </div>
                <div className="status-bar__item" title="Problems">
                    <FontAwesomeIcon
                        icon={faCircleCheck}
                        className="mr-2 text-green-400"
                    />
                    <span>0</span>
                </div>
            </div>

            <div className="status-bar__center">
                <span style={{ fontSize: '10px', opacity: 0.5 }}>
                    © 2026 CodeX IDE - Built By Suryanshu Nabheet
                </span>
            </div>

            <div className="status-bar__right">
                <div className="status-bar__item">
                    <span>Spaces: 4</span>
                </div>
                <div className="status-bar__item">
                    <span>UTF-8</span>
                </div>
                <div className="status-bar__item" title="Language Mode">
                    <span>TypeScript JSX</span>
                </div>
                <div className="status-bar__item" title="Notifications">
                    <FontAwesomeIcon icon={faBell} />
                </div>
            </div>
        </div>
    )
}
