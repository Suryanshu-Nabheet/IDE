/**
 * AI Provider Abstraction Layer
 * Supports OpenAI, OpenRouter, Google Gemini, and Anthropic Claude
 */

export type AIProvider = 'openai' | 'openrouter' | 'gemini' | 'claude'

export interface AIModel {
    id: string
    name: string
    provider: AIProvider
    contextWindow?: number
    supportsStreaming?: boolean
}

export interface AIProviderConfig {
    provider: AIProvider
    apiKey: string
    enabled: boolean
    defaultModel?: string
    models?: AIModel[]
}

export interface AISettings {
    provider: AIProvider
    openai?: {
        apiKey: string
        enabled: boolean
        model: string
    }
    openrouter?: {
        apiKey: string
        enabled: boolean
        model: string
    }
    gemini?: {
        apiKey: string
        enabled: boolean
        model: string
    }
    claude?: {
        apiKey: string
        enabled: boolean
        model: string
    }
}

// Comprehensive model lists for each provider
export const DEFAULT_MODELS: Record<AIProvider, string[]> = {
    openai: [
        'gpt-4o',
        'gpt-4o-mini',
        'gpt-4-turbo',
        'gpt-4-turbo-preview',
        'gpt-4',
        'gpt-4-32k',
        'gpt-3.5-turbo',
        'gpt-3.5-turbo-16k',
    ],
    openrouter: [
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
        'goliath/120b:free',
        'openai/gpt-oss-20b:free',
        'openrouter/auto',
    ],
    gemini: [
        'gemini-2.0-flash-exp',
        'gemini-1.5-pro-latest',
        'gemini-1.5-flash-latest',
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'gemini-pro',
        'gemini-pro-vision',
        'gemini-ultra',
    ],
    claude: [
        'claude-3.5-sonnet-20241022',
        'claude-3.5-haiku-20241022',
        'claude-3-opus-20240229',
        'claude-3-sonnet-20240229',
        'claude-3-haiku-20240307',
        'claude-2.1',
        'claude-2.0',
        'claude-instant-1.2',
    ],
}

/**
 * Get the active AI provider configuration
 * Priority: User Settings > .env file > null
 */
export function getActiveProvider(
    settings: AISettings
): AIProviderConfig | null {
    const provider = settings.provider

    switch (provider) {
        case 'openai':
            // Check user settings first
            if (settings.openai?.enabled && settings.openai?.apiKey) {
                return {
                    provider: 'openai',
                    apiKey: settings.openai.apiKey,
                    enabled: true,
                    defaultModel:
                        settings.openai.model || DEFAULT_MODELS.openai[0],
                }
            }
            break
        case 'openrouter':
            if (settings.openrouter?.enabled && settings.openrouter?.apiKey) {
                return {
                    provider: 'openrouter',
                    apiKey: settings.openrouter.apiKey,
                    enabled: true,
                    defaultModel:
                        settings.openrouter.model ||
                        DEFAULT_MODELS.openrouter[0],
                }
            }
            break
        case 'gemini':
            if (settings.gemini?.enabled && settings.gemini?.apiKey) {
                return {
                    provider: 'gemini',
                    apiKey: settings.gemini.apiKey,
                    enabled: true,
                    defaultModel:
                        settings.gemini.model || DEFAULT_MODELS.gemini[0],
                }
            }
            break
        case 'claude':
            if (settings.claude?.enabled && settings.claude?.apiKey) {
                return {
                    provider: 'claude',
                    apiKey: settings.claude.apiKey,
                    enabled: true,
                    defaultModel:
                        settings.claude.model || DEFAULT_MODELS.claude[0],
                }
            }
            break
    }

    return null
}

/**
 * Get active provider with .env fallback (async version for IPC)
 */
export async function getActiveProviderWithEnv(
    settings: AISettings,
    getEnvKey: (provider: AIProvider) => Promise<string | null>
): Promise<AIProviderConfig | null> {
    const provider = settings.provider

    switch (provider) {
        case 'openai': {
            // User's own key ONLY
            if (settings.openai?.enabled && settings.openai?.apiKey) {
                return {
                    provider: 'openai',
                    apiKey: settings.openai.apiKey,
                    enabled: true,
                    defaultModel:
                        settings.openai.model || DEFAULT_MODELS.openai[0],
                }
            }
            break
        }
        case 'openrouter': {
            if (settings.openrouter?.enabled && settings.openrouter?.apiKey) {
                return {
                    provider: 'openrouter',
                    apiKey: settings.openrouter.apiKey,
                    enabled: true,
                    defaultModel:
                        settings.openrouter.model ||
                        DEFAULT_MODELS.openrouter[0],
                }
            }
            // Company allows OpenRouter via .env
            const openrouterEnvKey = await getEnvKey('openrouter')
            if (openrouterEnvKey) {
                return {
                    provider: 'openrouter',
                    apiKey: openrouterEnvKey,
                    enabled: true,
                    defaultModel:
                        settings.openrouter?.model ||
                        DEFAULT_MODELS.openrouter[0],
                }
            }
            break
        }
        case 'gemini': {
            // User's own key ONLY
            if (settings.gemini?.enabled && settings.gemini?.apiKey) {
                return {
                    provider: 'gemini',
                    apiKey: settings.gemini.apiKey,
                    enabled: true,
                    defaultModel:
                        settings.gemini.model || DEFAULT_MODELS.gemini[0],
                }
            }
            break
        }
        case 'claude': {
            // User's own key ONLY
            if (settings.claude?.enabled && settings.claude?.apiKey) {
                return {
                    provider: 'claude',
                    apiKey: settings.claude.apiKey,
                    enabled: true,
                    defaultModel:
                        settings.claude.model || DEFAULT_MODELS.claude[0],
                }
            }
            break
        }
    }

    return null
}

