import { app } from 'electron'
import log from 'electron-log'
import * as fs from 'fs'
import path from 'path'

import { API_ROOT } from '../../utils'
import { isAppInApplicationsFolder } from '../utils'

const logLocation = path.join(app.getPath('userData'), 'log.log')

if (isAppInApplicationsFolder) {
    log.transports.file.resolvePath = () => logLocation
}
Object.assign(console, log.functions)

let lastTime: null | number = null
async function logError(error: any) {
    log.info('uncaughtException', error)

    // send log file to server
    if (
        isAppInApplicationsFolder &&
        (lastTime == null || Date.now() - lastTime > 1000 * 2)
    ) {
        lastTime = Date.now()
        try {
            const logFile = fs.readFileSync(
                log.transports.file.getFile().path,
                'utf8'
            )
            const body = {
                name: app.getPath('userData').replace(/ /g, '\\ '),
                log: encodeURIComponent(logFile),
                error: error.toString(),
            }

            // Use dynamic import for node-fetch (ESM module)
            const fetch = (await import('node-fetch')).default
            await fetch(API_ROOT + '/save_log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })
        } catch (fetchError) {
            log.error('Failed to send log to server:', fetchError)
        }
    }
}

export default function setupLogger() {
    process.on('uncaughtException', (error) => {
        logError(error)
    })
    process.on('unhandledRejection', (error) => {
        logError(error)
    })
}
