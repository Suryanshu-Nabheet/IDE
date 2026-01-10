import {
    EditorView,
    Decoration,
    ViewPlugin,
    ViewUpdate,
    Command,
    keymap,
    WidgetType,
} from '@codemirror/view'
import { StateField, StateEffect, Prec } from '@codemirror/state'
import { getActiveProviderAPIKey } from '../ai/apiKeyUtils'
import { streamAIResponseWithTools } from '../ai/providersWithTools'
import { store } from '../../app/store'

// ===================================
// State Effects and Fields for Ghost Text
// ===================================

const setGhostText = StateEffect.define<{ text: string; pos: number } | null>()

export const ghostTextField = StateField.define<{
    text: string
    pos: number
} | null>({
    create() {
        return null
    },
    update(value, tr) {
        // Clear ghost text on user typing (but handled differently in plugin logic usually)
        if (tr.docChanged) {
            // If the user types, we generally want to clear the ghost text unless we're strictly appending
            // For MVP: any doc change clears ghost text to avoid conflict
            return null
        }

        for (const effect of tr.effects) {
            if (effect.is(setGhostText)) {
                return effect.value
            }
        }
        return value
    },
    provide: (field) =>
        EditorView.decorations.from(field, (value) => {
            if (!value) return Decoration.none
            const deco = Decoration.widget({
                widget: new GhostTextWidget(value.text),
                side: 1,
            })
            return Decoration.set([deco.range(value.pos)])
        }),
})

// ===================================
// Widget for Visualizing Ghost Text
// ===================================

class GhostTextWidget extends WidgetType {
    constructor(readonly text: string) {
        super()
    }

    toDOM() {
        const span = document.createElement('span')
        span.className = 'cm-ghost-text'
        span.textContent = this.text
        span.style.opacity = '0.5'
        span.style.fontStyle = 'italic'
        span.style.pointerEvents = 'none'
        return span
    }

    eq(other: GhostTextWidget) {
        return other.text === this.text
    }

    ignoreEvent() {
        return true
    }
}

// ===================================
// View Plugin to Trigger AI
// ===================================

// Debounce timer
let debounceTimer: any = null
let currentRequestId = 0

export const ghostTextPlugin = ViewPlugin.fromClass(
    class {
        constructor(readonly view: EditorView) {}

        update(update: ViewUpdate) {
            if (update.docChanged) {
                // Clear any existing timer
                if (debounceTimer) clearTimeout(debounceTimer)

                // Ignore huge changes (paste) to save tokens?
                // For now, simple debounce
                debounceTimer = setTimeout(() => {
                    this.triggerGhostText(update.view)
                }, 1000) // Wait 1s after typing stops
            }
        }

        async triggerGhostText(view: EditorView) {
            const state = view.state
            const pos = state.selection.main.head
            const line = state.doc.lineAt(pos)

            // Context: FIM (Fill In Middle) style
            // Simple approach: Prefix + ...
            // We'll give ~20 lines of context before
            const startLine = Math.max(1, line.number - 20)
            const prefix = state.sliceDoc(state.doc.line(startLine).from, pos)
            // const suffix = state.sliceDoc(pos, Math.min(state.doc.length, pos + 1000));

            const globalState: any = store.getState()
            const settings = globalState.settingsState

            const providerInfo = await getActiveProviderAPIKey(settings)

            if (!providerInfo || !settings.aiProvider) return // AI not enabled

            const requestId = ++currentRequestId

            const userPrompt = `Complete the following code. Output ONLY the code to complete the line or block. Do not repeat the prefix.
            
Code:
${prefix}
`
            // Call AI
            try {
                const config = {
                    provider: settings.aiProvider,
                    apiKey: providerInfo.apiKey,
                    defaultModel: providerInfo.model,
                    baseUrl: (settings as any).ollama?.baseUrl,
                }

                const stream = streamAIResponseWithTools(
                    config,
                    [{ role: 'user', content: userPrompt } as any],
                    { tools: [] }
                )

                let completion = ''
                for await (const chunk of stream) {
                    if (currentRequestId !== requestId) return // Cancelled by new typing
                    if (chunk.type === 'text') {
                        completion += chunk.content
                    }
                }

                if (completion.trim() && currentRequestId === requestId) {
                    // Extract code block if necessary or just raw text?
                    // Typically 'complete' completion might include markdown.
                    // Simple heuristic: strip markdown code blocks
                    completion = completion.replace(
                        /```[\s\S]*?```/g,
                        (match) => {
                            // unwrap
                            return match
                                .replace(/```\w*/, '')
                                .replace(/```/, '')
                        }
                    )

                    // Dispatch effect
                    view.dispatch({
                        effects: setGhostText.of({ text: completion, pos }),
                    })
                }
            } catch (e) {
                console.error('GhostText error:', e)
            }
        }
    }
)

// ===================================
// Keymap to Accept
// ===================================

const acceptGhostText: Command = (view: EditorView) => {
    const fieldState = view.state.field(ghostTextField)
    if (fieldState) {
        view.dispatch({
            changes: { from: fieldState.pos, insert: fieldState.text },
            effects: setGhostText.of(null),
            selection: { anchor: fieldState.pos + fieldState.text.length },
        })
        return true
    }
    return false
}

export const ghostTextKeymap = Prec.highest(
    keymap.of([
        {
            key: 'Tab',
            run: acceptGhostText,
        },
    ])
)

export const ghostTextExtension = [
    ghostTextField,
    ghostTextPlugin,
    ghostTextKeymap,
]
