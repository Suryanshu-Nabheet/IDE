import './index.css'
import './features/listeners'
import './app.tsx'
import posthog from 'posthog-js'

posthog.init('phc_OrLbTmMnw0Ou1C4xuVIWJJaijIcp4J9Cm4JsAVRLtJo', {
    api_host: 'https://app.posthog.com',
    autocapture: false,
    capture_pageview: false,
})

connector.returnHomeDir().then((homeDir) => {
    posthog.identify(homeDir)
    posthog.capture('Opened Editor', {})
})
