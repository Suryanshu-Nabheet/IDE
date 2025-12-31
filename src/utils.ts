// CodeX is a fully independent IDE
export const API_ROOT = 'http://localhost:8000'
export const HOMEPAGE_ROOT = 'http://localhost:8000'

export class ExpectedBackendError extends Error {
    public title: string | null = null
}

export class NoAuthRateLimitError extends ExpectedBackendError {
    constructor(
        message = 'Rate limit reached. Please wait a moment before trying again.'
    ) {
        super(message)
        this.name = 'NoAuthRateLimitError'
        this.title = 'Rate Limit Reached'
    }
}

export class AuthRateLimitError extends ExpectedBackendError {
    constructor(message = 'Too many requests. Please try again in a moment.') {
        super(message)
        this.name = 'AuthRateLimitError'
        this.title = 'Rate Limit'
    }
}

export class NoAuthLocalRateLimitError extends ExpectedBackendError {
    constructor(message = 'Please wait a moment before making more requests.') {
        super(message)
        this.name = 'NoAuthLocalRateLimitError'
        this.title = 'Rate Limit'
    }
}

export class NoAuthGlobalOldRateLimitError extends ExpectedBackendError {
    constructor(message = 'Rate limit exceeded. Please try again later.') {
        super(message)
        this.name = 'NoAuthGlobalOldRateLimitError'
        this.title = 'Rate Limit Exceeded'
    }
}

export class NoAuthGlobalNewRateLimitError extends ExpectedBackendError {
    constructor(
        message = 'High volume of requests detected. Please try again in a few minutes.'
    ) {
        super(message)
        this.name = 'NoAuthGlobalNewRateLimitError'
        this.title = 'Rate Limit Reached'
    }
}

export class OpenAIError extends ExpectedBackendError {}
export class BadOpenAIAPIKeyError extends OpenAIError {
    constructor(
        message = 'The provided OpenAI API key is invalid. Please provide a valid API key.'
    ) {
        super(message)
        this.name = 'BadOpenAIAPIKeyError'
    }
}

export class BadModelError extends ExpectedBackendError {
    constructor(
        message = 'The provided model ID is invalid. Please provide a valid model ID.'
    ) {
        super(message)
        this.name = 'BadModelError'
    }
}

export class NotLoggedInError extends ExpectedBackendError {
    constructor(message = 'This feature requires authentication.') {
        super(message)
        this.name = 'NotLoggedInError'
    }
}
export type ExpectedError =
    | NoAuthRateLimitError
    | AuthRateLimitError
    | NoAuthLocalRateLimitError
    | NoAuthGlobalOldRateLimitError
    | NoAuthGlobalNewRateLimitError
    | BadOpenAIAPIKeyError
    | BadModelError
    | NotLoggedInError

export async function fetchWithCookies(url: string, options: RequestInit = {}) {
    const response = await fetch(url, options)
    // Get the cookies
    const cookies = response.headers.get('Set-Cookie')
    if (cookies) {
        console.log(cookies)
        const [name, value] = cookies.split('=')
        await connector.setCookies({
            url: url,
            name,
            value,
        })
    }
    return response
}

export async function* streamSource(response: Response): AsyncGenerator<any> {
    if (response.status == 429) {
        // Check the error text
        if (response.statusText == 'NO_AUTH') {
            throw new NoAuthRateLimitError()
        } else {
            throw new AuthRateLimitError()
        }
    }

    // Check if the response is an event-stream
    if (
        response.headers.get('content-type') ==
        'text/event-stream; charset=utf-8'
    ) {
        // Create a reader to read the response body as a stream
        // const reader = response.body.getReader();
        // Fix the above error: `response.body is possibly null`
        const reader = response.body!.getReader()
        // Create a decoder to decode the stream as UTF-8 text
        const decoder = new TextDecoder('utf-8')

        // Loop until the stream is done
        while (true) {
            const { value, done } = await reader.read()
            if (done) {
                break
            }

            const rawValue = decoder.decode(value)
            const lines = rawValue.split('\n')

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const jsonString = line.slice(6)
                    if (jsonString == '[DONE]') {
                        return
                    }
                    yield JSON.parse(jsonString)
                }
            }
        }
    } else {
        // Raise exception
        throw new Error('Response is not an event-stream')
    }
}
// Another streaming function similar to streamSource, but slightly different
export async function* anotherStreamSource(
    response: Response
): AsyncGenerator<any> {
    // Check if the response is an event-stream
    if (
        response.headers.get('content-type') ==
        'text/event-stream; charset=utf-8'
    ) {
        // Create a reader to read the response body as a stream
        const reader = response.body!.getReader()
        // Create a decoder to decode the stream as UTF-8 text
        const decoder = new TextDecoder('utf-8')

        // Loop until the stream is done
        while (true) {
            const { value, done } = await reader.read()
            if (done) {
                break
            }

            const rawValue = decoder.decode(value)
            const lines = rawValue.split('\n')

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const jsonString = line.slice(6)
                    if (jsonString == '[DONE]') {
                        return
                    }
                    // Slightly different: wrap the parsed JSON object in an additional object
                    yield { data: JSON.parse(jsonString) }
                }
            }
        }
    } else {
        // Raise exception
        throw new Error('Response is not an event-stream')
    }
}

export function getPlatformInfo(): {
    PLATFORM_DELIMITER: string
    PLATFORM_META_KEY: string
    PLATFORM_CM_KEY: string
    IS_WINDOWS: boolean
} {
    let PLATFORM_DELIMITER: string
    let PLATFORM_META_KEY: string
    let PLATFORM_CM_KEY: string
    let IS_WINDOWS: boolean

    if (process.platform === 'win32') {
        PLATFORM_DELIMITER = '\\'
        PLATFORM_META_KEY = 'Ctrl+'
        PLATFORM_CM_KEY = 'Ctrl'
        IS_WINDOWS = true
    } else if (process.platform === 'darwin') {
        PLATFORM_DELIMITER = '/'
        PLATFORM_META_KEY = '⌘'
        PLATFORM_CM_KEY = 'Cmd'
        IS_WINDOWS = false
    } else {
        PLATFORM_DELIMITER = '/'
        PLATFORM_META_KEY = 'Ctrl+'
        PLATFORM_CM_KEY = 'Ctrl'
        IS_WINDOWS = false
    }

    return {
        PLATFORM_DELIMITER,
        PLATFORM_META_KEY,
        PLATFORM_CM_KEY,
        IS_WINDOWS,
    }
}

export function join(a: string, b: string): string {
    if (a[a.length - 1] === connector.PLATFORM_DELIMITER) {
        return a + b
    }
    return a + connector.PLATFORM_DELIMITER + b
}

// make a join method that can handle ./ and ../
export function joinAdvanced(a: string, b: string): string {
    if (b.startsWith('./')) {
        return joinAdvanced(a, b.slice(2))
    }
    if (b.startsWith('../')) {
        // if a ends with slash
        if (a[a.length - 1] === connector.PLATFORM_DELIMITER) {
            a = a.slice(0, -1)
        }
        const aOneHigher = a.slice(
            0,
            a.lastIndexOf(connector.PLATFORM_DELIMITER)
        )
        return joinAdvanced(aOneHigher, b.slice(3))
    }
    return join(a, b)
}

export function removeBeginningAndEndingLineBreaks(str: string): string {
    str = str.trimEnd()
    while (str[0] === '\n') {
        str = str.slice(1)
    }
    while (str[str.length - 1] === '\n') {
        str = str.slice(0, -1)
    }
    return str
}
