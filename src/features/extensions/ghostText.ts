import {
    EditorView,
    ViewPlugin,
    ViewUpdate,
    Decoration,
    WidgetType,
    keymap,
} from '@codemirror/view'
import { StateField, StateEffect, Prec } from '@codemirror/state'
import { debounce } from 'lodash'

// --- State & Effects ---
export const setGhostTextEffect = StateEffect.define<{
    text: string
    pos: number
} | null>()

export const acceptGhostTextEffect = StateEffect.define<void>()

class GhostTextWidget extends WidgetType {
    constructor(readonly text: string) {
        super()
    }

    eq(other: GhostTextWidget) {
        return other.text === this.text
    }

    toDOM() {
        const span = document.createElement('span')
        span.className = 'cm-ghost-text'
        span.textContent = this.text
        span.style.opacity = '0.5'
        span.style.fontStyle = 'italic'
        span.style.color = 'var(--ui-fg-muted)' // Better visibility support
        return span
    }
}

const ghostTextField = StateField.define<{ text: string; pos: number } | null>({
    create() {
        return null
    },
    update(value, tr) {
        for (const effect of tr.effects) {
            if (effect.is(setGhostTextEffect)) {
                return effect.value
            }
            if (effect.is(acceptGhostTextEffect)) {
                return null
            }
        }
        if (tr.docChanged) {
            return null
        }
        return value
    },
    provide: (f) =>
        EditorView.decorations.from(f, (value) => {
            if (!value) return Decoration.none
            return Decoration.set([
                Decoration.widget({
                    widget: new GhostTextWidget(value.text),
                    side: 1,
                }).range(value.pos),
            ])
        }),
})

// --- View Plugin for Triggering ---
const ghostTextPlugin = ViewPlugin.fromClass(
    class {
        updateDebounced: (view: EditorView) => void

        constructor(view: EditorView) {
            this.updateDebounced = debounce((v: EditorView) => {
                this.triggerGhostText(v)
            }, 1000)
        }

        update(update: ViewUpdate) {
            if (update.docChanged) {
                // If doc changed, trigger fetching
                const isUserEvent = update.transactions.some((tr) =>
                    tr.isUserEvent('input')
                )
                if (isUserEvent) {
                    this.updateDebounced(update.view)
                }
            }
        }

        async triggerGhostText(view: EditorView) {
            const state = view.state
            const pos = state.selection.main.head

            // Advanced context extraction: 50 lines before and after
            const startLine = state.doc.lineAt(pos).number
            const from = state.doc.line(Math.max(1, startLine - 50)).from
            const precedingCode = state.doc.sliceString(from, pos)

            const endLine = state.doc.lines
            const to = state.doc.line(Math.min(endLine, startLine + 50)).to
            const followingCode = state.doc.sliceString(pos, to)

            // Ready for AI Service Hook
            // const context = {
            //     prefix: precedingCode,
            //     suffix: followingCode,
            //     language: 'typescript', // Detect dynamically
            //     cursorPos: pos
            // }
            // store.dispatch(fetchGhostText(context))
        }
    }
)

// --- Keymap ---
const ghostTextKeymap = keymap.of([
    {
        key: 'Tab',
        run: (view) => {
            const ghostText = view.state.field(ghostTextField, false)
            if (ghostText) {
                view.dispatch({
                    changes: {
                        from: ghostText.pos,
                        insert: ghostText.text,
                    },
                    effects: acceptGhostTextEffect.of(),
                    selection: {
                        anchor: ghostText.pos + ghostText.text.length,
                    },
                })
                return true
            }
            return false
        },
    },
])

// Export the extension array
export const ghostTextExtension = [
    ghostTextField,
    ghostTextPlugin,
    Prec.highest(ghostTextKeymap),
]
