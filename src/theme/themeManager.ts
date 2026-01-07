import { EditorView } from '@codemirror/view'
import { Extension } from '@codemirror/state'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'
import { ThemeData } from '../features/extensions/extensionsSlice'

/**
 * Anysphere Theme Syntax Colors - exact from JSON
 */
const ANYSPHERE_SYNTAX = {
    keyword: '#83d6c5',
    constant: '#83d6c5',
    function: '#ebc88d',
    variable: '#aa9bf5',
    variableSpecial: '#E1DAE8',
    type: '#87c3ff',
    string: '#e394dc',
    stringEscape: '#CC7832',
    stringRegex: '#DA2877',
    number: '#d6d6dd',
    boolean: '#fad075',
    comment: '#474747',
    tag: '#fad075',
    attribute: '#aaa0fa',
    property: '#d6d6dd',
    operator: '#d6d6dd',
    punctuation: '#d6d6dd',
    textLiteral: '#B5BD68',
    text: '#fad075',
} as const

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

    // ALWAYS use Anysphere syntax colors - no theme variations
    const highlightStyle = HighlightStyle.define([
        // Keywords - Anysphere: #83d6c5
        {
            tag: [t.keyword, t.modifier, t.definitionKeyword, t.controlKeyword, t.moduleKeyword],
            color: ANYSPHERE_SYNTAX.keyword,
        },
        // Constants - Anysphere: #83d6c5
        {
            tag: [t.constant(t.variableName)],
            color: ANYSPHERE_SYNTAX.constant,
        },
        // Functions - Anysphere: #ebc88d
        {
            tag: [t.function(t.variableName), t.macroName],
            color: ANYSPHERE_SYNTAX.function,
        },
        // Variables - Anysphere: #aa9bf5
        {
            tag: [t.variableName, t.definition(t.variableName)],
            color: ANYSPHERE_SYNTAX.variable,
        },
        {
            tag: [t.special(t.variableName)],
            color: ANYSPHERE_SYNTAX.variableSpecial,
        },
        // Types - Anysphere: #87c3ff
        {
            tag: [t.typeName, t.className, t.namespace],
            color: ANYSPHERE_SYNTAX.type,
        },
        // Strings - Anysphere: #e394dc
        {
            tag: [t.string, t.special(t.string)],
            color: ANYSPHERE_SYNTAX.string,
        },
        {
            tag: [t.escape],
            color: ANYSPHERE_SYNTAX.stringEscape,
        },
        {
            tag: [t.regexp],
            color: ANYSPHERE_SYNTAX.stringRegex,
        },
        // Numbers - Anysphere: #d6d6dd
        {
            tag: [t.number],
            color: ANYSPHERE_SYNTAX.number,
        },
        // Booleans - Anysphere: #fad075
        {
            tag: [t.bool, t.null, t.atom],
            color: ANYSPHERE_SYNTAX.boolean,
        },
        // Comments - Anysphere: #474747 (italic)
        {
            tag: [t.comment, t.lineComment, t.blockComment, t.docComment],
            color: ANYSPHERE_SYNTAX.comment,
            fontStyle: 'italic',
        },
        // Tags - Anysphere: #fad075
        {
            tag: [t.tagName],
            color: ANYSPHERE_SYNTAX.tag,
        },
        // Attributes - Anysphere: #aaa0fa (italic)
        {
            tag: [t.attributeName],
            color: ANYSPHERE_SYNTAX.attribute,
            fontStyle: 'italic',
        },
        // Properties - Anysphere: #d6d6dd
        {
            tag: [t.propertyName],
            color: ANYSPHERE_SYNTAX.property,
        },
        // Operators & Punctuation - Anysphere: #d6d6dd
        {
            tag: [t.punctuation, t.operator, t.bracket, t.separator],
            color: ANYSPHERE_SYNTAX.punctuation,
        },
        // Text Literals - Anysphere: #B5BD68
        {
            tag: [t.literal],
            color: ANYSPHERE_SYNTAX.textLiteral,
        },
        // Text - Anysphere: #fad075
        {
            tag: [t.content],
            color: ANYSPHERE_SYNTAX.text,
        },
        // Markdown / Headings
        {
            tag: [t.heading],
            color: ANYSPHERE_SYNTAX.type,
            fontWeight: 'bold',
        },
    ])

    return [editorTheme, syntaxHighlighting(highlightStyle)]
}
