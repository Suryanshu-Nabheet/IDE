import { ipcMain } from 'electron'
import * as cp from 'child_process'
import { promisify } from 'util'
import log from 'electron-log'

const exec = promisify(cp.exec)

export default function setupGitIpcs() {
    ipcMain.handle('git_clone', async (event, { url, path: localPath }) => {
        try {
            log.info(`Cloning ${url} into ${localPath}`)
            await exec(`git clone "${url}" "${localPath}"`)
            return { success: true }
        } catch (error: any) {
            log.error('Git clone error:', error)
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle('git_status', async (event, { rootPath }) => {
        try {
            // --porcelain gives easy to parse status
            const { stdout } = await exec('git status --porcelain', {
                cwd: rootPath,
            })
            return stdout
                .split('\n')
                .filter(Boolean)
                .map((line) => {
                    const status = line.substring(0, 2)
                    const file = line.substring(3)
                    return { status, file }
                })
        } catch (error) {
            return []
        }
    })

    ipcMain.handle('git_commit', async (event, { rootPath, message }) => {
        try {
            await exec(`git add .`, { cwd: rootPath }) // Simple stage all for now
            await exec(`git commit -m "${message}"`, { cwd: rootPath })
            return { success: true }
        } catch (error: any) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle('git_log', async (event, { rootPath }) => {
        try {
            const { stdout } = await exec('git log --oneline -n 10', {
                cwd: rootPath,
            })
            return stdout
                .split('\n')
                .filter(Boolean)
                .map((line) => {
                    const [hash, ...msg] = line.split(' ')
                    return { hash, message: msg.join(' ') }
                })
        } catch (error) {
            return []
        }
    })
}
