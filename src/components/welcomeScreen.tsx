import React, { useEffect } from 'react'
import { useAppDispatch } from '../app/hooks'
import * as gs from '../features/globalSlice'
import { dismissWelcome } from '../features/tools/toolSlice'
import { toggleSettings } from '../features/settings/settingsSlice'
import posthog from 'posthog-js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faFilePlus,
    faFolderOpen,
    faCodeBranch,
    faCog,
    faKeyboard,
} from '@fortawesome/pro-regular-svg-icons'

export function WelcomeScreen() {
    const dispatch = useAppDispatch()

    useEffect(() => {
        posthog.capture('Welcome Screen Viewed')
    }, [])

    const handleAction = (action: string) => {
        posthog.capture('Welcome Action', { action })
        if (action === 'new_file') {
            dispatch(gs.newFile({ parentFolderId: null }))
            dispatch(dismissWelcome())
        } else if (action === 'open_folder') {
            dispatch(gs.openFolder(null))
            // dismissWelcome might not be needed if folder opening triggers state change
        } else if (action === 'clone_repo') {
            dispatch(gs.openRemotePopup())
        }
    }

    return (
        <div className="welcome-container">
            <div className="welcome-content">
                <div className="welcome-header">
                    <div className="welcome-overline">
                        Created by Suryanshu Nabheet
                    </div>
                    <h1 className="welcome-title">CodeX</h1>
                    <p className="welcome-tagline">
                        The Enterprise IDE. Production Ready. Your Code,
                        Evolved.
                    </p>
                </div>

                <div className="welcome-grid">
                    <div className="welcome-section">
                        <div className="welcome-section-title">Start</div>
                        <div className="welcome-card-list">
                            <button
                                className="welcome-action-button"
                                onClick={() => handleAction('new_file')}
                            >
                                <div className="welcome-action-icon">
                                    <FontAwesomeIcon icon={faFilePlus} />
                                </div>
                                <div className="welcome-action-text">
                                    New File
                                </div>
                            </button>
                            <button
                                className="welcome-action-button"
                                onClick={() => handleAction('open_folder')}
                            >
                                <div className="welcome-action-icon">
                                    <FontAwesomeIcon icon={faFolderOpen} />
                                </div>
                                <div className="welcome-action-text">
                                    Open Folder...
                                </div>
                            </button>
                            <button
                                className="welcome-action-button"
                                onClick={() => handleAction('clone_repo')}
                            >
                                <div className="welcome-action-icon">
                                    <FontAwesomeIcon icon={faCodeBranch} />
                                </div>
                                <div className="welcome-action-text">
                                    Open Remote / SSH
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="welcome-section">
                        <div className="welcome-section-title">Recent</div>
                        <div className="welcome-card-list">
                            {/* Placeholder for Recent Projects */}
                            <div className="welcome-recent-item">
                                No recent projects
                            </div>
                        </div>
                    </div>

                    <div className="welcome-section">
                        <div className="welcome-section-title">Help</div>
                        <div className="welcome-card-list">
                            <button
                                className="welcome-action-button"
                                onClick={() => {
                                    dispatch(toggleSettings())
                                }}
                            >
                                <div className="welcome-action-icon">
                                    <FontAwesomeIcon icon={faKeyboard} />
                                </div>
                                <div className="welcome-action-text">
                                    Key Bindings
                                </div>
                            </button>
                            <button
                                className="welcome-action-button"
                                onClick={() => {
                                    dispatch(toggleSettings())
                                }}
                            >
                                <div className="welcome-action-icon">
                                    <FontAwesomeIcon icon={faCog} />
                                </div>
                                <div className="welcome-action-text">
                                    Settings
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="welcome-footer">
                    {/* Footer info/checkbox */}
                    <label
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                        }}
                    >
                        <input
                            type="checkbox"
                            onChange={(e) => {
                                if (e.target.checked) dispatch(dismissWelcome())
                            }}
                        />
                        <span>Don't show this again</span>
                    </label>
                </div>
            </div>
        </div>
    )
}

export default WelcomeScreen
