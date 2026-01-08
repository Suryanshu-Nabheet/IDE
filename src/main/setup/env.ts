import { app, systemPreferences } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import log from 'electron-log'

/**
 * Load environment variables from .env file
 */
function loadEnvFile() {
    const envPath = path.join(app.getAppPath(), '.env')

    // Also check in the project root (for development)
    const rootEnvPath = path.join(process.cwd(), '.env')

    let envFilePath = envPath
    if (!fs.existsSync(envPath) && fs.existsSync(rootEnvPath)) {
        envFilePath = rootEnvPath
    }

    if (fs.existsSync(envFilePath)) {
        try {
            const envContent = fs.readFileSync(envFilePath, 'utf-8')
            const lines = envContent.split('\n')

            for (const line of lines) {
                const trimmedLine = line.trim()
                // Skip comments and empty lines
                if (trimmedLine.startsWith('#') || !trimmedLine) continue

                const [key, ...valueParts] = trimmedLine.split('=')
                if (key && valueParts.length > 0) {
                    const keyName = key.trim()

                    // No longer whitelisting AI keys from .env.
                    // .env is now purely for other system configs if needed.
                    const ALLOWED_KEYS: string[] = []

                    if (!ALLOWED_KEYS.includes(keyName)) {
                        continue
                    }

                    const value = valueParts.join('=').trim()
                    // Remove quotes if present
                    const cleanValue = value.replace(/^["']|["']$/g, '')
                    if (cleanValue) {
                        process.env[keyName] = cleanValue
                        log.info(`Loaded env var: ${keyName}`)
                    }
                }
            }
            log.info('Environment variables loaded from .env file')
        } catch (error) {
            log.error('Error loading .env file:', error)
        }
    } else {
        log.info('No .env file found, using environment variables or Settings')
    }
}

export function setupEnv() {
    // Handle creating/removing shortcuts on Windows when installing/uninstalling.
    if (require('electron-squirrel-startup')) {
        app.quit()
    }

    // Load .env file
    loadEnvFile()

    // Remove holded defaults
    if (process.platform === 'darwin')
        systemPreferences.setUserDefault(
            'ApplePressAndHoldEnabled',
            'boolean',
            false
        )
}
