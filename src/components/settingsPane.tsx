import { useAppDispatch, useAppSelector } from '../app/hooks'
import cx from 'classnames'
import * as ssel from '../features/settings/settingsSelectors'
import {
    changeSettings,
    toggleSettings,
    setSettingsTab,
} from '../features/settings/settingsSlice'
import {
    installLanguageServer,
    runLanguageServer,
    stopLanguageServer,
} from '../features/lsp/languageServerSlice'
import { Switch } from '@headlessui/react'
import Dropdown from 'react-dropdown'
import 'react-dropdown/style.css'
import React, { useCallback, useEffect, useState, useMemo } from 'react'
import {
    getLanguages,
    languageServerStatus,
} from '../features/lsp/languageServerSelector'
import Modal from 'react-modal'
import { closeError } from '../features/globalSlice'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faTimes,
    faGear,
    faRobot,
    faCode,
    faUserCircle,
} from '@fortawesome/pro-regular-svg-icons'

export function SettingsPopup() {
    const dispatch = useAppDispatch()
    const settings = useAppSelector(ssel.getSettings)
    const isSettingsOpen = useAppSelector(ssel.getSettingsIsOpen)
    // Use selector instead of local state
    const activeTab = useAppSelector(ssel.getActiveSettingsTab)
    const languageServerNames = useAppSelector(getLanguages)

    const customStyles = {
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
        },
        content: {
            padding: '0',
            border: '1px solid var(--ui-border)',
            background: 'var(--black-elevated)',
            top: 'auto',
            left: 'auto',
            right: 'auto',
            bottom: 'auto',
            width: '850px',
            height: '650px',
            maxWidth: '95vw',
            maxHeight: '95vh',
            inset: 'auto',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 25px 70px rgba(0, 0, 0, 0.8)',
            overflow: 'hidden',
        },
    }

    return (
        <Modal
            isOpen={isSettingsOpen}
            onRequestClose={() => dispatch(toggleSettings())}
            style={customStyles}
            contentLabel="Settings"
        >
            <div className="settings-layout font-sans">
                <div className="settings-sidebar">
                    <div className="settings-sidebar-header">User Settings</div>
                    <div
                        className={cx('settings-sidebar-item', {
                            active: activeTab === 'General',
                        })}
                        onClick={() => dispatch(setSettingsTab('General'))}
                    >
                        <FontAwesomeIcon icon={faGear} />
                        General
                    </div>
                    <div
                        className={cx('settings-sidebar-item', {
                            active: activeTab === 'AI',
                        })}
                        onClick={() => dispatch(setSettingsTab('AI'))}
                    >
                        <FontAwesomeIcon icon={faRobot} />
                        AI & Models
                    </div>
                    <div
                        className={cx('settings-sidebar-item', {
                            active: activeTab === 'Languages',
                        })}
                        onClick={() => dispatch(setSettingsTab('Languages'))}
                    >
                        <FontAwesomeIcon icon={faCode} />
                        Language Servers
                    </div>
                    <div
                        className={cx('settings-sidebar-item', {
                            active: activeTab === 'Account',
                        })}
                        onClick={() => dispatch(setSettingsTab('Account'))}
                    >
                        <FontAwesomeIcon icon={faUserCircle} />
                        Account
                    </div>
                </div>
                <div className="settings-content">
                    {activeTab === 'General' && (
                        <div className="animate-fadeIn">
                            <div className="settings-section-title">
                                General
                            </div>

                            <div className="settings-group">
                                <label className="settings-label">
                                    Editor: Key Bindings
                                </label>
                                <div className="settings-description">
                                    Configure keyboard shortcuts for the editor.
                                </div>
                                <Dropdown
                                    options={[
                                        {
                                            value: 'none',
                                            label: 'Default (CodeX)',
                                        },
                                        { value: 'vim', label: 'Vim' },
                                        { value: 'emacs', label: 'Emacs' },
                                    ]}
                                    onChange={(e) =>
                                        dispatch(
                                            changeSettings({
                                                keyBindings: e.value,
                                            })
                                        )
                                    }
                                    value={settings.keyBindings}
                                    className="settings-dropdown"
                                />
                            </div>

                            <div className="settings-group">
                                <label className="settings-label">
                                    Editor: Text Wrapping
                                </label>
                                <div className="settings-description">
                                    Control whether lines wrap or scroll
                                    horizontally.
                                </div>
                                <Dropdown
                                    options={['enabled', 'disabled']}
                                    onChange={(e) =>
                                        dispatch(
                                            changeSettings({
                                                textWrapping: e.value,
                                            })
                                        )
                                    }
                                    value={settings.textWrapping}
                                    className="settings-dropdown"
                                />
                            </div>

                            <div className="settings-group">
                                <label className="settings-label">
                                    Editor: Tab Size
                                </label>
                                <div className="settings-description">
                                    Define the width of tab characters.
                                </div>
                                <Dropdown
                                    options={['2', '4', '8']}
                                    onChange={(e) =>
                                        dispatch(
                                            changeSettings({ tabSize: e.value })
                                        )
                                    }
                                    value={settings.tabSize}
                                    className="settings-dropdown"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'AI' && (
                        <div className="animate-fadeIn">
                            <div className="settings-section-title">
                                AI & Models
                            </div>
                            <OpenAIPanel
                                onSave={() => {
                                    dispatch(closeError())
                                }}
                            />
                        </div>
                    )}

                    {activeTab === 'Languages' && (
                        <div className="animate-fadeIn">
                            <div className="settings-section-title">
                                Language Servers
                            </div>
                            <div className="settings-description">
                                Install and manage protocol servers for
                                intelligent language features like
                                autocompletion and linting.
                            </div>
                            <div className="mt-8 space-y-4">
                                {languageServerNames.map((name) => (
                                    <LanguageServerPanel
                                        key={name}
                                        languageName={name}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    {activeTab === 'Account' && (
                        <div className="animate-fadeIn">
                            <div className="settings-section-title">
                                Account
                            </div>
                            <div className="settings-description">
                                Manage your CodeX account.
                            </div>
                            <div className="p-8 text-center text-ui-fg-muted bg-white/5 rounded-lg border border-white/5 mt-8">
                                <div className="text-3xl mb-4 opacity-50">
                                    <FontAwesomeIcon icon={faUserCircle} />
                                </div>
                                <div className="text-lg font-medium mb-2">
                                    No Account Synced
                                </div>
                                <div className="text-sm opacity-70 mb-6">
                                    Sign in to sync your settings and
                                    preferences.
                                </div>
                                <button className="primary-button bg-accent hover:bg-accent-hover px-6 py-2">
                                    Sign In / Sign Up
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <div
                    className="icon-button absolute top-6 right-8 text-ui-fg-muted hover:text-ui-fg transition-colors"
                    onClick={() => dispatch(toggleSettings())}
                >
                    <FontAwesomeIcon icon={faTimes} className="text-lg" />
                </div>
            </div>
        </Modal>
    )
}

export function OpenAIPanel({ onSave }: { onSave?: () => void }) {
    const settings = useAppSelector(ssel.getSettings)
    const [localAPIKey, setLocalAPIKey] = useState('')
    const [models, setAvailableModels] = useState<string[]>([])
    const [keyError, showKeyError] = useState(false)
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (settings.openAIKey && settings.openAIKey != localAPIKey) {
            setLocalAPIKey(settings.openAIKey)
            ssel.getModels(settings.openAIKey).then(({ models }) => {
                if (models) {
                    setAvailableModels(models)
                }
            })
        }
    }, [settings.openAIKey])

    useEffect(() => {
        showKeyError(false)
    }, [localAPIKey])

    const handleNewAPIKey = useCallback(async () => {
        const { models, isValidKey } = await ssel.getModels(localAPIKey)
        if (!isValidKey) {
            showKeyError(true)
            setAvailableModels([])
        } else {
            setAvailableModels(models)
            dispatch(
                changeSettings({
                    openAIKey: localAPIKey,
                    useOpenAIKey: true,
                    openAIModel: models.at(0) ?? null,
                })
            )
            if (onSave) onSave()
        }
    }, [dispatch, localAPIKey, onSave])

    return (
        <div className="settings-group">
            <label className="settings-label">OpenAI API Key</label>
            <div className="settings-description">
                Enter your OpenAI API key to access advanced AI models.
            </div>
            <div className="flex gap-2">
                <input
                    className={`settings-input ${
                        keyError ? 'border-red-500' : ''
                    }`}
                    placeholder="sk-..."
                    onChange={(e) => setLocalAPIKey(e.target.value)}
                    value={localAPIKey || ''}
                    spellCheck="false"
                    type="password"
                />
                <button
                    className="secondary-button !bg-white !text-black !border-transparent hover:!bg-gray-200 transition-all font-bold"
                    onClick={handleNewAPIKey}
                >
                    Save
                </button>
            </div>
            {keyError && (
                <div className="text-red-500 text-[11px] mt-2 font-medium">
                    Invalid API Key. Please verify and try again.
                </div>
            )}
            {settings.openAIKey && (
                <div className="mt-8 p-6 bg-black border border-gray-900 rounded-sm">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold uppercase tracking-wider opacity-60">
                            Enable AI Features
                        </span>
                        <Switch
                            checked={settings.useOpenAIKey}
                            onChange={(value) =>
                                dispatch(
                                    changeSettings({ useOpenAIKey: value })
                                )
                            }
                            className={cx(
                                'relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75',
                                settings.useOpenAIKey
                                    ? 'bg-gray-200'
                                    : 'bg-gray-800'
                            )}
                        >
                            <span
                                aria-hidden="true"
                                className={cx(
                                    'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
                                    settings.useOpenAIKey
                                        ? 'translate-x-5'
                                        : 'translate-x-0'
                                )}
                            />
                        </Switch>
                    </div>

                    {settings.useOpenAIKey && (
                        <div className="settings-group">
                            <label className="settings-label">Model</label>
                            <Dropdown
                                options={models}
                                onChange={(e) =>
                                    dispatch(
                                        changeSettings({ openAIModel: e.value })
                                    )
                                }
                                value={settings.openAIModel}
                                className="settings-dropdown"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function LanguageServerPanel({ languageName }: { languageName: string }) {
    const dispatch = useAppDispatch()
    const languageState = useAppSelector(languageServerStatus(languageName))

    const languageInstalled = useMemo(
        () => languageState && languageState.installed,
        [languageState]
    )
    const languageRunning = useMemo(
        () => languageState && languageState.running,
        [languageState]
    )

    const installServer = useCallback(async () => {
        await dispatch(installLanguageServer(languageName))
    }, [languageName])

    const runServer = useCallback(async () => {
        await dispatch(runLanguageServer(languageName))
    }, [languageName])
    const stopServer = useCallback(async () => {
        await dispatch(stopLanguageServer(languageName))
    }, [languageName])

    return (
        <div className="flex items-center justify-between p-4 bg-black border border-gray-900 rounded-sm mb-3 hover:border-gray-700 transition-colors">
            <div>
                <div className="text-sm font-medium">{languageName}</div>
                <div className="text-[11px] opacity-40 uppercase tracking-tight">
                    {languageInstalled
                        ? languageRunning
                            ? 'Running'
                            : 'Installed allow-start'
                        : 'Not Installed'}
                </div>
            </div>
            <div>
                {!languageInstalled ? (
                    <button
                        className="secondary-button text-[11px] py-1 px-3"
                        onClick={installServer}
                    >
                        Install
                    </button>
                ) : languageRunning ? (
                    <button
                        className="secondary-button text-[11px] py-1 px-3 border-red-500/30 text-red-500/80 hover:bg-red-500/10"
                        onClick={stopServer}
                    >
                        Stop
                    </button>
                ) : (
                    <button
                        className="primary-button text-[11px] py-1 px-3 bg-gray-700 hover:bg-gray-600"
                        onClick={runServer}
                    >
                        Start
                    </button>
                )}
            </div>
        </div>
    )
}
