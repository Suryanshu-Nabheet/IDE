import { useAppDispatch, useAppSelector } from '../app/hooks'

import { Switch } from '@headlessui/react'

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
// REMOVED CODEBASE-WIDE FEATURES!
// import { initializeIndex } from '../features/globalSlice'

import Dropdown from 'react-dropdown'
import 'react-dropdown/style.css'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
    getLanguages,
    languageServerStatus,
} from '../features/lsp/languageServerSelector'

import Modal from 'react-modal'

export function SettingsPopup() {
    const dispatch = useAppDispatch()
    const settings = useAppSelector(ssel.getSettings)
    const isSettingsOpen = useAppSelector(ssel.getSettingsIsOpen)
    const languageServerNames = useAppSelector(getLanguages)
    const synced: boolean = useAppSelector(
        (state) => state.global.repoProgress.state == 'done'
    )
    const embeddingOptions = useMemo(() => {
        if (synced) {
            return ['embeddings', 'none']
        } else {
            return ['none']
        }
    }, [synced])
    const [uploadPreference, setUploadPreference] = useState(false)
    useEffect(() => {
        // @ts-ignore
        connector.getUploadPreference().then((preference) => {
            setUploadPreference(preference)
        })
    }, [isSettingsOpen])

    const customStyles = {
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            zIndex: 10000,
        },
        content: {
            padding: 'none',
            bottom: 'none',
            background: 'none',
            border: 'none',
            marginLeft: 'auto',
            marginRight: 'auto',
            top: '130px',
            right: '40px',
            left: 'none',
            width: '500px',
        },
    }

    return (
        <>
            <Modal
                isOpen={isSettingsOpen}
                onRequestClose={() => {
                    dispatch(toggleSettings())
                }}
                style={customStyles}
            >
                <div className="settingsContainer">
                    <div className="settings">
                        <div
                            className="settings__dismiss"
                            onClick={() => {
                                dispatch(toggleSettings())
                            }}
                        >
                            <i className="fas fa-times"></i>
                        </div>
                        <div className="settings__title">SETTINGS</div>
                        <div className="settings__content">
                            <div className="settings__item">
                                <div className="settings__item_title">
                                    Key Bindings
                                </div>
                                <div className="settings__item_description">
                                    Controls whether to use vim, emacs, or none
                                </div>
                                <Dropdown
                                    options={['none', 'vim', 'emacs']}
                                    onChange={(e) => {
                                        dispatch(
                                            changeSettings({
                                                keyBindings: e.value,
                                            })
                                        )
                                    }}
                                    value={settings.keyBindings}
                                />
                            </div>

                            <div className="settings__item">
                                <div className="settings__item_title">
                                    Text Wrapping
                                </div>
                                <div className="settings__item_description">
                                    Controls whether text wrapping is enabled
                                </div>
                                <Dropdown
                                    options={['enabled', 'disabled']}
                                    onChange={(e) => {
                                        dispatch(
                                            changeSettings({
                                                textWrapping: e.value,
                                            })
                                        )
                                    }}
                                    value={settings.textWrapping}
                                />
                            </div>

                            <div className="settings__item">
                                <div className="settings__item_title">
                                    Tab Size
                                </div>
                                <div className="settings__item_description">
                                    Controls the tab size
                                </div>
                                <Dropdown
                                    options={['2', '4', '8']}
                                    onChange={(e) => {
                                        dispatch(
                                            changeSettings({
                                                tabSize: e.value,
                                            })
                                        )
                                    }}
                                    value={settings.tabSize}
                                />
                            </div>

                            <OpenAIPanel />
                            {/* REMOVED CODEBASE-WIDE FEATURES!
                            <RemoteCodebaseSettingsPanel />*/}
                            {languageServerNames.map((name) => (
                                <LanguageServerPanel
                                    key={name}
                                    languageName={name}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="cover-bar"></div>
                </div>
            </Modal>
        </>
    )
}

export function OpenAILoginPanel({ onSubmit }: { onSubmit: () => void }) {
    const settings = useAppSelector(ssel.getSettings)
    const [localAPIKey, setLocalAPIKey] = useState('')
    const [models, setAvailableModels] = useState<string[]>([])
    const [keyError, showKeyError] = useState(false)
    const dispatch = useAppDispatch()

    // When the global openai key changes, we change this one
    useEffect(() => {
        if (settings.openAIKey && settings.openAIKey != localAPIKey) {
            setLocalAPIKey(settings.openAIKey)
            ssel.getModels(settings.openAIKey).then(
                ({ models, isValidKey }) => {
                    if (models) {
                        setAvailableModels(models)
                    }
                }
            )
        }
    }, [settings.openAIKey])

    useEffect(() => {
        showKeyError(false)
    }, [localAPIKey])

    const handleNewAPIKey = useCallback(async () => {
        const { models, isValidKey } = await ssel.getModels(localAPIKey)
        if (!isValidKey) {
            // Error, and we let them know
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
            onSubmit()
        }
    }, [dispatch, localAPIKey])

    return (
        <div className="settings__item">
            <div className="flex">
                <input
                    className={`settings__item_textarea
                    ${keyError ? 'input-error' : ''}`}
                    placeholder="Enter your OpenAI API Key"
                    onChange={(e) => {
                        setLocalAPIKey(e.target.value)
                    }}
                    value={localAPIKey || ''}
                    spellCheck="false"
                />
                <button
                    className="settings__button"
                    onClick={() => {
                        handleNewAPIKey()
                    }}
                >
                    Submit
                </button>
            </div>
            {keyError && (
                <div className="error-message">
                    Invalid API Key. Please try again.
                </div>
            )}
            {settings.openAIKey && (
                <>
                    <div className="flex items-center">
                        <Switch
                            checked={settings.useOpenAIKey}
                            onChange={(value) =>
                                dispatch(
                                    changeSettings({ useOpenAIKey: value })
                                )
                            }
                            className={`${
                                settings.useOpenAIKey
                                    ? 'bg-green-500'
                                    : 'bg-red-500'
                            }
                                            mt-2 relative inline-flex h-[25px] w-[52px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
                        >
                            <span className="sr-only">Use setting</span>
                            <span
                                aria-hidden="true"
                                className={`${
                                    settings.useOpenAIKey
                                        ? 'translate-x-7'
                                        : 'translate-x-0'
                                }
                pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                            />
                        </Switch>
                        {settings.useOpenAIKey ? (
                            <span className="ml-2">Enabled</span>
                        ) : (
                            <span className="ml-2">Disabled</span>
                        )}
                    </div>
                    {settings.useOpenAIKey && (
                        <Dropdown
                            options={models}
                            onChange={(e) => {
                                dispatch(
                                    changeSettings({
                                        openAIModel: e.value,
                                    })
                                )
                            }}
                            value={settings.openAIModel}
                        />
                    )}
                </>
            )}
        </div>
    )
}

export function OpenAIPanel() {
    const settings = useAppSelector(ssel.getSettings)
    const [localAPIKey, setLocalAPIKey] = useState('')
    const [models, setAvailableModels] = useState<string[]>([])
    const [keyError, showKeyError] = useState(false)
    const dispatch = useAppDispatch()

    // When the global openai key changes, we change this one
    useEffect(() => {
        if (settings.openAIKey && settings.openAIKey != localAPIKey) {
            setLocalAPIKey(settings.openAIKey)
            ssel.getModels(settings.openAIKey).then(
                ({ models, isValidKey }) => {
                    if (models) {
                        setAvailableModels(models)
                    }
                }
            )
        }
    }, [settings.openAIKey])

    useEffect(() => {
        showKeyError(false)
    }, [localAPIKey])

    const handleNewAPIKey = useCallback(async () => {
        console.log('here 2')
        const { models, isValidKey } = await ssel.getModels(localAPIKey)
        console.log({ models, isValidKey })
        if (!isValidKey) {
            // Error, and we let them know
            console.log('here 3')
            showKeyError(true)
            setAvailableModels([])
        } else {
            setAvailableModels(models)
            console.log('here')
            dispatch(
                changeSettings({
                    openAIKey: localAPIKey,
                    useOpenAIKey: true,
                    openAIModel: models.at(0) ?? null,
                })
            )
        }
    }, [dispatch, localAPIKey])

    return (
        <div className="settings__item">
            <div className="settings__item_title">OpenAI API Key</div>
            <div className="settings__item_description">
                You can enter an OpenAI API key to use Cursor at-cost
            </div>
            <div className="flex">
                <input
                    className={`settings__item_textarea
                    ${keyError ? 'input-error' : ''}`}
                    placeholder="Enter your OpenAI API Key"
                    onChange={(e) => {
                        setLocalAPIKey(e.target.value)
                    }}
                    value={localAPIKey || ''}
                    spellCheck="false"
                />
                <button
                    className="settings__button"
                    onClick={() => {
                        handleNewAPIKey()
                    }}
                >
                    Submit
                </button>
            </div>
            {keyError && (
                <div className="error-message">
                    Invalid API Key. Please try again.
                </div>
            )}
            {settings.openAIKey && (
                <>
                    <div className="flex items-center">
                        <Switch
                            checked={settings.useOpenAIKey}
                            onChange={(value) =>
                                dispatch(
                                    changeSettings({ useOpenAIKey: value })
                                )
                            }
                            className={`${
                                settings.useOpenAIKey
                                    ? 'bg-green-500'
                                    : 'bg-red-500'
                            }
                                            mt-2 relative inline-flex h-[24px] w-[52px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
                        >
                            <span className="sr-only">Use setting</span>
                            <span
                                aria-hidden="true"
                                className={`${
                                    settings.useOpenAIKey
                                        ? 'translate-x-7'
                                        : 'translate-x-0'
                                }
                pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                            />
                        </Switch>
                        {settings.useOpenAIKey ? (
                            <span className="ml-2">Enabled</span>
                        ) : (
                            <span className="ml-2">Disabled</span>
                        )}
                    </div>
                    {settings.useOpenAIKey && (
                        <Dropdown
                            options={models}
                            onChange={(e) => {
                                dispatch(
                                    changeSettings({
                                        openAIModel: e.value,
                                    })
                                )
                            }}
                            value={settings.openAIModel}
                        />
                    )}
                </>
            )}
        </div>
    )
}

// REMOVED CODEBASE-WIDE FEATURES!
// function RemoteCodebaseSettingsPanel() {
//     const dispatch = useAppDispatch()
//     const repoId = useAppSelector((state) => state.global.repoId)
//     const rootDir = useAppSelector(getRootPath)
//     const progress = useAppSelector(getProgress)
//     const finished = useMemo(() => progress.state == 'done', [progress])

//     const startUpload = useCallback(async () => {
//         dispatch(initializeIndex(rootDir!))
//     }, [dispatch])

//     let container
//     if (repoId == null) {
//         container = (
//             <div className="remote_codebase__container">
//                 <button onClick={startUpload}>Start Index</button>
//             </div>
//         )
//     } else if (!finished) {
//         container = (
//             <div className="remote_codebase__container">
//                 <div className="remote_codebase__text">
//                     {(() => {
//                         switch (progress.state) {
//                             case 'notStarted':
//                                 return 'Not started'
//                             case 'uploading':
//                                 return 'Uploading...'
//                             case 'indexing':
//                                 return 'Indexing...'
//                             case 'done':
//                                 return 'Done!'
//                             case 'error':
//                                 return 'Failed!'
//                             case null:
//                                 return <br />
//                         }
//                     })()}
//                 </div>
//                 {progress.state != 'notStarted' && progress.state != null && (
//                     <>
//                         <div className="remote_codebase__progress">
//                             <div
//                                 className="remote_codebase__progress_bar"
//                                 style={{
//                                     width: `${progress.progress * 100}%`,
//                                     color: 'green',
//                                 }}
//                             />
//                         </div>
//                         <div className="remote_codebase__progress_text">
//                             {Math.floor(progress.progress * 100.0)}%
//                         </div>
//                     </>
//                 )}
//             </div>
//         )
//     } else {
//         container = (
//             <div className="remote_codebase__container">
//                 <div className="remote_codebase__progress_text">Done!</div>
//             </div>
//         )
//     }

//     return <div className="settings__item"></div>
// }

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

    let container
    if (languageInstalled) {
        container = (
            <div className="language_server__container">
                <div className="language_server__status">
                    {languageRunning ? 'Running' : 'Stopped'}
                </div>
                <div className="auth__signin">
                    {languageRunning ? (
                        <button onClick={stopServer}>Stop</button>
                    ) : (
                        <button onClick={runServer}>Run</button>
                    )}
                </div>
            </div>
        )
    } else {
        container = (
            <div className="auth__signin">
                <button onClick={installServer}>Install</button>
            </div>
        )
    }

    return (
        <div className="settings__item">
            <div className="settings__item_title">
                {languageName} Language Server
            </div>
            {container}
        </div>
    )
}
