import React, { useState, useRef, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faMagic,
    faSpinner,
    faPlay,
    faPaperPlane,
} from '@fortawesome/free-solid-svg-icons'
import { getActiveProviderAPIKey } from '../features/ai/apiKeyUtils'
import { streamAIResponseWithTools } from '../features/ai/providersWithTools'
import { useAppSelector } from '../app/hooks'
import { getSettings } from '../features/settings/settingsSelectors'

interface TerminalAISuggestionProps {
    onRunCommand: (command: string) => void
    onClose: () => void
}

export const TerminalAISuggestion: React.FC<TerminalAISuggestionProps> = ({
    onRunCommand,
    onClose,
}) => {
    const settings = useAppSelector(getSettings)
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [suggestion, setSuggestion] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose()
        } else if (e.key === 'Enter') {
            if (suggestion) {
                // If we have a suggestion, Enter runs it
                onRunCommand(suggestion)
                onClose()
            } else {
                // Otherwise generates suggestion
                generateSuggestion()
            }
        }
    }

    const generateSuggestion = async () => {
        if (!input.trim() || isLoading) return
        setIsLoading(true)
        setSuggestion('')

        try {
            const providerInfo = await getActiveProviderAPIKey(settings)
            if (!providerInfo) {
                alert('AI not configured')
                setIsLoading(false)
                return
            }

            const prompt = `You are a terminal command expert.
User Request: ${input}
OS: Mac (zsh)

Output ONLY the exact command to run. No markdown. No explanation.`

            const config = {
                provider: settings.aiProvider || 'ollama',
                apiKey: providerInfo.apiKey,
                defaultModel: providerInfo.model,
                baseUrl: (settings as any).ollama?.baseUrl,
            }

            const stream = streamAIResponseWithTools(
                config,
                [{ role: 'user', content: prompt } as any],
                { tools: [] }
            )

            let text = ''
            for await (const chunk of stream) {
                if (chunk.type === 'text') {
                    text += chunk.content
                    setSuggestion(text)
                }
            }
        } catch (e) {
            console.error(e)
            setSuggestion('Error generating command')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="absolute top-10 right-4 z-50 w-80 bg-[var(--ui-bg-elevated)] border border-[var(--ui-border)] rounded-lg shadow-xl p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2 border-b border-[var(--ui-border)] pb-2 mb-1">
                <FontAwesomeIcon
                    icon={faMagic}
                    className="text-[var(--accent)] text-xs"
                />
                <span className="text-xs font-semibold text-[var(--ui-fg)]">
                    Terminal AI
                </span>
            </div>

            <div className="flex items-center gap-2 bg-[var(--input-bg)] rounded px-2 py-1.5 border border-[var(--ui-border)]">
                <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe command..."
                    className="flex-1 bg-transparent border-none outline-none text-xs text-[var(--ui-fg)] placeholder-[var(--ui-fg-muted)]"
                    disabled={isLoading}
                />
                <button
                    onClick={generateSuggestion}
                    disabled={isLoading || !input.trim()}
                    className="text-[var(--ui-fg-muted)] hover:text-[var(--accent)] transition-colors"
                >
                    <FontAwesomeIcon
                        icon={isLoading ? faSpinner : faPaperPlane}
                        className={isLoading ? 'animate-spin' : ''}
                    />
                </button>
            </div>

            {suggestion && (
                <div className="bg-[var(--input-bg)] rounded p-2 border border-[var(--accent)] mt-1">
                    <code className="text-xs text-[var(--accent)] block break-all font-mono mb-2">
                        {suggestion}
                    </code>
                    <button
                        onClick={() => {
                            onRunCommand(suggestion)
                            onClose()
                        }}
                        className="w-full py-1 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                        <FontAwesomeIcon icon={faPlay} />
                        Run Command
                    </button>
                </div>
            )}

            <div className="flex justify-between items-center text-[9px] text-[var(--ui-fg-muted)] px-1">
                <span>Enter to generate/run</span>
                <span
                    className="cursor-pointer hover:text-[var(--ui-fg)]"
                    onClick={onClose}
                >
                    esc to close
                </span>
            </div>
        </div>
    )
}
