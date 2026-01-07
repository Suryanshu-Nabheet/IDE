declare const connector: import('./preload').default

declare global {
    interface Window {
        connector: import('./preload').default
    }
    const connector: import('./preload').default
}
