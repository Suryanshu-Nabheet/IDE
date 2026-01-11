import { useAppDispatch, useAppSelector } from '../app/hooks'
import cx from 'classnames'
import * as ssel from '../features/settings/settingsSelectors'
import { DEFAULT_MODELS, AIProvider } from '../features/ai/providers'
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
import React, { useCallback, useState, useMemo, useEffect } from 'react'
import {
    getLanguages,
    languageServerStatus,
} from '../features/lsp/languageServerSelector'
import { closeError } from '../features/globalSlice'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faTimes,
    faGear,
    faCode,
    faUserCircle,
    faMinus,
    faPlus,
    faCheck,
    faChevronDown,
    faEye,
    faEyeSlash,
} from '@fortawesome/pro-regular-svg-icons'

// Provider Logos - Official Brand Icons
const OpenAILogo = () => (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-full h-full">
        <path d="M14.949 6.547a3.94 3.94 0 0 0-.348-3.273 4.11 4.11 0 0 0-4.4-1.934A4.1 4.1 0 0 0 8.423.2 4.15 4.15 0 0 0 6.305.086a4.1 4.1 0 0 0-1.891.948 4.04 4.04 0 0 0-1.158 1.753 4.1 4.1 0 0 0-1.563.679A4 4 0 0 0 .554 4.72a3.99 3.99 0 0 0 .502 4.731 3.94 3.94 0 0 0 .346 3.274 4.11 4.11 0 0 0 4.402 1.933c.382.425.852.764 1.377.995.526.231 1.095.35 1.67.346 1.78.002 3.358-1.132 3.901-2.804a4.1 4.1 0 0 0 1.563-.68 4 4 0 0 0 1.14-1.253 3.99 3.99 0 0 0-.506-4.716m-6.097 8.406a3.05 3.05 0 0 1-1.945-.694l.096-.054 3.23-1.838a.53.53 0 0 0 .265-.455v-4.49l1.366.778q.02.011.025.035v3.722c-.003 1.653-1.361 2.992-3.037 2.996m-6.53-2.75a2.95 2.95 0 0 1-.36-2.01l.095.057L5.29 12.09a.53.53 0 0 0 .527 0l3.949-2.246v1.555a.05.05 0 0 1-.022.041L6.473 13.3c-1.454.826-3.311.335-4.15-1.098m-.85-6.94A3.02 3.02 0 0 1 3.07 3.949v3.785a.51.51 0 0 0 .262.451l3.93 2.237-1.366.779a.05.05 0 0 1-.048 0L2.585 9.342a2.98 2.98 0 0 1-1.113-4.094zm11.216 2.571L8.747 5.576l1.362-.776a.05.05 0 0 1 .048 0l3.265 1.86a3 3 0 0 1 1.173 1.207 2.96 2.96 0 0 1-.27 3.2 3.05 3.05 0 0 1-1.36.997V8.279a.52.52 0 0 0-.276-.445m1.36-2.015-.097-.057-3.226-1.855a.53.53 0 0 0-.53 0L6.249 6.153V4.598a.04.04 0 0 1 .019-.04L9.533 2.7a3.07 3.07 0 0 1 3.257.139c.474.325.843.778 1.066 1.303.223.526.289 1.103.191 1.664zM5.503 8.575 4.139 7.8a.05.05 0 0 1-.026-.037V4.049c0-.57.166-1.127.476-1.607s.752-.864 1.275-1.105a3.08 3.08 0 0 1 3.234.41l-.096.054-3.23 1.838a.53.53 0 0 0-.265.455zm.742-1.577 1.758-1 1.762 1v2l-1.755 1-1.762-1z" />
    </svg>
)

