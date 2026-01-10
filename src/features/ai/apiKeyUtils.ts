/**
 * Utility functions for getting API keys
 * Policy: Strictly User Settings. No .env fallback.
 */

import { Settings } from '../window/state'

import { OPENAI_MODELS } from './providers/openai'
import { OPENROUTER_MODELS } from './providers/openrouter'
import { GEMINI_MODELS } from './providers/gemini'
import { CLAUDE_MODELS } from './providers/claude'
import { OLLAMA_MODELS } from './providers/ollama'

/**
 * Get API key for a provider.
 * Strictly uses User Settings.
 */
export async function getAPIKeyWithEnvFallback(
    provider: 'openai' | 'openrouter' | 'gemini' | 'claude' | 'ollama',
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
        case 'ollama':
            return 'ollama' // Dummy key
    }

    return null
}

/**
 * Get the active provider's API key
 */
export async function getActiveProviderAPIKey(
    settings: Settings
): Promise<{ provider: string; apiKey: string | null; model: string } | null> {
    const provider = settings.aiProvider || 'ollama' // Default to Ollama

    const apiKey = await getAPIKeyWithEnvFallback(provider as any, settings)

    if (!apiKey) {
        return null
    }

    let model = ''
    switch (provider) {
        case 'openai':
            model = settings.openAIModel || OPENAI_MODELS[0]
            break
        case 'openrouter':
            model = settings.openRouterModel || OPENROUTER_MODELS[0]
            break
        case 'gemini':
            model = settings.geminiModel || GEMINI_MODELS[0]
            break
        case 'claude':
            model = settings.claudeModel || CLAUDE_MODELS[0]
            break
        case 'ollama':
            model = settings.ollamaModel || OLLAMA_MODELS[0]
            break
    }

    return {
        provider,
        apiKey,
        model,
    }
}
