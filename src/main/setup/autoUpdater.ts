import { app, autoUpdater, dialog } from 'electron'
import { isAppInApplicationsFolder } from '../utils'

export default function setupAutoUpdater() {
    // Standard Electron AutoUpdater setup
    // Requires a valid feedURL to be set
    // const feedURL = 'https://your-update-server-url.com/update/${process.platform}/${app.getVersion()}';

    app.on('ready', () => {
        if (isAppInApplicationsFolder && app.isPackaged) {
            // autoUpdater.setFeedURL(feedURL)
            // autoUpdater.checkForUpdates()
            // setInterval(() => {
            //    autoUpdater.checkForUpdates()
            // }, 1000 * 60 * 60) // Check every hour
        }
    })

    autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
        const dialogOpts = {
            type: 'info',
            buttons: ['Restart', 'Later'],
            title: 'Application Update',
            message: process.platform === 'win32' ? releaseNotes : releaseName,
            detail: 'A new version has been downloaded. Restart the application to apply the updates.',
        }

        dialog.showMessageBox(dialogOpts).then((returnValue) => {
            if (returnValue.response === 0) autoUpdater.quitAndInstall()
        })
    })

    autoUpdater.on('error', (message) => {
        console.error('There was a problem updating the application')
        console.error(message)
    })
}
