import { ipcMain } from 'electron'

// CodeX IDE - No Authentication Required
// All auth-related IPC handlers are no-ops for offline operation

export function authPackage() {
    // Register no-op handlers for compatibility
    ipcMain.handle('loginCodeX', async () => {
        console.log('Auth not available in offline mode')
    })
    ipcMain.handle('signupCodeX', async () => {
        console.log('Auth not available in offline mode')
    })
    ipcMain.handle('payCodeX', async () => {
        console.log('Payment not available in offline mode')
    })
    ipcMain.handle('settingsCodeX', async () => {
        console.log('Online settings not available')
    })
    ipcMain.handle('logoutCodeX', async () => {
        console.log('Logout not available in offline mode')
    })
    ipcMain.handle('getUserCreds', async () => {
        return {
            accessToken: null,
            profile: null,
            stripeProfile: null,
        }
    })
    ipcMain.handle('refreshTokens', async () => {
        console.log('Token refresh not available in offline mode')
    })
    ipcMain.handle('loginData', async () => {
        console.log('Login data not available in offline mode')
    })
}
