/**
 * Utility functions for getting API keys
 * Policy: Strictly User Settings. No .env fallback.
 */

import { Settings } from '../window/state'

/**
 * Get API key for a provider.
 * Strictly uses User Settings.
 */
export async function getAPIKeyWithEnvFallback(
    provider: 'openai' | 'openrouter' | 'gemini' | 'claude',
    settings: Settings
): Promise<string | null> {
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

    return null
}

/**
 * Get the active provider's API key
 */
export async function getActiveProviderAPIKey(
    settings: Settings
): Promise<{ provider: string; apiKey: string | null; model: string } | null> {
    const provider = settings.aiProvider || 'openai'

    const apiKey = await getAPIKeyWithEnvFallback(provider as any, settings)

    if (!apiKey) {
        return null
    }

    let model = ''
    switch (provider) {
        case 'openai':
            model = settings.openAIModel || 'gpt-4o'
            break
        case 'openrouter':
            model = settings.openRouterModel || 'openai/gpt-4o'
            break
        case 'gemini':
            model = settings.geminiModel || 'gemini-1.5-pro'
            break
        case 'claude':
            model = settings.claudeModel || 'claude-3.5-sonnet-20241022'
            break
    }

    return {
        provider,
        apiKey,
        model,
    }
}