/**
 * Make an API call to the appropriate provider
 */
export async function* streamAIResponse(
    provider: AIProviderConfig,
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    options?: {
        temperature?: number
        maxTokens?: number
    }
): AsyncGenerator<string, void, unknown> {
    const { provider: providerType, apiKey, defaultModel } = provider

    switch (providerType) {
        case 'openai':
            yield* streamOpenAI(apiKey, defaultModel!, messages, options)
            break
        case 'openrouter':
            yield* streamOpenRouter(apiKey, defaultModel!, messages, options)
            break
        case 'gemini':
            yield* streamGemini(apiKey, defaultModel!, messages, options)
            break
        case 'claude':
            yield* streamClaude(apiKey, defaultModel!, messages, options)
            break
    }
}

async function* streamOpenAI(
    apiKey: string,
    model: string,
    messages: Array<{ role: string; content: string }>,
    options?: { temperature?: number; maxTokens?: number }
): AsyncGenerator<string, void, unknown> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages,
            stream: true,
            temperature: options?.temperature ?? 0.7,
            max_tokens: options?.maxTokens,
        }),
    })

    if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) return

    let buffer = ''
    while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') return

                try {
                    const parsed = JSON.parse(data)
                    const content = parsed.choices?.[0]?.delta?.content
                    if (content) {
                        yield content
                    }
                } catch (e) {
                    // Ignore parse errors
                }
            }
        }
    }
}

async function* streamOpenRouter(
    apiKey: string,
    model: string,
    messages: Array<{ role: string; content: string }>,
    options?: { temperature?: number; maxTokens?: number }
): AsyncGenerator<string, void, unknown> {
    if (process.env.NODE_ENV === 'development') {
        console.log('[OpenRouter] Sending request:', {
            model,
            messageCount: messages.length,
        })
    }

    const response = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'CodeX',
            },
            body: JSON.stringify({
                model,
                messages,
                stream: true,
                temperature: options?.temperature ?? 0.7,
                max_tokens: options?.maxTokens,
            }),
        }
    )

    if (!response.ok) {
        const errorText = await response.text()
        if (process.env.NODE_ENV === 'development') {
            console.error('[OpenRouter] API Error:', response.status, errorText)
        }

        // Parse error for user-friendly message
        let userMessage = 'Unable to connect to AI service. Please try again.'
        try {
            const errorJson = JSON.parse(errorText)
            if (errorJson.error?.message) {
                const msg = errorJson.error.message
                if (msg.includes('data policy') || msg.includes('Free model')) {
                    userMessage =
                        'This model requires a paid plan. Please select a different model or upgrade your OpenRouter account.'
                } else if (
                    msg.includes('Invalid API key') ||
                    msg.includes('Unauthorized')
                ) {
                    userMessage =
                        'Invalid API key. Please check your OpenRouter API key in settings.'
                } else if (msg.includes('rate limit')) {
                    userMessage =
                        'Rate limit exceeded. Please wait a moment and try again.'
                } else {
                    userMessage = msg
                }
            }
        } catch (e) {
            // Use default message
        }

        throw new Error(userMessage)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
        if (process.env.NODE_ENV === 'development') {
            console.error('[OpenRouter] No reader available')
        }
        throw new Error('Unable to receive AI response. Please try again.')
    }

    if (process.env.NODE_ENV === 'development') {
        console.log('[OpenRouter] Starting stream...')
    }
    let buffer = ''
    while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') return

                try {
                    const parsed = JSON.parse(data)
                    const content = parsed.choices?.[0]?.delta?.content
                    if (content) {
                        yield content
                    }
                } catch (e) {
                    // Ignore parse errors
                }
            }
        }
    }

    if (process.env.NODE_ENV === 'development') {
        console.log('[OpenRouter] Stream complete')
    }
}

async function* streamGemini(
    apiKey: string,
    model: string,
    messages: Array<{ role: string; content: string }>,
    options?: { temperature?: number; maxTokens?: number }
): AsyncGenerator<string, void, unknown> {
    // Convert messages to Gemini format
    const contents = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
        }))

    const systemInstruction = messages.find((m) => m.role === 'system')?.content

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents,
                systemInstruction: systemInstruction
                    ? { parts: [{ text: systemInstruction }] }
                    : undefined,
                generationConfig: {
                    temperature: options?.temperature ?? 0.7,
                    maxOutputTokens: options?.maxTokens,
                },
            }),
        }
    )

    if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) return

    let buffer = ''
    while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const chunks = buffer.split('\n\n')
        buffer = chunks.pop() || ''

        for (const chunk of chunks) {
            if (chunk.startsWith('data: ')) {
                try {
                    const data = JSON.parse(chunk.slice(6))
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
                    if (text) {
                        yield text
                    }
                } catch (e) {
                    // Ignore parse errors
                }
            }
        }
    }
}

async function* streamClaude(
    apiKey: string,
    model: string,
    messages: Array<{ role: string; content: string }>,
    options?: { temperature?: number; maxTokens?: number }
): AsyncGenerator<string, void, unknown> {
    // Convert messages to Claude format
    const system = messages.find((m) => m.role === 'system')?.content
    const conversation = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
        }))

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model,
            messages: conversation,
            system: system,
            stream: true,
            temperature: options?.temperature ?? 0.7,
            max_tokens: options?.maxTokens ?? 4096,
        }),
    })

    if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) return

    let buffer = ''
    while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') return

                try {
                    const parsed = JSON.parse(data)
                    if (parsed.type === 'content_block_delta') {
                        const text = parsed.delta?.text
                        if (text) {
                            yield text
                        }
                    }
                } catch (e) {
                    // Ignore parse errors
                }
            }
        }
    }
}