const GeminiLogo = () => (
    <svg viewBox="0 0 65 65" fill="none" className="w-full h-full">
        <path
            d="M32.447 0c.68 0 1.273.465 1.439 1.125a38.904 38.904 0 001.999 5.905c2.152 5 5.105 9.376 8.854 13.125 3.751 3.75 8.126 6.703 13.125 8.855a38.98 38.98 0 005.906 1.999c.66.166 1.124.758 1.124 1.438 0 .68-.464 1.273-1.125 1.439a38.902 38.902 0 00-5.905 1.999c-5 2.152-9.375 5.105-13.125 8.854-3.749 3.751-6.702 8.126-8.854 13.125a38.973 38.973 0 00-2 5.906 1.485 1.485 0 01-1.438 1.124c-.68 0-1.272-.464-1.438-1.125a38.913 38.913 0 00-2-5.905c-2.151-5-5.103-9.375-8.854-13.125-3.75-3.749-8.125-6.702-13.125-8.854a38.973 38.973 0 00-5.905-2A1.485 1.485 0 010 32.448c0-.68.465-1.272 1.125-1.438a38.903 38.903 0 005.905-2c5-2.151 9.376-5.104 13.125-8.854 3.75-3.749 6.703-8.125 8.855-13.125a38.972 38.972 0 001.999-5.905A1.485 1.485 0 0132.447 0z"
            fill="url(#gemini-gradient)"
        />
        <defs>
            <linearGradient
                id="gemini-gradient"
                x1="18.447"
                y1="43.42"
                x2="52.153"
                y2="15.004"
                gradientUnits="userSpaceOnUse"
            >
                <stop stopColor="#4893FC" />
                <stop offset=".27" stopColor="#4893FC" />
                <stop offset=".777" stopColor="#969DFF" />
                <stop offset="1" stopColor="#BD99FE" />
            </linearGradient>
        </defs>
    </svg>
)

const ClaudeLogo = () => (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-full h-full">
        <path d="m3.127 10.604 3.135-1.76.053-.153-.053-.085H6.11l-.525-.032-1.791-.048-1.554-.065-1.505-.08-.38-.081L0 7.832l.036-.234.32-.214.455.04 1.009.069 1.513.105 1.097.064 1.626.17h.259l.036-.105-.089-.065-.068-.064-1.566-1.062-1.695-1.121-.887-.646-.48-.327-.243-.306-.104-.67.435-.48.585.04.15.04.593.456 1.267.981 1.654 1.218.242.202.097-.068.012-.049-.109-.181-.9-1.626-.96-1.655-.428-.686-.113-.411a2 2 0 0 1-.068-.484l.496-.674L4.446 0l.662.089.279.242.411.94.666 1.48 1.033 2.014.302.597.162.553.06.17h.105v-.097l.085-1.134.157-1.392.154-1.792.052-.504.25-.605.497-.327.387.186.319.456-.045.294-.19 1.23-.37 1.93-.243 1.29h.142l.161-.16.654-.868 1.097-1.372.484-.545.565-.601.363-.287h.686l.505.751-.226.775-.707.895-.585.759-.839 1.13-.524.904.048.072.125-.012 1.897-.403 1.024-.186 1.223-.21.553.258.06.263-.218.536-1.307.323-1.533.307-2.284.54-.028.02.032.04 1.029.098.44.024h1.077l2.005.15.525.346.315.424-.053.323-.807.411-3.631-.863-.872-.218h-.12v.073l.726.71 1.331 1.202 1.667 1.55.084.383-.214.302-.226-.032-1.464-1.101-.565-.497-1.28-1.077h-.084v.113l.295.432 1.557 2.34.08.718-.112.234-.404.141-.444-.08-.911-1.28-.94-1.44-.759-1.291-.093.053-.448 4.821-.21.246-.484.186-.403-.307-.214-.496.214-.98.258-1.28.21-1.016.19-1.263.112-.42-.008-.028-.092.012-.953 1.307-1.448 1.957-1.146 1.227-.274.109-.477-.247.045-.44.266-.39 1.586-2.018.956-1.25.617-.723-.004-.105h-.036l-4.212 2.736-.75.096-.324-.302.04-.496.154-.162 1.267-.871z" />
    </svg>
)

const OpenRouterLogo = () => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        fillRule="evenodd"
        className="w-full h-full"
    >
        <path d="M16.804 1.957l7.22 4.105v.087L16.73 10.21l.017-2.117-.821-.03c-1.059-.028-1.611.002-2.268.11-1.064.175-2.038.577-3.147 1.352L8.345 11.03c-.284.195-.495.336-.68.455l-.515.322-.397.234.385.23.53.338c.476.314 1.17.796 2.701 1.866 1.11.775 2.083 1.177 3.147 1.352l.3.045c.694.091 1.375.094 2.825.033l.022-2.159 7.22 4.105v.087L16.589 22l.014-1.862-.635.022c-1.386.042-2.137.002-3.138-.162-1.694-.28-3.26-.926-4.881-2.059l-2.158-1.5a21.997 21.997 0 00-.755-.498l-.467-.28a55.927 55.927 0 00-.76-.43C2.908 14.73.563 14.116 0 14.116V9.888l.14.004c.564-.007 2.91-.622 3.809-1.124l1.016-.58.438-.274c.428-.28 1.072-.726 2.686-1.853 1.621-1.133 3.186-1.78 4.881-2.059 1.152-.19 1.974-.213 3.814-.138l.02-1.907z" />
    </svg>
)

