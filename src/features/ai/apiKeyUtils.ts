/**
 * Utility functions for getting API keys with .env fallback
 * Priority: User Settings > .env file > null
 */

import { Settings } from '../window/state'

/**
 * Get API key for a provider with .env fallback
 * This is called from renderer process, so it uses IPC
 */
export async function getAPIKeyWithEnvFallback(
    provider: 'openai' | 'openrouter' | 'gemini' | 'claude',
    settings: Settings
): Promise<string | null> {
    // Check user settings first
    switch (provider) {
        case 'openai':
            if (settings.useOpenAIKey && settings.openAIKey) {
                return settings.openAIKey
            }
            break
        case 'openrouter':
            if (settings.useOpenRouterKey && settings.openRouterKey) {
                return settings.openRouterKey
            }
            break
        case 'gemini':
            if (settings.useGeminiKey && settings.geminiKey) {
                return settings.geminiKey
            }
            break
        case 'claude':
            if (settings.useClaudeKey && settings.claudeKey) {
                return settings.claudeKey
            }
            break
    }

    // Fallback to .env via IPC
    if (typeof window !== 'undefined' && (window as any).connector) {
        try {
            const envKey = await (window as any).connector.getEnvAPIKey(provider)
            return envKey
        } catch (error) {
            // Error getting .env key
            return null
        }
    }

    return null
}

/**
 * Get the active provider's API key
 */
export async function getActiveProviderAPIKey(
    settings: Settings
): Promise<{ provider: string; apiKey: string | null; model: string } | null> {
    const provider = settings.aiProvider || 'openai'

    const apiKey = await getAPIKeyWithEnvFallback(provider, settings)

    if (!apiKey) {
        return null
    }

    let model = ''
    switch (provider) {
        case 'openai':
            model = settings.openAIModel || 'gpt-4-turbo-preview'
            break
        case 'openrouter':
            model = settings.openRouterModel || 'openai/gpt-4-turbo'
            break
        case 'gemini':
            model = settings.geminiModel || 'gemini-pro'
            break
        case 'claude':
            model = settings.claudeModel || 'claude-3-opus-20240229'
            break
    }

    return {
        provider,
        apiKey,
        model,
    }
}

