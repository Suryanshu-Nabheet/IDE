import { useAppDispatch, useAppSelector } from '../app/hooks'
import * as ssel from '../features/settings/settingsSelectors'
import {
    changeSettings,
    toggleSettings,
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

export function SettingsPopup() {
    const dispatch = useAppDispatch()
    const settings = useAppSelector(ssel.getSettings)
    const isSettingsOpen = useAppSelector(ssel.getSettingsIsOpen)
    const languageServerNames = useAppSelector(getLanguages)
    const [activeTab, setActiveTab] = useState('General')

    const customStyles = {
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            backdropFilter: 'blur(2px)',
        },
        content: {
            padding: '0',
            border: 'none',
            background: 'none',
            top: 'auto',
            left: 'auto',
            right: 'auto',
            bottom: 'auto',
            width: '800px',
            height: '600px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            inset: 'auto', // Managed by overlay flex
            borderRadius: '8px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        },
    }

    return (
        <Modal
            isOpen={isSettingsOpen}
            onRequestClose={() => dispatch(toggleSettings())}
            style={customStyles}
            contentLabel="Settings"
        >
            <div className="settings-layout">
                <div className="settings-sidebar">
                    <div
                        style={{
                            padding: '1.5rem',
                            fontWeight: 'bold',
                            fontSize: '1.1rem',
                            opacity: 0.8,
                        }}
                    >
                        Settings
                    </div>
                    <div
                        className={`settings-sidebar-item ${
                            activeTab === 'General' ? 'active' : ''
                        }`}
                        onClick={() => setActiveTab('General')}
                    >
                        General
                    </div>
                    <div
                        className={`settings-sidebar-item ${
                            activeTab === 'AI' ? 'active' : ''
                        }`}
                        onClick={() => setActiveTab('AI')}
                    >
                        AI & Models
                    </div>
                    <div
                        className={`settings-sidebar-item ${
                            activeTab === 'Languages' ? 'active' : ''
                        }`}
                        onClick={() => setActiveTab('Languages')}
                    >
                        Language Servers
                    </div>
                </div>
                <div className="settings-content">
                    {activeTab === 'General' && (
                        <div className="settings-group">
                            <div className="settings-section-title">
                                General
                            </div>

                            <div className="settings-group">
                                <label className="settings-label">
                                    Key Bindings
                                </label>
                                <div className="settings-description">
                                    Choose your preferred keyboard shortcuts.
                                </div>
                                <Dropdown
                                    options={[
                                        { value: 'none', label: 'Default' },
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
                                    Text Wrapping
                                </label>
                                <div className="settings-description">
                                    Control how lines behave when they exceed
                                    the viewport width.
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
                                    Tab Size
                                </label>
                                <div className="settings-description">
                                    Number of spaces per tab.
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
                        <div className="settings-group">
                            <div className="settings-section-title">
                                AI Configuration
                            </div>
                            <OpenAIPanel
                                onSave={() => {
                                    dispatch(closeError())
                                }}
                            />
                        </div>
                    )}

                    {activeTab === 'Languages' && (
                        <div className="settings-group">
                            <div className="settings-section-title">
                                Language Servers
                            </div>
                            <div className="settings-description">
                                Manage LSP installations for intelligent code
                                features.
                            </div>
                            {languageServerNames.map((name) => (
                                <LanguageServerPanel
                                    key={name}
                                    languageName={name}
                                />
                            ))}
                        </div>
                    )}
                </div>
                <div
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        cursor: 'pointer',
                        padding: '10px',
                        opacity: 0.5,
                    }}
                    onClick={() => dispatch(toggleSettings())}
                >
                    <i className="fas fa-times"></i>
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
                    className="welcome-action-button"
                    style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}
                    onClick={handleNewAPIKey}
                >
                    Save
                </button>
            </div>
            {keyError && (
                <div className="text-red-500 text-sm mt-2">
                    Invalid API Key. Please try again.
                </div>
            )}

            {settings.openAIKey && (
                <div className="mt-4 p-4 bg-black/10 rounded-md">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium">
                            Enable AI Features
                        </span>
                        <Switch
                            checked={settings.useOpenAIKey}
                            onChange={(value) =>
                                dispatch(
                                    changeSettings({ useOpenAIKey: value })
                                )
                            }
                            className={`${
                                settings.useOpenAIKey
                                    ? 'bg-blue-600'
                                    : 'bg-gray-600'
                            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                        >
                            <span
                                className={`${
                                    settings.useOpenAIKey
                                        ? 'translate-x-6'
                                        : 'translate-x-1'
                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
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
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-md mb-2">
            <div>
                <div className="font-medium">{languageName}</div>
                <div className="text-xs text-white/50">
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
                        className="welcome-action-button text-xs py-1 px-3"
                        onClick={installServer}
                    >
                        Install
                    </button>
                ) : languageRunning ? (
                    <button
                        className="welcome-action-button text-xs py-1 px-3 bg-red-500/20 text-red-300 hover:bg-red-500/40"
                        onClick={stopServer}
                    >
                        Stop
                    </button>
                ) : (
                    <button
                        className="welcome-action-button text-xs py-1 px-3 bg-green-500/20 text-green-300 hover:bg-green-500/40"
                        onClick={runServer}
                    >
                        Run
                    </button>
                )}
            </div>
        </div>
    )
}
