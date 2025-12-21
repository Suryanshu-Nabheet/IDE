/**
 * Centralized error handling system for CodeX
 * Provides consistent error handling and user-friendly error messages
 */

import { logger } from './logger'

export class CodeXError extends Error {
    public readonly code: string
    public readonly userMessage: string
    public readonly originalError?: Error

    constructor(
        message: string,
        code: string = 'UNKNOWN_ERROR',
        userMessage?: string,
        originalError?: Error
    ) {
        super(message)
        this.name = 'CodeXError'
        this.code = code
        this.userMessage = userMessage || message
        this.originalError = originalError
    }
}

export class FileSystemError extends CodeXError {
    constructor(message: string, originalError?: Error) {
        super(
            message,
            'FILE_SYSTEM_ERROR',
            'An error occurred while accessing the file system',
            originalError
        )
        this.name = 'FileSystemError'
    }
}

export class LSPError extends CodeXError {
    constructor(message: string, originalError?: Error) {
        super(
            message,
            'LSP_ERROR',
            'An error occurred with the language server',
            originalError
        )
        this.name = 'LSPError'
    }
}

export class NetworkError extends CodeXError {
    constructor(message: string, originalError?: Error) {
        super(
            message,
            'NETWORK_ERROR',
            'A network error occurred. Please check your connection',
            originalError
        )
        this.name = 'NetworkError'
    }
}

/**
 * Global error handler
 */
export class ErrorHandler {
    private static instance: ErrorHandler

    private constructor() {
        // Private constructor for singleton
    }

    public static getInstance(): ErrorHandler {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler()
        }
        return ErrorHandler.instance
    }

    /**
     * Handle an error and log it appropriately
     */
    public handle(error: Error | CodeXError, context?: string): void {
        const source = context || 'ErrorHandler'

        if (error instanceof CodeXError) {
            logger.error(
                `${error.code}: ${error.message}`,
                {
                    code: error.code,
                    userMessage: error.userMessage,
                    originalError: error.originalError?.message,
                },
                source
            )
        } else {
            logger.error(
                error.message,
                {
                    stack: error.stack,
                },
                source
            )
        }
    }

    /**
     * Handle an error and show a user-friendly notification
     */
    public handleWithNotification(
        error: Error | CodeXError,
        context?: string
    ): void {
        this.handle(error, context)

        // Show user-friendly error message
        const message =
            error instanceof CodeXError
                ? error.userMessage
                : 'An unexpected error occurred'

        // TODO: Integrate with notification system when available
        // For now, just log
        logger.info(`User notification: ${message}`, undefined, 'ErrorHandler')
    }

    /**
     * Wrap a promise with error handling
     */
    public async wrapAsync<T>(
        promise: Promise<T>,
        context?: string,
        showNotification: boolean = false
    ): Promise<T | null> {
        try {
            return await promise
        } catch (error) {
            if (showNotification) {
                this.handleWithNotification(error as Error, context)
            } else {
                this.handle(error as Error, context)
            }
            return null
        }
    }

    /**
     * Wrap a synchronous function with error handling
     */
    public wrap<T>(
        fn: () => T,
        context?: string,
        showNotification: boolean = false
    ): T | null {
        try {
            return fn()
        } catch (error) {
            if (showNotification) {
                this.handleWithNotification(error as Error, context)
            } else {
                this.handle(error as Error, context)
            }
            return null
        }
    }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance()

// Convenience function
export const handleError = (
    error: Error | CodeXError,
    context?: string,
    showNotification: boolean = false
): void => {
    if (showNotification) {
        errorHandler.handleWithNotification(error, context)
    } else {
        errorHandler.handle(error, context)
    }
}
