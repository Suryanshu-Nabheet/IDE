import './index.css'
import './features/listeners'
import './app.tsx'
import posthog from 'posthog-js'

posthog.init('phc_OrLbTmMnw0Ou1C4xuVIWJJaijIcp4J9Cm4JsAVRLtJo', {
    api_host: 'https://app.posthog.com',
    autocapture: false,
    capture_pageview: false,
})

// Safe accessor for connector
const getConnector = () => {
    if (typeof window !== 'undefined' && 'connector' in window) {
        return (window as any).connector
    }
    return {
        returnHomeDir: async () => 'mock-home-dir',
    }
}

const connector = getConnector()

connector.returnHomeDir().then((homeDir: any) => {
    posthog.identify(homeDir)
    posthog.capture('Opened Editor', {})
})