const OllamaLogo = () => (
    <svg width="45" height="45" viewBox="0 0 60 60" xmlns="www.w3.org">
        <circle cx="30" cy="30" r="30" fill="#ccc" />
        <path d="M25.2 14.9c2.7-1.5 6.4-2 9.7 0 .7-8.8 9.7-11 8.4 4.6 5 3.8 4.1 10.8 2.2 13 2.2 4.1 1.6 8-.2 11.3a13 13 0 0 1 .9 7.1c-.3 1.6-2.7 1.2-2.6-.4.3-2 0-4.1-1-6.2-.2-.4-.2-1. [ Content omitted for brevity. Full code available in the cited document. ] z" />
    </svg>
)

export function SettingsPopup() {
    const dispatch = useAppDispatch()
    const settings = useAppSelector(ssel.getSettings)
    const isSettingsOpen = useAppSelector(ssel.getSettingsIsOpen)
    const activeTab = useAppSelector(ssel.getActiveSettingsTab)
    const languageServerNames = useAppSelector(getLanguages)

    if (!isSettingsOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="w-[1000px] h-[660px] bg-[var(--ui-bg)] border border-[var(--ui-border)] rounded-lg shadow-2xl flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-56 bg-[var(--sidebar-bg)] border-r border-[var(--ui-border)] flex flex-col">
                    <div className="h-16 flex items-center px-6 border-b border-[var(--ui-border)]">
                        <span className="text-sm font-semibold text-[var(--ui-fg)]">
                            Settings
                        </span>
                    </div>
                    <nav className="flex-1 px-3 py-4 space-y-1">
                        <NavItem
                            icon={faGear}
                            label="General"
                            isActive={activeTab === 'General'}
                            onClick={() => dispatch(setSettingsTab('General'))}
                        />
                        <NavItem
                            icon={faCode}
                            label="AI Engine"
                            isActive={activeTab === 'AI'}
                            onClick={() => dispatch(setSettingsTab('AI'))}
                        />
                        <NavItem
                            icon={faCode}
                            label="Language Servers"
                            isActive={activeTab === 'Languages'}
                            onClick={() =>
                                dispatch(setSettingsTab('Languages'))
                            }
                        />
                        <NavItem
                            icon={faUserCircle}
                            label="Account"
                            isActive={activeTab === 'Account'}
                            onClick={() => dispatch(setSettingsTab('Account'))}
                        />
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col bg-[var(--ui-bg)]">
                    {/* Header */}
                    <div className="h-16 border-b border-[var(--ui-border)] flex items-center justify-between px-8 shrink-0">
                        <div>
                            <h1 className="text-base font-semibold text-[var(--ui-fg)]">
                                {activeTab === 'AI'
                                    ? 'AI Configuration'
                                    : activeTab}
                            </h1>
                            <p className="text-xs text-[var(--ui-fg-muted)] mt-0.5">
                                {activeTab === 'AI' &&
                                    'Configure your AI provider and model'}
                                {activeTab === 'General' &&
                                    'Customize editor appearance and behavior'}
                                {activeTab === 'Languages' &&
                                    'Manage language server installations'}
                                {activeTab === 'Account' &&
                                    'Manage your CodeX account'}
                            </p>
                        </div>
                        <button
                            onClick={() => dispatch(toggleSettings())}
                            className="w-8 h-8 flex items-center justify-center rounded text-[var(--ui-fg-muted)] hover:text-[var(--ui-fg)] hover:bg-[var(--ui-hover)] transition-colors"
                        >
                            <FontAwesomeIcon
                                icon={faTimes}
                                className="text-sm"
                            />
                        </button>
                    </div>

                    {/* Scrollable Area */}
                    <div className="flex-1 overflow-y-auto px-8 py-8">
                        {activeTab === 'General' && (
                            <GeneralSettings
                                settings={settings}
                                dispatch={dispatch}
                            />
                        )}
                        {activeTab === 'AI' && (
                            <AISettings onSave={() => dispatch(closeError())} />
                        )}
                        {activeTab === 'Languages' && (
                            <LanguageServersView
                                languageServerNames={languageServerNames}
                            />
                        )}
                        {activeTab === 'Account' && <AccountView />}
                    </div>
                </div>
            </div>
        </div>
    )
}

