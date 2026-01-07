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
import { Switch, Listbox } from '@headlessui/react'
import React, { useCallback, useState, useMemo } from 'react'
import {
    getLanguages,
    languageServerStatus,
} from '../features/lsp/languageServerSelector'
import { closeError } from '../features/globalSlice'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faTimes,
    faGear,
    faRobot,
    faCode,
    faUserCircle,
    faMinus,
    faPlus,
    faCheck,
    faChevronDown,
    faDesktop,
    faKeyboard,
} from '@fortawesome/pro-regular-svg-icons'

export function SettingsPopup() {
    const dispatch = useAppDispatch()
    const settings = useAppSelector(ssel.getSettings)
    const isSettingsOpen = useAppSelector(ssel.getSettingsIsOpen)
    const activeTab = useAppSelector(ssel.getActiveSettingsTab)
    const languageServerNames = useAppSelector(getLanguages)

    if (!isSettingsOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ui-bg)]/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-[900px] h-[650px] bg-[var(--ui-bg)] border border-[var(--ui-border)] rounded-xl shadow-2xl flex overflow-hidden font-sans">
                {/* Sidebar */}
                <div className="w-64 bg-[var(--ui-bg)] border-r border-[var(--ui-border)] flex flex-col">
                    <div className="p-6">
                        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2">
                            Settings
                        </h2>
                    </div>
                    <nav className="flex-1 px-4 space-y-1">
                        <SidebarItem
                            icon={faGear}
                            label="General"
                            isActive={activeTab === 'General'}
                            onClick={() => dispatch(setSettingsTab('General'))}
                        />
                        <SidebarItem
                            icon={faRobot}
                            label="AI & Models"
                            isActive={activeTab === 'AI'}
                            onClick={() => dispatch(setSettingsTab('AI'))}
                        />
                        <SidebarItem
                            icon={faCode}
                            label="Language Servers"
                            isActive={activeTab === 'Languages'}
                            onClick={() =>
                                dispatch(setSettingsTab('Languages'))
                            }
                        />
                        <SidebarItem
                            icon={faUserCircle}
                            label="Account"
                            isActive={activeTab === 'Account'}
                            onClick={() => dispatch(setSettingsTab('Account'))}
                        />
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col min-w-0 bg-[var(--ui-bg)]">
                    {/* Header */}
                    <div className="h-16 border-b border-[var(--ui-border)] flex items-center justify-between px-8 shrink-0">
                        <h1 className="text-lg font-medium text-[var(--ui-fg)]">
                            {activeTab === 'AI' ? 'AI & Models' : activeTab}
                        </h1>
                        <button
                            onClick={() => dispatch(toggleSettings())}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>

                    {/* Scrollable Area */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        {activeTab === 'General' && (
                            <div className="space-y-10 max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {/* Appearance Section */}
                                <section>
                                    <div className="flex items-center gap-2 mb-6">
                                        <FontAwesomeIcon
                                            icon={faDesktop}
                                            className="text-blue-400"
                                        />
                                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                                            Appearance
                                        </h3>
                                    </div>

                                    <div className="space-y-6">
                                        <SettingsGroup
                                            label="Color Theme"
                                            description="Select the color theme for the editor and UI."
                                        >
                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    {
                                                        value: 'codex-dark',
                                                        label: 'CodeX Dark',
                                                        color: '#000000',
                                                    },
                                                    {
                                                        value: 'monokai',
                                                        label: 'Monokai',
                                                        color: '#272822',
                                                    },
                                                    {
                                                        value: 'dracula',
                                                        label: 'Dracula',
                                                        color: '#282a36',
                                                    },
                                                    {
                                                        value: 'github-dark',
                                                        label: 'GitHub Dark',
                                                        color: '#0d1117',
                                                    },
                                                    {
                                                        value: 'solarized-dark',
                                                        label: 'Solarized Dark',
                                                        color: '#002b36',
                                                    },
                                                    {
                                                        value: 'nord',
                                                        label: 'Nord',
                                                        color: '#2e3440',
                                                    },
                                                    {
                                                        value: 'one-dark',
                                                        label: 'One Dark',
                                                        color: '#282c34',
                                                    },
                                                ].map((theme) => (
                                                    <ThemeCard
                                                        key={theme.value}
                                                        label={theme.label}
                                                        color={theme.color}
                                                        isActive={
                                                            (settings.theme ||
                                                                'codex-dark') ===
                                                            theme.value
                                                        }
                                                        onClick={() =>
                                                            dispatch(
                                                                changeSettings({
                                                                    theme: theme.value,
                                                                })
                                                            )
                                                        }
                                                    />
                                                ))}
                                            </div>
                                        </SettingsGroup>

                                        <SettingsGroup
                                            label="Font Family"
                                            description="Choose the font family for the editor."
                                        >
                                            <CustomListbox
                                                value={
                                                    settings.fontFamily ||
                                                    'JetBrains Mono'
                                                }
                                                onChange={(val: string) =>
                                                    dispatch(
                                                        changeSettings({
                                                            fontFamily: val,
                                                        })
                                                    )
                                                }
                                                options={[
                                                    'JetBrains Mono',
                                                    'Fira Code',
                                                    'Source Code Pro',
                                                    'Menlo',
                                                    'Monaco',
                                                    'Consolas',
                                                ]}
                                            />
                                        </SettingsGroup>

                                        <SettingsGroup
                                            label="Font Size"
                                            description="Set the font size for the editor and terminal."
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center bg-[var(--ui-fg)]/5 rounded-lg border border-[var(--ui-border)] p-1">
                                                    <button
                                                        className="w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--ui-fg)]/10 text-[var(--ui-fg-muted)] hover:text-[var(--ui-fg)] transition-colors"
                                                        onClick={() => {
                                                            const current =
                                                                parseInt(
                                                                    settings.fontSize ||
                                                                        '13'
                                                                )
                                                            if (current > 8) {
                                                                dispatch(
                                                                    changeSettings(
                                                                        {
                                                                            fontSize:
                                                                                (
                                                                                    current -
                                                                                    1
                                                                                ).toString(),
                                                                        }
                                                                    )
                                                                )
                                                            }
                                                        }}
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faMinus}
                                                            size="sm"
                                                        />
                                                    </button>
                                                    <div className="w-12 text-center font-mono text-sm text-[var(--ui-fg)]">
                                                        {settings.fontSize ||
                                                            '13'}
                                                    </div>
                                                    <button
                                                        className="w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--ui-fg)]/10 text-[var(--ui-fg-muted)] hover:text-[var(--ui-fg)] transition-colors"
                                                        onClick={() => {
                                                            const current =
                                                                parseInt(
                                                                    settings.fontSize ||
                                                                        '13'
                                                                )
                                                            if (current < 48) {
                                                                dispatch(
                                                                    changeSettings(
                                                                        {
                                                                            fontSize:
                                                                                (
                                                                                    current +
                                                                                    1
                                                                                ).toString(),
                                                                        }
                                                                    )
                                                                )
                                                            }
                                                        }}
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faPlus}
                                                            size="sm"
                                                        />
                                                    </button>
                                                </div>
                                                <span className="text-xs text-[var(--ui-fg-muted)]">
                                                    pixels
                                                </span>
                                            </div>
                                        </SettingsGroup>
                                    </div>
                                </section>

                                {/* Editor Section */}
                                <section className="pt-6 border-t border-white/5">
                                    <div className="flex items-center gap-2 mb-6">
                                        <FontAwesomeIcon
                                            icon={faKeyboard}
                                            className="text-emerald-400"
                                        />
                                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                                            Editor
                                        </h3>
                                    </div>

                                    <div className="space-y-6">
                                        <SettingsGroup
                                            label="Key Bindings"
                                            description="Configure keyboard shortcuts for the editor behavior."
                                        >
                                            <CustomListbox
                                                value={
                                                    settings.keyBindings ||
                                                    'none'
                                                }
                                                onChange={(val: string) =>
                                                    dispatch(
                                                        changeSettings({
                                                            keyBindings: val,
                                                        })
                                                    )
                                                }
                                                options={[
                                                    {
                                                        id: 'none',
                                                        name: 'Default (CodeX)',
                                                    },
                                                    { id: 'vim', name: 'Vim' },
                                                    {
                                                        id: 'emacs',
                                                        name: 'Emacs',
                                                    },
                                                ]}
                                            />
                                        </SettingsGroup>

                                        <div className="flex items-center justify-between py-2">
                                            <div>
                                                <div className="text-sm font-medium text-gray-200">
                                                    Text Wrapping
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Control whether lines wrap
                                                    or scroll horizontally.
                                                </div>
                                            </div>
                                            <CustomSwitch
                                                checked={
                                                    settings.textWrapping ===
                                                    'enabled'
                                                }
                                                onChange={(checked: boolean) =>
                                                    dispatch(
                                                        changeSettings({
                                                            textWrapping:
                                                                checked
                                                                    ? 'enabled'
                                                                    : 'disabled',
                                                        })
                                                    )
                                                }
                                            />
                                        </div>

                                        <SettingsGroup
                                            label="Tab Size"
                                            description="The number of spaces a tab is equal to."
                                        >
                                            <CustomListbox
                                                value={settings.tabSize || '4'}
                                                onChange={(val: string) =>
                                                    dispatch(
                                                        changeSettings({
                                                            tabSize: val,
                                                        })
                                                    )
                                                }
                                                options={['2', '4', '8']}
                                                width="w-32"
                                            />
                                        </SettingsGroup>
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === 'AI' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <AIProvidersPanel
                                    onSave={() => dispatch(closeError())}
                                />
                            </div>
                        )}

                        {activeTab === 'Languages' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <p className="text-sm text-gray-400 mb-8 max-w-lg">
                                    Install and manage Language Servers to
                                    enable intelligent features like
                                    autocompletion, go-to-definition, and
                                    diagnostics for your favorite languages.
                                </p>
                                <div className="grid gap-3">
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
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col items-center justify-center py-20">
                                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 text-gray-500 text-4xl">
                                    <FontAwesomeIcon icon={faUserCircle} />
                                </div>
                                <h2 className="text-2xl font-semibold text-white mb-2">
                                    Sign in to CodeX
                                </h2>
                                <p className="text-gray-400 text-center max-w-sm mb-8">
                                    Sync your settings, extensions, and AI
                                    preferences across all your devices.
                                </p>
                                <div className="flex gap-4">
                                    <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">
                                        Sign In
                                    </button>
                                    <button className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors border border-white/10">
                                        Create Account
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// --- Subcomponents ---

function SidebarItem({ icon, label, isActive, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={cx(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                isActive
                    ? 'bg-blue-600/10 text-blue-400'
                    : 'text-[var(--ui-fg-muted)] hover:text-[var(--ui-fg)] hover:bg-[var(--ui-fg)]/5'
            )}
        >
            <FontAwesomeIcon
                icon={icon}
                className={cx(
                    'transition-colors',
                    isActive
                        ? 'text-blue-400'
                        : 'text-[var(--ui-fg-muted)] group-hover:text-[var(--ui-fg)]'
                )}
            />
            {label}
        </button>
    )
}

function SettingsGroup({ label, description, children }: any) {
    return (
        <div>
            <div className="mb-3">
                <div className="text-sm font-medium text-[var(--ui-fg)] mb-1">
                    {label}
                </div>
                <div className="text-xs text-[var(--ui-fg-muted)]">
                    {description}
                </div>
            </div>
            {children}
        </div>
    )
}

function ThemeCard({ label, color, isActive, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={cx(
                'relative flex items-center gap-3 p-3 rounded-lg border text-left transition-all duration-200 group',
                isActive
                    ? 'bg-blue-600/10 border-blue-500/50 ring-1 ring-blue-500/20'
                    : 'bg-[var(--ui-fg)]/5 border-[var(--ui-border)] hover:bg-[var(--ui-fg)]/10 hover:border-[var(--ui-fg)]/10'
            )}
        >
            <div
                className="w-10 h-10 rounded-md shadow-sm flex-shrink-0 border border-[var(--ui-border)]"
                style={{ backgroundColor: color }}
            />
            <span
                className={cx(
                    'text-sm font-medium',
                    isActive
                        ? 'text-blue-100'
                        : 'text-[var(--ui-fg-muted)] group-hover:text-[var(--ui-fg)]'
                )}
            >
                {label}
            </span>
            {isActive && (
                <div className="absolute top-2 right-2 text-blue-400">
                    <FontAwesomeIcon icon={faCheck} size="xs" />
                </div>
            )}
        </button>
    )
}

function CustomListbox({ value, onChange, options, width = 'w-full' }: any) {
    const selected =
        typeof value === 'object'
            ? value
            : options.find((o: any) => o === value || o.id === value) || value
    const displayValue = typeof selected === 'object' ? selected.name : selected

    return (
        <Listbox value={value} onChange={onChange}>
            <div className={`relative ${width}`}>
                <Listbox.Button className="relative w-full cursor-default rounded-lg bg-[var(--ui-bg)] border border-[var(--ui-border)] py-2.5 pl-3 pr-10 text-left text-sm text-[var(--ui-fg)] shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-white/20 transition-colors">
                    <span className="block truncate">{displayValue}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400">
                        <FontAwesomeIcon icon={faChevronDown} size="xs" />
                    </span>
                </Listbox.Button>
                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-[var(--ui-bg)] py-1 text-sm shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-100">
                    {options.map((option: any, idx: number) => {
                        const optValue =
                            typeof option === 'object' ? option.id : option
                        const optLabel =
                            typeof option === 'object' ? option.name : option
                        return (
                            <Listbox.Option
                                key={idx}
                                className={({ active }) =>
                                    `relative cursor-pointer select-none py-2 pl-3 pr-4 transition-colors ${
                                        active
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-300'
                                    }`
                                }
                                value={optValue}
                            >
                                {({ selected }) => (
                                    <>
                                        <span
                                            className={`block truncate ${
                                                selected
                                                    ? 'font-medium text-white'
                                                    : 'font-normal'
                                            }`}
                                        >
                                            {optLabel}
                                        </span>
                                        {selected && (
                                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-400"></span>
                                        )}
                                    </>
                                )}
                            </Listbox.Option>
                        )
                    })}
                </Listbox.Options>
            </div>
        </Listbox>
    )
}

function CustomSwitch({ checked, onChange }: any) {
    return (
        <Switch
            checked={checked}
            onChange={onChange}
            className={`${
                checked ? 'bg-blue-600' : 'bg-white/10'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black`}
        >
            <span
                className={`${
                    checked ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200`}
            />
        </Switch>
    )
}

// Comprehensive AI Providers Panel
function AIProvidersPanel({ onSave }: { onSave?: () => void }) {
    const settings = useAppSelector(ssel.getSettings)
    const dispatch = useAppDispatch()
    const [selectedProvider, setSelectedProvider] = useState<
        'openai' | 'openrouter' | 'gemini' | 'claude'
    >(settings.aiProvider || 'openai')

    return (
        <div className="space-y-8 max-w-3xl">
            {/* Provider Selection */}
            <SettingsGroup
                label="AI Provider"
                description="Choose which AI provider to use for coding assistance, chat, and generation."
            >
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { id: 'openai', name: 'OpenAI', color: '#10a37f' },
                        { id: 'openrouter', name: 'OpenRouter', color: '#6366f1' },
                        { id: 'gemini', name: 'Google Gemini', color: '#4285f4' },
                        { id: 'claude', name: 'Anthropic Claude', color: '#d97706' },
                    ].map((provider) => (
                        <button
                            key={provider.id}
                            onClick={() => {
                                setSelectedProvider(provider.id as any)
                                dispatch(
                                    changeSettings({
                                        aiProvider: provider.id as any,
                                    })
                                )
                            }}
                            className={cx(
                                'p-4 rounded-lg border text-left transition-all',
                                selectedProvider === provider.id
                                    ? 'bg-blue-600/10 border-blue-500/50 ring-1 ring-blue-500/20'
                                    : 'bg-[var(--ui-fg)]/5 border-[var(--ui-border)] hover:bg-[var(--ui-fg)]/10'
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: provider.color }}
                                />
                                <span className="text-sm font-medium text-[var(--ui-fg)]">
                                    {provider.name}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </SettingsGroup>

            {/* Provider-specific settings */}
            {selectedProvider === 'openai' && (
                <ProviderPanel
                    provider="openai"
                    apiKey={settings.openAIKey || ''}
                    enabled={settings.useOpenAIKey || false}
                    model={settings.openAIModel || 'gpt-4o'}
                    defaultModels={[
                        'gpt-4o',
                        'gpt-4o-mini',
                        'gpt-4-turbo',
                        'gpt-4-turbo-preview',
                        'gpt-4',
                        'gpt-4-32k',
                        'gpt-3.5-turbo',
                        'gpt-3.5-turbo-16k',
                    ]}
                    onSave={(key, enabled, model) => {
                        dispatch(
                            changeSettings({
                                openAIKey: key,
                                useOpenAIKey: enabled,
                                openAIModel: model,
                                aiProvider: 'openai',
                            })
                        )
                        if (onSave) onSave()
                    }}
                />
            )}

            {selectedProvider === 'openrouter' && (
                <ProviderPanel
                    provider="openrouter"
                    apiKey={settings.openRouterKey || ''}
                    enabled={settings.useOpenRouterKey || false}
                    model={settings.openRouterModel || 'openai/gpt-4o'}
                    defaultModels={[
                        // Premium Models
                        'openai/gpt-4o',
                        'openai/gpt-4o-mini',
                        'openai/gpt-4-turbo',
                        'openai/gpt-4',
                        'openai/gpt-3.5-turbo',
                        'anthropic/claude-3.5-sonnet',
                        'anthropic/claude-3-opus',
                        'anthropic/claude-3-sonnet',
                        'anthropic/claude-3-haiku',
                        'google/gemini-pro-1.5',
                        'google/gemini-pro',
                        'google/gemini-flash-1.5',
                        'meta-llama/llama-3.1-405b-instruct',
                        'meta-llama/llama-3.1-70b-instruct',
                        'meta-llama/llama-3-70b-instruct',
                        'meta-llama/llama-3-8b-instruct',
                        // Free Models
                        'gryphe/mythomist-7b:free',
                        'mistralai/mistral-7b-instruct:free',
                        'google/gemini-flash-1.5:free',
                        'google/gemini-pro:free',
                        'meta-llama/llama-3.2-3b-instruct:free',
                        'meta-llama/llama-3.1-8b-instruct:free',
                        'qwen/qwen-2.5-7b-instruct:free',
                        'qwen/qwen-2-7b-instruct:free',
                        'huggingface/zephyr-7b-beta:free',
                        'openchat/openchat-7b:free',
                        'undi95/toppy-m-7b:free',
                        'gryphe/mythomax-l2-13b:free',
                        'undi95/remm-slerp-l2-13b:free',
                        'openrouter/cinematika-7b:free',
                        'teknium/openhermes-2.5:free',
                        'openai/gpt-oss-20b:free',
                        'openai/gpt-oss-13b:free',
                        'openai/gpt-oss-7b:free',
                        'openrouter/auto',
                    ]}
                    onSave={(key, enabled, model) => {
                        dispatch(
                            changeSettings({
                                openRouterKey: key,
                                useOpenRouterKey: enabled,
                                openRouterModel: model,
                                aiProvider: 'openrouter',
                            })
                        )
                        if (onSave) onSave()
                    }}
                />
            )}

            {selectedProvider === 'gemini' && (
                <ProviderPanel
                    provider="gemini"
                    apiKey={settings.geminiKey || ''}
                    enabled={settings.useGeminiKey || false}
                    model={settings.geminiModel || 'gemini-1.5-pro'}
                    defaultModels={[
                        'gemini-2.0-flash-exp',
                        'gemini-1.5-pro-latest',
                        'gemini-1.5-flash-latest',
                        'gemini-1.5-pro',
                        'gemini-1.5-flash',
                        'gemini-pro',
                        'gemini-pro-vision',
                        'gemini-ultra',
                    ]}
                    onSave={(key, enabled, model) => {
                        dispatch(
                            changeSettings({
                                geminiKey: key,
                                useGeminiKey: enabled,
                                geminiModel: model,
                                aiProvider: 'gemini',
                            })
                        )
                        if (onSave) onSave()
                    }}
                />
            )}

            {selectedProvider === 'claude' && (
                <ProviderPanel
                    provider="claude"
                    apiKey={settings.claudeKey || ''}
                    enabled={settings.useClaudeKey || false}
                    model={settings.claudeModel || 'claude-3.5-sonnet-20241022'}
                    defaultModels={[
                        'claude-3.5-sonnet-20241022',
                        'claude-3.5-haiku-20241022',
                        'claude-3-opus-20240229',
                        'claude-3-sonnet-20240229',
                        'claude-3-haiku-20240307',
                        'claude-2.1',
                        'claude-2.0',
                        'claude-instant-1.2',
                    ]}
                    onSave={(key, enabled, model) => {
                        dispatch(
                            changeSettings({
                                claudeKey: key,
                                useClaudeKey: enabled,
                                claudeModel: model,
                                aiProvider: 'claude',
                            })
                        )
                        if (onSave) onSave()
                    }}
                />
            )}
        </div>
    )
}

// Reusable Provider Panel Component
function ProviderPanel({
    provider,
    apiKey: initialApiKey,
    enabled: initialEnabled,
    model: initialModel,
    defaultModels,
    onSave,
}: {
    provider: 'openai' | 'openrouter' | 'gemini' | 'claude'
    apiKey: string
    enabled: boolean
    model: string
    defaultModels: string[]
    onSave: (key: string, enabled: boolean, model: string) => void
}) {
    const [localAPIKey, setLocalAPIKey] = useState(initialApiKey)
    const [enabled, setEnabled] = useState(initialEnabled)
    const [model, setModel] = useState(initialModel || defaultModels[0])
    const [keyError, setKeyError] = useState(false)

    const providerNames = {
        openai: 'OpenAI',
        openrouter: 'OpenRouter',
        gemini: 'Google Gemini',
        claude: 'Anthropic Claude',
    }

    const placeholderText = {
        openai: 'sk-...',
        openrouter: 'sk-or-...',
        gemini: 'AIza...',
        claude: 'sk-ant-...',
    }


    const handleSave = useCallback(() => {
        // Basic validation
        if (!localAPIKey.trim()) {
            setKeyError(true)
            return
        }
        setKeyError(false)
        onSave(localAPIKey, enabled, model)
    }, [localAPIKey, enabled, model, onSave])

    return (
        <div className="space-y-6 p-5 rounded-xl border border-white/5 bg-white/[0.02]">
            <SettingsGroup
                label={`${providerNames[provider]} API Key`}
                description={`Enter your ${providerNames[provider]} API key to enable AI features.`}
            >
                <div className="flex gap-2">
                    <input
                        className={cx(
                            'flex-1 bg-[var(--ui-bg)] border rounded-lg px-3 py-2.5 text-sm text-[var(--ui-fg)] placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors font-mono',
                            keyError
                                ? 'border-red-500/50 focus:border-red-500'
                                : 'border-[var(--ui-border)] focus:border-blue-500'
                        )}
                        placeholder={placeholderText[provider]}
                        onChange={(e) => {
                            setLocalAPIKey(e.target.value)
                            setKeyError(false)
                        }}
                        value={localAPIKey}
                        type="password"
                        autoComplete="new-password"
                    />
                    <button
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
                        onClick={handleSave}
                    >
                        Save
                    </button>
                </div>
                {keyError && (
                    <div className="text-red-400 text-xs mt-2 font-medium flex items-center gap-1">
                        <FontAwesomeIcon icon={faTimes} /> Invalid API Key
                    </div>
                )}
            </SettingsGroup>

            {localAPIKey && !keyError && (
                <>
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <div className="text-sm font-medium text-[var(--ui-fg)]">
                                Enable {providerNames[provider]}
                            </div>
                            <div className="text-xs text-[var(--ui-fg-muted)] mt-1">
                                Use {providerNames[provider]} for AI features
                            </div>
                        </div>
                        <CustomSwitch
                            checked={enabled}
                            onChange={setEnabled}
                        />
                    </div>

                    {enabled && (
                        <SettingsGroup
                            label="Model"
                            description={`Select the ${providerNames[provider]} model to use.`}
                        >
                            <CustomListbox
                                value={model}
                                onChange={setModel}
                                options={defaultModels}
                            />
                        </SettingsGroup>
                    )}
                </>
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
        <div className="flex items-center justify-between p-4 bg-[var(--ui-fg)]/[0.02] border border-[var(--ui-border)] rounded-lg group hover:bg-[var(--ui-fg)]/[0.04] hover:border-[var(--ui-fg)]/10 transition-all duration-200">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-md bg-[var(--ui-fg)]/5 flex items-center justify-center text-[var(--ui-fg-muted)]">
                    <FontAwesomeIcon icon={faCode} />
                </div>
                <div>
                    <div className="text-sm font-medium text-[var(--ui-fg)]">
                        {languageName}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                        <div className="text-xs text-[var(--ui-fg-muted)]">
                            {languageInstalled
                                ? languageRunning
                                    ? 'Running'
                                    : 'Installed'
                                : 'Not Installed'}
                        </div>
                    </div>
                </div>
            </div>
            <div>
                {!languageInstalled ? (
                    <button
                        className="px-3 py-1.5 text-xs font-medium bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-md transition-colors"
                        onClick={installServer}
                    >
                        Install
                    </button>
                ) : languageRunning ? (
                    <button
                        className="px-3 py-1.5 text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-md transition-colors"
                        onClick={stopServer}
                    >
                        Stop
                    </button>
                ) : (
                    <button
                        className="px-3 py-1.5 text-xs font-medium bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-md transition-colors"
                        onClick={runServer}
                    >
                        Start
                    </button>
                )}
            </div>
        </div>
    )
}
