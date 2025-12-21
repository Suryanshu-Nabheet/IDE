/**
 * Centralized logging system for CodeX
 * Provides structured logging with different levels and optional file output
 */

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
}

interface LogEntry {
    timestamp: Date
    level: LogLevel
    message: string
    data?: any
    source?: string
}

class Logger {
    private static instance: Logger
    private logLevel: LogLevel = LogLevel.INFO
    private isDevelopment: boolean = process.env.NODE_ENV === 'development'

    private constructor() {
        // Private constructor for singleton
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger()
        }
        return Logger.instance
    }

    public setLogLevel(level: LogLevel): void {
        this.logLevel = level
    }

    private shouldLog(level: LogLevel): boolean {
        return level >= this.logLevel
    }

    private formatMessage(entry: LogEntry): string {
        const timestamp = entry.timestamp.toISOString()
        const levelName = LogLevel[entry.level]
        const source = entry.source ? `[${entry.source}]` : ''
        return `${timestamp} ${levelName} ${source} ${entry.message}`
    }

    private log(
        level: LogLevel,
        message: string,
        data?: any,
        source?: string
    ): void {
        if (!this.shouldLog(level)) {
            return
        }

        const entry: LogEntry = {
            timestamp: new Date(),
            level,
            message,
            data,
            source,
        }

        const formattedMessage = this.formatMessage(entry)

        // In development, also log to console with appropriate method
        if (this.isDevelopment) {
            switch (level) {
                case LogLevel.DEBUG:
                    console.debug(formattedMessage, data || '')
                    break
                case LogLevel.INFO:
                    console.info(formattedMessage, data || '')
                    break
                case LogLevel.WARN:
                    console.warn(formattedMessage, data || '')
                    break
                case LogLevel.ERROR:
                    console.error(formattedMessage, data || '')
                    break
            }
        }

        // In production, send to electron-log or file system
        if (!this.isDevelopment && typeof window !== 'undefined') {
            // Use electron-log if available
            const electronLog = (window as any).require?.('electron-log')
            if (electronLog) {
                switch (level) {
                    case LogLevel.DEBUG:
                        electronLog.debug(formattedMessage, data)
                        break
                    case LogLevel.INFO:
                        electronLog.info(formattedMessage, data)
                        break
                    case LogLevel.WARN:
                        electronLog.warn(formattedMessage, data)
                        break
                    case LogLevel.ERROR:
                        electronLog.error(formattedMessage, data)
                        break
                }
            }
        }
    }

    public debug(message: string, data?: any, source?: string): void {
        this.log(LogLevel.DEBUG, message, data, source)
    }

    public info(message: string, data?: any, source?: string): void {
        this.log(LogLevel.INFO, message, data, source)
    }

    public warn(message: string, data?: any, source?: string): void {
        this.log(LogLevel.WARN, message, data, source)
    }

    public error(message: string, data?: any, source?: string): void {
        this.log(LogLevel.ERROR, message, data, source)
    }
}

// Export singleton instance
export const logger = Logger.getInstance()

// Convenience exports
export const log = {
    debug: (msg: string, data?: any, source?: string) =>
        logger.debug(msg, data, source),
    info: (msg: string, data?: any, source?: string) =>
        logger.info(msg, data, source),
    warn: (msg: string, data?: any, source?: string) =>
        logger.warn(msg, data, source),
    error: (msg: string, data?: any, source?: string) =>
        logger.error(msg, data, source),
}