// --- General Settings ---
function GeneralSettings({ settings, dispatch }: any) {
    const curatedThemes = [
        { value: 'codex-dark', label: 'CodeX Dark', color: '#000000' },
        { value: 'github-dark', label: 'GitHub Dark', color: '#0d1117' },
        { value: 'dracula', label: 'Dracula', color: '#282a36' },
        { value: 'one-dark', label: 'One Dark', color: '#282c34' },
        { value: 'solarized-dark', label: 'Solarized Dark', color: '#002b36' },
    ]

    return (
        <div className="space-y-10 max-w-3xl">
            {/* Theme */}
            <Section
                title="Color Theme"
                description="Choose your editor color scheme"
            >
                <div className="grid grid-cols-5 gap-3">
                    {curatedThemes.map((theme) => (
                        <ThemeCard
                            key={theme.value}
                            label={theme.label}
                            color={theme.color}
                            isActive={
                                (settings.theme || 'codex-dark') === theme.value
                            }
                            onClick={() =>
                                dispatch(changeSettings({ theme: theme.value }))
                            }
                        />
                    ))}
                </div>
            </Section>

            {/* Editor */}
            <Section title="Editor" description="Customize font and behavior">
                <div className="space-y-5">
                    <Row label="Font Family">
                        <Select
                            value={settings.fontFamily || 'JetBrains Mono'}
                            onChange={(val: string) =>
                                dispatch(changeSettings({ fontFamily: val }))
                            }
                            options={[
                                'JetBrains Mono',
                                'Fira Code',
                                'Source Code Pro',
                                'Menlo',
                                'Monaco',
                            ]}
                        />
                    </Row>

                    <Row label="Font Size">
                        <div className="flex items-center gap-3">
                            <button
                                className="w-9 h-9 flex items-center justify-center rounded bg-[var(--input-bg)] border border-[var(--input-border)] hover:bg-[var(--ui-hover)] text-[var(--ui-fg-muted)] transition-colors"
                                onClick={() => {
                                    const current = parseInt(
                                        settings.fontSize || '13'
                                    )
                                    if (current > 8)
                                        dispatch(
                                            changeSettings({
                                                fontSize: (
                                                    current - 1
                                                ).toString(),
                                            })
                                        )
                                }}
                            >
                                <FontAwesomeIcon
                                    icon={faMinus}
                                    className="text-xs"
                                />
                            </button>
                            <span className="w-20 text-center font-mono text-sm text-[var(--ui-fg)]">
                                {settings.fontSize || '13'}px
                            </span>
                            <button
                                className="w-9 h-9 flex items-center justify-center rounded bg-[var(--input-bg)] border border-[var(--input-border)] hover:bg-[var(--ui-hover)] text-[var(--ui-fg-muted)] transition-colors"
                                onClick={() => {
                                    const current = parseInt(
                                        settings.fontSize || '13'
                                    )
                                    if (current < 48)
                                        dispatch(
                                            changeSettings({
                                                fontSize: (
                                                    current + 1
                                                ).toString(),
                                            })
                                        )
                                }}
                            >
                                <FontAwesomeIcon
                                    icon={faPlus}
                                    className="text-xs"
                                />
                            </button>
                        </div>
                    </Row>

                    <Row label="Key Bindings">
                        <Select
                            value={settings.keyBindings || 'none'}
                            onChange={(val: string) =>
                                dispatch(changeSettings({ keyBindings: val }))
                            }
                            options={[
                                { id: 'none', name: 'Default' },
                                { id: 'vim', name: 'Vim' },
                                { id: 'emacs', name: 'Emacs' },
                            ]}
                        />
                    </Row>

                    <Row label="Text Wrapping">
                        <Toggle
                            checked={settings.textWrapping === 'enabled'}
                            onChange={(checked: boolean) =>
                                dispatch(
                                    changeSettings({
                                        textWrapping: checked
                                            ? 'enabled'
                                            : 'disabled',
                                    })
                                )
                            }
                        />
                    </Row>

                    <Row label="Tab Size">
                        <Select
                            value={settings.tabSize || '4'}
                            onChange={(val: string) =>
                                dispatch(changeSettings({ tabSize: val }))
                            }
                            options={['2', '4', '8']}
                        />
                    </Row>
                </div>
            </Section>
        </div>
    )
}

