import { app } from 'electron'

export default function setupAuth() {
    app.on('open-url', (_event, url) => {
        if (url) {
            console.log('Open URL: ' + url)
        }
    })
}
