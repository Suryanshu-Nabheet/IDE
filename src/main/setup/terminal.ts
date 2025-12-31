import os from 'os'
import log from 'electron-log'
import mainWindow from '../window'
import { store } from '../storeHandler'
import { setupTerminal as setup } from '../terminal'

/**
 * Initializes the terminal with the appropriate working directory
 * Uses the stored project path if available, otherwise defaults to home directory
 */
export default function setupTerminal() {
    try {
        const projectPathObj = store.get('projectPath')
        let projectPath: string | undefined

        // Extract project path from store if it exists
        if (
            typeof projectPathObj === 'object' &&
            projectPathObj !== null &&
            'defaultFolder' in projectPathObj
        ) {
            const folder = projectPathObj.defaultFolder
            if (typeof folder === 'string') {
                projectPath = folder
            }
        }

        // Initialize terminal with project path or home directory
        const cwd = projectPath || os.homedir()
        log.info(`Initializing terminal with working directory: ${cwd}`)
        setup(mainWindow.win, cwd)
    } catch (error) {
        log.error('Failed to setup terminal:', error)
        // Fallback to home directory
        setup(mainWindow.win, os.homedir())
    }
}