// --- AI Settings ---
function AISettings({ onSave }: { onSave?: () => void }) {
    const settings = useAppSelector(ssel.getSettings)
    const dispatch = useAppDispatch()

    const [selectedProvider, setSelectedProvider] = useState<any>(
        settings.aiProvider || 'ollama'
    )

    const isConfigured = (id: string) => {
        if (id === 'openai')
            return !!(settings.useOpenAIKey && settings.openAIKey)
        if (id === 'openrouter')
            return !!(settings.useOpenRouterKey && settings.openRouterKey)
        if (id === 'gemini')
            return !!(settings.useGeminiKey && settings.geminiKey)
        if (id === 'claude')
            return !!(settings.useClaudeKey && settings.claudeKey)
        if (id === 'ollama') return true // Always configured (local)
        return false
    }

    const providers = [
        { id: 'ollama', name: 'Ollama', logo: OllamaLogo },
        { id: 'openai', name: 'OpenAI', logo: OpenAILogo },
        { id: 'openrouter', name: 'OpenRouter', logo: OpenRouterLogo },
        { id: 'gemini', name: 'Google Gemini', logo: GeminiLogo },
        { id: 'claude', name: 'Anthropic Claude', logo: ClaudeLogo },
    ]

    return (
        <div className="space-y-8 max-w-3xl">
            {/* Provider Selection - Single Row with Logos */}
            <Section
                title="AI Provider"
                description="Select your preferred AI service"
            >
                <div className="flex gap-3">
                    {providers.map((p) => {
                        const isActive = selectedProvider === p.id
                        const configured = isConfigured(p.id)
                        const LogoComponent = p.logo
                        return (
                            <button
                                key={p.id}
                                onClick={() => setSelectedProvider(p.id as any)}
                                className={cx(
                                    'flex-1 relative flex flex-col items-center gap-3 p-5 rounded-lg border transition-all',
                                    isActive
                                        ? 'bg-[var(--ui-bg-elevated)] border-[var(--accent)]'
                                        : 'bg-black/20 border-transparent opacity-40 hover:opacity-60'
                                )}
                            >
                                {/* Logo */}
                                <div
                                    className={cx(
                                        'w-12 h-12 rounded-lg flex items-center justify-center p-2.5 transition-colors',
                                        isActive
                                            ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                                            : 'bg-transparent text-[var(--ui-fg-muted)]'
                                    )}
                                >
                                    <LogoComponent />
                                </div>

                                {/* Name */}
                                <span
                                    className={cx(
                                        'text-sm font-medium text-center',
                                        isActive
                                            ? 'text-[var(--ui-fg)]'
                                            : 'text-[var(--ui-fg-muted)]'
                                    )}
                                >
                                    {p.name}
                                </span>

                                {/* Status Indicator - only show on active */}
                                {configured && isActive && (
                                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-green-500" />
                                )}
                            </button>
                        )
                    })}
                </div>
            </Section>

            {/* Configuration */}
            <Section
                title="Configuration"
                description={
                    selectedProvider === 'ollama'
                        ? 'Setup your local Ollama instance'
                        : 'Enter your API credentials'
                }
            >
                {selectedProvider === 'ollama' ? (
                    <OllamaConfigPanel
                        settings={settings}
                        dispatch={dispatch}
                        onSave={onSave}
                    />
                ) : (
                    <ConfigPanel
                        provider={selectedProvider}
                        settingKeyCore={
                            selectedProvider === 'openrouter'
                                ? 'openRouter'
                                : selectedProvider
                        }
                        providerName={
                            providers.find((p) => p.id === selectedProvider)
                                ?.name
                        }
                        settings={settings}
                        defaultModels={
                            DEFAULT_MODELS[selectedProvider as AIProvider] || []
                        }
                        dispatch={dispatch}
                        onSave={onSave}
                    />
                )}
            </Section>
        </div>
    )
}

