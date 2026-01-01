import { IpcMainInvokeEvent, ipcMain } from 'electron'

import Store from 'electron-store'
export const store = new Store()

// check if store has uploadPreferences, if not, then ask the user for them
if (store.get('uploadPreferences') == undefined) {
    store.set('uploadPreferences', false)
}

export function setupStoreHandlers() {
    ipcMain.handle(
        'setStore',
        async function (
            event: IpcMainInvokeEvent,
            { key, blob }: { key: string; blob: any }
        ) {
            store.set(key, blob)
        }
    )
    ipcMain.handle(
        'getStore',
        async function (event: IpcMainInvokeEvent, key: string) {
            const comments = store.get(key)
            return comments
        }
    )

    // Handler for getting all values from an array
    ipcMain.handle(
        'getAllArrayValues',
        async function (event: IpcMainInvokeEvent, arrayKey: string) {
            const val = store.get(arrayKey)
            if (Array.isArray(val)) return val

            // Migration: handle old object-indexed format
            if (val && typeof val === 'object' && 'length' in val) {
                const len = (val as any).length
                const arr = []
                for (let i = 0; i < len; i++) {
                    const item = (val as any)[i]
                    if (item) arr.push(item)
                }
                // Save converted array back to store
                store.set(arrayKey, arr)
                return arr
            }

            return []
        }
    )

    // Handler for appending to an array
    ipcMain.handle(
        'appendToArray',
        async function (
            event: IpcMainInvokeEvent,
            { arrayKey, value }: { arrayKey: string; value: any }
        ) {
            let array: any[] = []
            const existing = store.get(arrayKey)

            if (Array.isArray(existing)) {
                array = [...existing]
            } else if (
                existing &&
                typeof existing === 'object' &&
                'length' in existing
            ) {
                // Migrate if we hit an old format during append
                const len = (existing as any).length
                for (let i = 0; i < len; i++) {
                    const item = (existing as any)[i]
                    if (item) array.push(item)
                }
            }

            // Simple de-duplication: remove if already exists so new one goes to end
            array = array.filter((v) => v !== value)
            array.push(value)

            // Keep it manageable
            if (array.length > 50) array = array.slice(-50)

            store.set(arrayKey, array)
            return array
        }
    )
}
