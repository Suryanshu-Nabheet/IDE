import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import * as gs from '../features/globalSlice'
import { dismissWelcome } from '../features/tools/toolSlice'
import { toggleSettings } from '../features/settings/settingsSlice'
import { getRecentProjects, getVersion } from '../features/selectors'
import posthog from 'posthog-js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faFilePlus,
    faFolderOpen,
    faCodeBranch,
    faCog,
    faKeyboard,
    faGraduationCap,
    faClock,
} from '@fortawesome/pro-regular-svg-icons'
import { getNameFromPath } from '../features/window/fileUtils'

export function WelcomeScreen() {
    const dispatch = useAppDispatch()
    const recentProjects = useAppSelector(getRecentProjects)
    const version = useAppSelector(getVersion) as string

    useEffect(() => {
        posthog.capture('Welcome Screen Viewed')
    }, [])

    const handleAction = (action: string, payload?: any) => {
        posthog.capture('Welcome Action', { action })
        if (action === 'new_file') {
            dispatch(gs.newFile({ parentFolderId: null }))
            dispatch(dismissWelcome())
        } else if (action === 'open_folder') {
            dispatch(gs.openFolder(null))
        } else if (action === 'clone_repo') {
            dispatch(gs.openRemotePopup())
        } else if (action === 'interactive_tutorial') {
            dispatch(gs.openTutorFolder(null))
            dispatch(dismissWelcome())
        } else if (action === 'open_recent') {
            dispatch(gs.trulyOpenFolder(payload))
            dispatch(dismissWelcome())
        }
    }

    return (
        <div className="welcome-container">
            <div className="welcome-content">
                <header className="welcome-header">
                    <h1 className="welcome-title">CodeX</h1>
                    <div className="welcome-title-line"></div>
                    <p className="welcome-motto">
                        Press <kbd>⌘</kbd> <kbd>K</kbd> to unlock the power of
                        CodeX AI
                    </p>
                </header>

                <main className="welcome-grid">
                    <section className="welcome-section">
                        <h2 className="welcome-section-title">Start</h2>
                        <div className="welcome-card-list">
                            <button
                                className="welcome-action-button"
                                onClick={() => handleAction('new_file')}
                            >
                                <span className="welcome-action-icon">
                                    <FontAwesomeIcon icon={faFilePlus} />
                                </span>
                                <span className="welcome-action-text">
                                    New File
                                </span>
                            </button>
                            <button
                                className="welcome-action-button"
                                onClick={() => handleAction('open_folder')}
                            >
                                <span className="welcome-action-icon">
                                    <FontAwesomeIcon icon={faFolderOpen} />
                                </span>
                                <span className="welcome-action-text">
                                    Open Workspace
                                </span>
                            </button>
                            <button
                                className="welcome-action-button"
                                onClick={() => handleAction('clone_repo')}
                            >
                                <span className="welcome-action-icon">
                                    <FontAwesomeIcon icon={faCodeBranch} />
                                </span>
                                <span className="welcome-action-text">
                                    Clone Repository
                                </span>
                            </button>
                            <button
                                className="welcome-action-button"
                                onClick={() =>
                                    handleAction('interactive_tutorial')
                                }
                            >
                                <span className="welcome-action-icon">
                                    <FontAwesomeIcon icon={faGraduationCap} />
                                </span>
                                <span className="welcome-action-text">
                                    Interactive Tutorial
                                </span>
                            </button>
                        </div>

                        <h2
                            className="welcome-section-title"
                            style={{ marginTop: '2.5rem' }}
                        >
                            Configuration
                        </h2>
                        <div className="welcome-card-list">
                            <button
                                className="welcome-action-button"
                                onClick={() => dispatch(toggleSettings())}
                            >
                                <span className="welcome-action-icon">
                                    <FontAwesomeIcon icon={faKeyboard} />
                                </span>
                                <span className="welcome-action-text">
                                    Key Bindings
                                </span>
                            </button>
                            <button
                                className="welcome-action-button"
                                onClick={() => dispatch(toggleSettings())}
                            >
                                <span className="welcome-action-icon">
                                    <FontAwesomeIcon icon={faCog} />
                                </span>
                                <span className="welcome-action-text">
                                    Global Settings
                                </span>
                            </button>
                        </div>
                    </section>

                    <section className="welcome-section">
                        <h2 className="welcome-section-title">Recent</h2>
                        <div className="welcome-card-list">
                            {recentProjects.length > 0 ? (
                                recentProjects.map((path) => (
                                    <button
                                        key={path}
                                        className="welcome-action-button"
                                        onClick={() =>
                                            handleAction('open_recent', path)
                                        }
                                    >
                                        <span className="welcome-action-icon">
                                            <FontAwesomeIcon icon={faClock} />
                                        </span>
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                            }}
                                        >
                                            <span className="welcome-action-text">
                                                {getNameFromPath(path)}
                                            </span>
                                            <span
                                                className="welcome-recent-item-path"
                                                title={path}
                                            >
                                                {path.length > 45
                                                    ? '...' + path.slice(-42)
                                                    : path}
                                            </span>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="welcome-empty-state">
                                    No recent projects found
                                </div>
                            )}
                        </div>
                    </section>
                </main>

                <footer className="welcome-footer">
                    <div className="welcome-author">
                        V{version?.toUpperCase() || '0.0.11'} &mdash; BUILT BY{' '}
                        <span>SURYANSHU NABHEET</span>
                    </div>
                </footer>
            </div>
        </div>
    )
}

export default WelcomeScreen