function OllamaConfigPanel({ settings, dispatch, onSave }: any) {
    const [baseUrl, setBaseUrl] = useState(
        settings.ollamaBaseUrl || 'http://localhost:11434'
    )
    const [selectedModel, setSelectedModel] = useState(
        settings.ollamaModel || ''
    )
    const [availableModels, setAvailableModels] = useState<string[]>([])
    const [isFetching, setIsFetching] = useState(false)
    const [fetchError, setFetchError] = useState('')

    const handleFetchModels = useCallback(async () => {
        setIsFetching(true)
        setFetchError('')
        try {
            const cleanUrl = baseUrl.replace(/\/$/, '')
            const res = await fetch(`${cleanUrl}/api/tags`)
            if (!res.ok) throw new Error('Failed to fetch models')
            const data = await res.json()
            const models = data.models.map((m: any) => m.name) || []
            setAvailableModels(models)

            // Auto-select first model if current selection is invalid or empty
            if (models.length > 0) {
                if (!selectedModel || !models.includes(selectedModel)) {
                    setSelectedModel(models[0])
                    // Also dispatch immediately so it's saved
                    dispatch(
                        changeSettings({
                            aiProvider: 'ollama',
                            ollamaBaseUrl: baseUrl, // ensure base url is saved
                            ollamaModel: models[0],
                        })
                    )
                }
            }
        } catch (e) {
            setFetchError('Could not connect to Ollama. Is it running?')
            setAvailableModels([])
        } finally {
            setIsFetching(false)
        }
    }, [baseUrl, selectedModel, dispatch])

    // Auto-fetch on mount
    useEffect(() => {
        handleFetchModels()
    }, []) // Empty dependency array to run only once on mount

    const handleSave = () => {
        dispatch(
            changeSettings({
                aiProvider: 'ollama',
                ollamaBaseUrl: baseUrl,
                ollamaModel: selectedModel,
            })
        )
        if (onSave) onSave()
    }

    return (
        <div className="grid grid-cols-1 gap-6">
            <div>
                <label className="block text-xs font-medium text-[var(--ui-fg)] mb-2">
                    Ollama Base URL
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={baseUrl}
                        onChange={(e) => setBaseUrl(e.target.value)}
                        onBlur={handleFetchModels} // Refetch when URL changes/blurs
                        className="flex-1 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--input-fg)] font-mono placeholder-[var(--input-placeholder)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                        placeholder="http://localhost:11434"
                    />
                    {/* Status Indicator instead of button */}
                    <div className="flex items-center justify-center px-4 border border-[var(--ui-border)] rounded-lg bg-[var(--ui-bg-elevated)] min-w-[100px]">
                        {isFetching ? (
                            <span className="text-xs text-[var(--ui-fg-muted)] animate-pulse">
                                Connecting...
                            </span>
                        ) : availableModels.length > 0 ? (
                            <span className="text-xs text-green-500 font-medium">
                                Connected
                            </span>
                        ) : (
                            <span className="text-xs text-[var(--ui-fg-muted)]">
                                Offline
                            </span>
                        )}
                    </div>
                </div>
                {fetchError && (
                    <p className="text-xs text-red-500 mt-2">{fetchError}</p>
                )}
            </div>

            <div>
                <label className="block text-xs font-medium text-[var(--ui-fg)] mb-2">
                    Selected Model
                </label>
                <div className="relative">
                    {availableModels.length > 0 ? (
                        <Select
                            value={selectedModel}
                            onChange={(val: string) => {
                                setSelectedModel(val)
                                dispatch(changeSettings({ ollamaModel: val }))
                            }}
                            options={availableModels}
                            fullWidth
                        />
                    ) : (
                        <div className="flex flex-col gap-2">
                            <div className="text-xs text-[var(--ui-fg-muted)] italic p-2 border border-[var(--ui-border)] rounded bg-[var(--ui-bg-subtle)] flex items-center justify-between">
                                <span>
                                    {fetchError
                                        ? 'No models found (connection failed)'
                                        : 'Scanning for models...'}
                                </span>
                                {fetchError && (
                                    <button
                                        onClick={handleFetchModels}
                                        className="text-[var(--accent)] hover:underline ml-2 font-medium"
                                    >
                                        Retry
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                {availableModels.length > 0 && (
                    <p className="text-[10px] text-[var(--ui-fg-muted)] mt-1.5 opacity-70">
                        Showing {availableModels.length} models installed
                        locally.
                    </p>
                )}
            </div>

            <div className="pt-2">
                <button
                    onClick={handleSave}
                    className="w-full py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium rounded-lg transition-all"
                >
                    Save & Activate Ollama
                </button>
            </div>
        </div>
    )
}

function ConfigPanel({
    provider,
    settingKeyCore,
    providerName,
    settings,
    defaultModels,
    dispatch,
    onSave,
}: any) {
    const apiKeyKey = `${settingKeyCore}Key`
    const useKeyKey = `use${
        settingKeyCore.charAt(0).toUpperCase() + settingKeyCore.slice(1)
    }Key`
    const modelKey = `${settingKeyCore}Model`

    const [localAPIKey, setLocalAPIKey] = useState(settings[apiKeyKey] || '')
    const [model, setModel] = useState(settings[modelKey] || defaultModels[0])
    const [showKey, setShowKey] = useState(false)

    const handleSave = useCallback(() => {
        if (!localAPIKey.trim()) return

        const updates: any = {
            aiProvider: provider,
            [modelKey]: model,
            [apiKeyKey]: localAPIKey,
            [useKeyKey]: true,
        }

        dispatch(changeSettings(updates))
        if (onSave) onSave()
    }, [localAPIKey, model, provider])

    return (
        <div className="grid grid-cols-2 gap-6">
            <div>
                <label className="block text-xs font-medium text-[var(--ui-fg)] mb-2">
                    API Key
                </label>
                <div className="relative">
                    <input
                        type={showKey ? 'text' : 'password'}
                        value={localAPIKey}
                        onChange={(e) => setLocalAPIKey(e.target.value)}
                        className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--input-fg)] font-mono placeholder-[var(--input-placeholder)] focus:outline-none focus:border-[var(--accent)] transition-colors pr-10"
                        placeholder={`Enter ${providerName} API key`}
                    />
                    <button
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ui-fg-muted)] hover:text-[var(--accent)] transition-colors"
                    >
                        <FontAwesomeIcon
                            icon={showKey ? faEyeSlash : faEye}
                            className="text-sm"
                        />
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-xs font-medium text-[var(--ui-fg)] mb-2">
                    Model
                </label>
                <Select
                    value={model}
                    onChange={setModel}
                    options={defaultModels}
                    fullWidth
                />
            </div>

            <div className="col-span-2">
                <button
                    onClick={handleSave}
                    disabled={!localAPIKey.trim()}
                    className="w-full py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all"
                >
                    Save Configuration
                </button>
            </div>
        </div>
    )
}

