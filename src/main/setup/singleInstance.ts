import { app } from 'electron'
import mainWindow from '../window'

export default function setupSingleInstance() {
    const gotTheLock = app.requestSingleInstanceLock()

    if (!gotTheLock) {
        app.quit()
    } else {
        app.on('second-instance', (_event, _commandLine) => {
            // Someone tried to run a second instance, we should focus our window.
            if (mainWindow.hasCrated()) {
                const { win } = mainWindow
                if (win!.isMinimized()) win!.restore()
                win!.focus()
            }
        })
    }
}
