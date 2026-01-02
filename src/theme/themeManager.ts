import { EditorView } from '@codemirror/view'
import { Extension } from '@codemirror/state'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'
import { ThemeData } from '../features/extensions/extensionsSlice'

export function createThemeFromData(themeData: ThemeData): Extension {
    const { colors } = themeData

    const editorTheme = EditorView.theme(
        {
            // Root editor
            '&': {
                color: colors.foreground,
                backgroundColor: colors.background,
                fontSize: '13px',
                fontFamily:
                    "'JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
                height: '100%',
            },

            // Content area
            '.cm-content': {
                caretColor: colors.cursor,
                padding: '4px 0',
                fontFamily:
                    "'JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
                lineHeight: '1.5',
                fontVariantLigatures: 'normal',
            },

            // Cursor
            '.cm-cursor, .cm-dropCursor': {
                borderLeftColor: colors.cursor,
                borderLeftWidth: '2px',
                borderLeftStyle: 'solid',
            },

            // Selection
            '.cm-selectionBackground, ::selection': {
                backgroundColor: colors.selection + ' !important',
            },
            '&.cm-focused .cm-selectionBackground': {
                backgroundColor: colors.selection + ' !important',
            },

            // Active line
            '.cm-activeLine': {
                backgroundColor: colors.lineHighlight,
            },

            // Selection match
            '.cm-selectionMatch': {
                backgroundColor: colors.selection,
                border: `1px solid ${colors.selection}`,
            },

            // Matching brackets
            '&.cm-focused .cm-matchingBracket': {
                backgroundColor: 'transparent',
                outline: '1px solid #888888',
            },

            '&.cm-focused .cm-nonmatchingBracket': {
                backgroundColor: 'rgba(255, 0, 0, 0.3)',
            },

            // Gutters
            '.cm-gutters': {
                backgroundColor: colors.background,
                color: colors.comment,
                border: 'none',
                paddingRight: '16px',
                fontFamily:
                    "'JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
            },

            // Active line gutter
            '.cm-activeLineGutter': {
                backgroundColor: 'transparent',
                color: colors.foreground,
                fontWeight: '500',
            },

            // Line numbers
            '.cm-lineNumbers .cm-gutterElement': {
                padding: '0 12px 0 16px',
                minWidth: '48px',
                fontSize: '12px',
                textAlign: 'right',
            },

            // Focus outline
            '&.cm-focused': {
                outline: 'none',
            },

            // Panels
            '.cm-panels': {
                backgroundColor: colors.background,
                color: colors.foreground,
            },

            // Tooltips
            '.cm-tooltip': {
                backgroundColor: colors.background,
                border: `1px solid ${colors.comment}`,
                color: colors.foreground,
                borderRadius: '4px',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.4)',
            },

            // Autocomplete
            '.cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]': {
                backgroundColor: colors.selection,
                color: colors.foreground,
            },

            '.cm-panel': {
                backgroundColor: colors.background,
            },

            '.cm-scroller': {
                fontFamily:
                    "'JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
            },
        },
        { dark: themeData.type === 'dark' }
    )

    const highlightStyle = HighlightStyle.define([
        // Keywords
        {
            tag: [
                t.keyword,
                t.modifier,
                t.definitionKeyword,
                t.standard(t.tagName),
            ],
            color: colors.keyword,
        },

        // Control Flow
        {
            tag: [t.controlKeyword, t.moduleKeyword],
            color: colors.keyword,
        },

        // Functions
        {
            tag: [t.function(t.variableName), t.macroName],
            color: colors.function,
        },

        // Variables & Parameters
        {
            tag: [t.variableName, t.propertyName],
            color: colors.variable,
        },
        {
            tag: [t.definition(t.variableName)],
            color: colors.variable,
        },

        // Types & Classes
        {
            tag: [t.typeName, t.className, t.namespace],
            color: colors.type,
        },

        // Strings
        {
            tag: [t.string, t.special(t.string), t.regexp],
            color: colors.string,
        },

        // Numbers & Booleans
        {
            tag: [t.number, t.bool, t.null, t.atom],
            color: colors.number,
        },

        // Comments
        {
            tag: [t.comment, t.lineComment, t.blockComment],
            color: colors.comment,
        },

        // HTML/JSX Tags
        {
            tag: [t.tagName],
            color: colors.tag,
        },

        // Attributes
        {
            tag: [t.attributeName],
            color: colors.attribute,
        },

        // Default Text / Punctuation
        {
            tag: [t.punctuation, t.operator, t.bracket, t.separator],
            color: colors.foreground,
        },

        // Escape
        {
            tag: [t.escape],
            color: colors.string,
        },

        // Markdown / Headings
        {
            tag: [t.heading],
            color: colors.keyword,
            fontWeight: 'bold',
        },
    ])

    return [editorTheme, syntaxHighlighting(highlightStyle)]
}