// --- Language Servers ---
function LanguageServersView({ languageServerNames }: any) {
    const dispatch = useAppDispatch()
    return (
        <div className="space-y-8 max-w-3xl">
            <Section
                title="Available Servers"
                description="Install and manage language servers"
            >
                <div className="space-y-2">
                    {languageServerNames.map((name: string) => (
                        <ServerRow
                            key={name}
                            languageName={name}
                            dispatch={dispatch}
                        />
                    ))}
                </div>
            </Section>
        </div>
    )
}

function ServerRow({ languageName, dispatch }: any) {
    const languageState = useAppSelector(languageServerStatus(languageName))
    const languageInstalled = useMemo(
        () => languageState && languageState.installed,
        [languageState]
    )
    const languageRunning = useMemo(
        () => languageState && languageState.running,
        [languageState]
    )

    return (
        <div className="flex items-center justify-between px-5 py-4 rounded-lg border border-[var(--ui-border)] bg-[var(--ui-bg-elevated)] hover:bg-[var(--ui-hover)] transition-colors">
            <div className="flex items-center gap-3">
                <div
                    className={cx(
                        'w-2 h-2 rounded-full',
                        languageRunning
                            ? 'bg-green-500'
                            : languageInstalled
                            ? 'bg-amber-500'
                            : 'bg-[var(--ui-border)]'
                    )}
                />
                <span className="text-sm font-medium text-[var(--ui-fg)]">
                    {languageName}
                </span>
            </div>

            {!languageInstalled ? (
                <button
                    onClick={() =>
                        dispatch(installLanguageServer(languageName))
                    }
                    className="px-5 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-medium rounded-lg transition-all"
                >
                    Install
                </button>
            ) : (
                <button
                    onClick={() =>
                        languageRunning
                            ? dispatch(stopLanguageServer(languageName))
                            : dispatch(runLanguageServer(languageName))
                    }
                    className={cx(
                        'px-5 py-2 text-xs font-medium rounded-lg transition-all',
                        languageRunning
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                            : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                    )}
                >
                    {languageRunning ? 'Stop' : 'Start'}
                </button>
            )}
        </div>
    )
}

// --- Account ---
function AccountView() {
    return (
        <div className="flex flex-col items-center justify-center py-24 max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-[var(--ui-bg-elevated)] border border-[var(--ui-border)] flex items-center justify-center mb-6 text-[var(--ui-fg-muted)] text-3xl">
                <FontAwesomeIcon icon={faUserCircle} />
            </div>
            <h2 className="text-base font-semibold text-[var(--ui-fg)] mb-2">
                Sign in to CodeX
            </h2>
            <p className="text-[var(--ui-fg-muted)] text-center text-sm leading-relaxed mb-8">
                Sync your settings and preferences across devices
            </p>
            <div className="flex gap-3">
                <button className="px-6 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm rounded-lg font-medium transition-all">
                    Sign In
                </button>
                <button className="px-6 py-2.5 bg-[var(--ui-bg-elevated)] hover:bg-[var(--ui-hover)] text-[var(--ui-fg)] text-sm rounded-lg font-medium transition-all border border-[var(--ui-border)]">
                    Create Account
                </button>
            </div>
        </div>
    )
}

// --- Components ---

