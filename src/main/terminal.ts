import os from 'os'
import * as pty from 'node-pty'
import { ipcMain } from 'electron'
import log from 'electron-log'
import { randomUUID } from 'crypto'

const sessions = new Map<string, pty.IPty>()

/**
 * Sets up the integrated terminal with PTY support
 * @param mainWindow - The main Electron window
 * @param rootPath - Optional root path for terminal working directory
 */
export function setupTerminal(mainWindow: any, rootPath?: string) {
    log.info('Binding Terminal IPC handlers...')

    // Determine available shells based on platform
    const shells =
        os.platform() === 'win32'
            ? ['powershell.exe', 'cmd.exe']
            : ['zsh', 'bash', 'sh']

    // Filter environment variables
    const filteredEnv: { [key: string]: string } = Object.entries(
        process.env
    ).reduce((acc, [key, value]) => {
        if (typeof value === 'string') {
            acc[key] = value
        }
        return acc
    }, {} as { [key: string]: string })

    const createTerminal = (
        id: string,
        cols: number,
        rows: number,
        requestRootPath?: string,
        requestedShell?: string
    ) => {
        const cwd =
            requestRootPath || rootPath || process.env.HOME || os.homedir()
        let shellToUse = requestedShell

        if (!shellToUse) {
            for (const shell of shells) {
                try {
                    // On Unix systems, verify shell exists before spawning
                    if (process.platform !== 'win32') {
                        require('child_process').execSync(
                            `command -v ${shell}`,
                            {
                                stdio: 'ignore',
                            }
                        )
                    }
                    shellToUse = shell
                    break
                } catch (error) {
                    // continue
                }
            }
        }

        if (!shellToUse) {
            log.error('Failed to initialize terminal: no available shell found')
            return null
        }

        try {
            log.info(`Spawning terminal ${id} with shell ${shellToUse}`)
            const ptyProcess = pty.spawn(shellToUse, [], {
                name: 'xterm-256color',
                cols: cols || 80,
                rows: rows || 24,
                cwd,
                env: filteredEnv,
            })

            sessions.set(id, ptyProcess)

            ptyProcess.onData((data: string) => {
                if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.webContents.send('terminal-incData', {
                        id,
                        data,
                    })
                }
            })

            ptyProcess.onExit((event) => {
                log.info(`Terminal ${id} exited with code ${event.exitCode}`)
                if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.webContents.send('terminal-exited', {
                        id,
                        exitCode: event.exitCode,
                    })
                }
                sessions.delete(id)
            })

            return shellToUse
        } catch (err) {
            log.error(`Failed to spawn terminal ${id}`, err)
            return null
        }
    }

    // --- IPC Handlers ---

    ipcMain.removeHandler('terminal-create')
    ipcMain.handle(
        'terminal-create',
        (event, { cols, rows, rootPath: reqRoot, shell }) => {
            const id = randomUUID()
            const usedShell = createTerminal(id, cols, rows, reqRoot, shell)
            if (usedShell) {
                return { id, shell: usedShell }
            } else {
                throw new Error('Could not create terminal')
            }
        }
    )

    ipcMain.removeHandler('terminal-into')
    ipcMain.handle('terminal-into', (_event, { id, data }) => {
        const term = sessions.get(id)
        if (term) {
            term.write(data)
        } else {
            log.warn(`terminal-into: session ${id} not found`)
        }
    })

    ipcMain.removeHandler('terminal-resize')
    ipcMain.handle('terminal-resize', (_event, { id, cols, rows }) => {
        const term = sessions.get(id)
        if (term) {
            try {
                term.resize(cols, rows)
            } catch (error) {
                log.warn('Failed to resize terminal:', error)
            }
        }
    })

    ipcMain.removeHandler('terminal-kill')
    ipcMain.handle('terminal-kill', (_event, id) => {
        const term = sessions.get(id)
        if (term) {
            term.kill()
            sessions.delete(id)
        }
    })

    ipcMain.removeHandler('terminal-click-link')
    ipcMain.handle('terminal-click-link', (_event, url: string) => {
        require('electron').shell.openExternal(url)
    })
}