function NavItem({ icon, label, isActive, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={cx(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                    ? 'text-[var(--ui-fg)] bg-[var(--sidebar-selected)]'
                    : 'text-[var(--sidebar-fg)] hover:text-[var(--ui-fg)] hover:bg-[var(--sidebar-hover)]'
            )}
        >
            <FontAwesomeIcon
                icon={icon}
                className={cx(
                    'text-sm',
                    isActive
                        ? 'text-[var(--accent)]'
                        : 'text-[var(--ui-fg-muted)]'
                )}
            />
            {label}
        </button>
    )
}

function Section({ title, description, children }: any) {
    return (
        <div>
            <div className="mb-5">
                <h3 className="text-sm font-semibold text-[var(--ui-fg)] mb-1">
                    {title}
                </h3>
                {description && (
                    <p className="text-xs text-[var(--ui-fg-muted)]">
                        {description}
                    </p>
                )}
            </div>
            {children}
        </div>
    )
}

function Row({ label, children }: any) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-[var(--ui-border)] last:border-0">
            <span className="text-sm text-[var(--ui-fg)]">{label}</span>
            {children}
        </div>
    )
}

function ThemeCard({ label, color, isActive, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={cx(
                'flex flex-col gap-2.5 p-3 rounded-lg border transition-all',
                isActive
                    ? 'bg-[var(--sidebar-selected)] border-[var(--accent)]'
                    : 'bg-[var(--ui-bg-elevated)] border-[var(--ui-border)] hover:bg-[var(--ui-hover)]'
            )}
        >
            <div
                className="w-full h-12 rounded-lg border border-[var(--ui-border-subtle)]"
                style={{ backgroundColor: color }}
            />
            <div className="flex items-center justify-between">
                <span
                    className={cx(
                        'text-xs font-medium',
                        isActive
                            ? 'text-[var(--accent)]'
                            : 'text-[var(--ui-fg-muted)]'
                    )}
                >
                    {label}
                </span>
                {isActive && (
                    <FontAwesomeIcon
                        icon={faCheck}
                        className="text-[var(--accent)] text-xs"
                    />
                )}
            </div>
        </button>
    )
}

function Select({ value, onChange, options, fullWidth = false }: any) {
    const selected =
        typeof value === 'object'
            ? value
            : options.find((o: any) => o === value || o.id === value) || value
    const displayValue = typeof selected === 'object' ? selected.name : selected

    return (
        <Listbox value={value} onChange={onChange}>
            <div className={cx('relative', fullWidth ? 'w-full' : 'w-52')}>
                <Listbox.Button className="relative w-full cursor-default rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] py-2.5 pl-4 pr-10 text-left text-sm text-[var(--input-fg)] focus:outline-none focus:border-[var(--accent)] hover:bg-[var(--ui-hover)] transition-colors">
                    <span className="block truncate">{displayValue}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--ui-fg-muted)]">
                        <FontAwesomeIcon
                            icon={faChevronDown}
                            className="text-xs"
                        />
                    </span>
                </Listbox.Button>
                <Listbox.Options className="absolute z-50 mt-2 max-h-48 w-full overflow-auto rounded-lg bg-[var(--ui-bg-elevated)] border border-[var(--ui-border)] py-1 text-sm shadow-2xl focus:outline-none">
                    {options.map((option: any, idx: number) => {
                        const optValue =
                            typeof option === 'object' ? option.id : option
                        const optLabel =
                            typeof option === 'object' ? option.name : option
                        return (
                            <Listbox.Option
                                key={idx}
                                className={({ active }) =>
                                    `relative cursor-pointer select-none py-2.5 pl-4 pr-4 transition-colors ${
                                        active
                                            ? 'bg-[var(--sidebar-selected)] text-[var(--ui-fg)]'
                                            : 'text-[var(--ui-fg-muted)]'
                                    }`
                                }
                                value={optValue}
                            >
                                {({ selected }) => (
                                    <span
                                        className={`block truncate ${
                                            selected
                                                ? 'font-medium text-[var(--accent)]'
                                                : 'font-normal'
                                        }`}
                                    >
                                        {optLabel}
                                    </span>
                                )}
                            </Listbox.Option>
                        )
                    })}
                </Listbox.Options>
            </div>
        </Listbox>
    )
}

function Toggle({ checked, onChange }: any) {
    return (
        <Switch
            checked={checked}
            onChange={onChange}
            className={`${
                checked ? 'bg-[var(--accent)]' : 'bg-[var(--ui-bg-subtle)]'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
        >
            <span
                className={`${
                    checked ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm`}
            />
        </Switch>
    )
}
