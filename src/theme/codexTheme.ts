import { EditorView } from '@codemirror/view'
import { Extension } from '@codemirror/state'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'
import { CODEX_THEME } from './tokens'

const { typography } = CODEX_THEME

// ═══════════════════════════════════════════════════════════════════════════
// ANYSPHERE DARK THEME - TEXT & SYNTAX COLORS ONLY
// ═══════════════════════════════════════════════════════════════════════════

const ANYSPHERE_TEXT_COLORS = {
    // Base text colors
    default: '#E6EAF2',
    secondary: '#9AA4BF',
    muted: '#5F6B85',
    disabled: '#3F475A',

    // Syntax colors
    keyword: '#C792EA',
    string: '#ECC48D',
    number: '#F78C6C',
    boolean: '#F78C6C',
    function: '#82AAFF',
    property: '#C3E88D',
    type: '#FFCB6B',
    tag: '#F07178',
    comment: '#5F6B85',
    docComment: '#6B77A5',
    punctuation: '#89A4C7',

    // Special states
    error: '#FF5370',
    warning: '#FFCB6B',
    info: '#82AAFF',

    // Emphasis
    selected: '#FFFFFF',
    highlighted: '#FFFFFF',
    matchingBracket: '#82AAFF',
}

const codexEditorTheme = EditorView.theme(
    {
        // Root editor
        '&': {
            color: ANYSPHERE_TEXT_COLORS.default,
            backgroundColor: '#000000',
            fontSize: typography.fontSize.base,
            fontFamily: typography.fontFamilyMono,
            height: '100%',
        },

        // Content area
        '.cm-content': {
            caretColor: ANYSPHERE_TEXT_COLORS.default,
            padding: '8px 0',
            fontFamily: typography.fontFamilyMono,
            lineHeight: '1.5',
            fontVariantLigatures: typography.ligatures ? 'normal' : 'none',
        },

        // Cursor
        '.cm-cursor, .cm-dropCursor': {
            borderLeftColor: ANYSPHERE_TEXT_COLORS.default,
            borderLeftWidth: '2px',
            borderLeftStyle: 'solid',
        },

        // Selection
        '.cm-selectionBackground, ::selection': {
            backgroundColor: '#264f78 !important',
        },
        '&.cm-focused .cm-selectionBackground': {
            backgroundColor: '#264f78 !important',
        },

        // Active line
        '.cm-activeLine': {
            backgroundColor: '#0a0a0a',
        },

        // Selection match
        '.cm-selectionMatch': {
            backgroundColor: '#1a1a1a',
        },

        // Matching brackets
        '&.cm-focused .cm-matchingBracket': {
            backgroundColor: 'transparent',
            color: ANYSPHERE_TEXT_COLORS.matchingBracket,
            outline: '1px solid ' + ANYSPHERE_TEXT_COLORS.matchingBracket,
        },

        '&.cm-focused .cm-nonmatchingBracket': {
            backgroundColor: 'rgba(255, 83, 112, 0.1)',
            color: ANYSPHERE_TEXT_COLORS.error,
        },

        // Gutters
        '.cm-gutters': {
            backgroundColor: '#000000',
            color: ANYSPHERE_TEXT_COLORS.muted,
            border: 'none',
            paddingRight: '12px',
            fontFamily: typography.fontFamilyMono,
        },

        // Active line gutter
        '.cm-activeLineGutter': {
            backgroundColor: 'transparent',
            color: ANYSPHERE_TEXT_COLORS.secondary,
        },

        // Line numbers
        '.cm-lineNumbers .cm-gutterElement': {
            padding: '0 8px 0 16px',
            minWidth: '40px',
            fontSize: typography.fontSize.sm,
            textAlign: 'right',
        },

        // Focus outline
        '&.cm-focused': {
            outline: 'none',
        },

        // Panels
        '.cm-panels': {
            backgroundColor: '#0a0a0a',
            color: ANYSPHERE_TEXT_COLORS.default,
        },

        '.cm-tooltip': {
            backgroundColor: '#1a1a1a',
            border: '1px solid #2a2a2a',
            color: ANYSPHERE_TEXT_COLORS.default,
        },

        '.cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]': {
            backgroundColor: '#264f78',
            color: ANYSPHERE_TEXT_COLORS.selected,
        },

        '.cm-panel': {
            backgroundColor: '#0a0a0a',
        },

        '.cm-scroller': {
            fontFamily: typography.fontFamilyMono,
        },
    },
    { dark: true }
)

// ═══════════════════════════════════════════════════════════════════════════
// SYNTAX HIGHLIGHTING - ANYSPHERE DARK TEXT COLORS
// ═══════════════════════════════════════════════════════════════════════════

const codexHighlightStyle = HighlightStyle.define([
    // KEYWORDS & CONTROL FLOW
    {
        tag: [
            t.keyword,
            t.modifier,
            t.controlKeyword,
            t.moduleKeyword,
            t.operatorKeyword,
            t.definitionKeyword,
        ],
        color: ANYSPHERE_TEXT_COLORS.keyword,
    },

    // STRINGS & TEMPLATE LITERALS
    {
        tag: [t.string, t.special(t.string), t.docString, t.regexp],
        color: ANYSPHERE_TEXT_COLORS.string,
    },

    // NUMBERS & BOOLEANS
    {
        tag: [t.number, t.integer, t.float],
        color: ANYSPHERE_TEXT_COLORS.number,
    },
    {
        tag: [
            t.bool,
            t.null,
            t.atom,
            t.constant(t.name),
            t.constant(t.variableName),
        ],
        color: ANYSPHERE_TEXT_COLORS.boolean,
    },

    // FUNCTIONS & METHODS
    {
        tag: [
            t.function(t.variableName),
            t.function(t.propertyName),
            t.macroName,
        ],
        color: ANYSPHERE_TEXT_COLORS.function,
    },

    // VARIABLES & PARAMETERS
    {
        tag: [
            t.variableName,
            t.local(t.variableName),
            t.definition(t.variableName),
            t.self,
        ],
        color: ANYSPHERE_TEXT_COLORS.default,
    },

    // PROPERTIES & OBJECT KEYS
    {
        tag: [t.propertyName, t.attributeName],
        color: ANYSPHERE_TEXT_COLORS.property,
    },

    // CLASSES, TYPES, INTERFACES, ENUMS
    {
        tag: [t.typeName, t.className, t.namespace, t.standard(t.typeName)],
        color: ANYSPHERE_TEXT_COLORS.type,
    },

    // JSX/HTML TAGS
    {
        tag: [t.tagName],
        color: ANYSPHERE_TEXT_COLORS.tag,
    },

    // JSX/HTML ATTRIBUTES
    {
        tag: [t.attributeName],
        color: ANYSPHERE_TEXT_COLORS.property,
    },

    // CSS PROPERTY NAMES
    {
        tag: [t.propertyName],
        color: ANYSPHERE_TEXT_COLORS.function,
    },

    // COMMENTS
    {
        tag: [t.comment, t.lineComment, t.blockComment],
        color: ANYSPHERE_TEXT_COLORS.comment,
        fontStyle: 'italic',
    },

    // DOC COMMENTS
    {
        tag: [t.docComment],
        color: ANYSPHERE_TEXT_COLORS.docComment,
        fontStyle: 'italic',
    },

    // PUNCTUATION & OPERATORS
    {
        tag: [
            t.operator,
            t.punctuation,
            t.bracket,
            t.paren,
            t.brace,
            t.separator,
            t.derefOperator,
            t.arithmeticOperator,
            t.logicOperator,
            t.bitwiseOperator,
            t.compareOperator,
            t.angleBracket,
        ],
        color: ANYSPHERE_TEXT_COLORS.punctuation,
    },

    // DECORATORS & ANNOTATIONS
    {
        tag: [t.annotation, t.meta],
        color: ANYSPHERE_TEXT_COLORS.keyword,
    },

    // ESCAPE SEQUENCES
    {
        tag: [t.escape],
        color: ANYSPHERE_TEXT_COLORS.number,
    },

    // LINKS
    {
        tag: [t.link, t.url],
        color: ANYSPHERE_TEXT_COLORS.function,
        textDecoration: 'underline',
    },

    // CSS UNITS & LABELS
    {
        tag: [t.unit, t.labelName],
        color: ANYSPHERE_TEXT_COLORS.type,
    },

    // MARKDOWN HEADINGS
    {
        tag: [t.heading, t.heading1, t.heading2, t.heading3],
        color: ANYSPHERE_TEXT_COLORS.type,
        fontWeight: 'bold',
    },

    // MARKDOWN LISTS & QUOTES
    {
        tag: [t.list, t.quote],
        color: ANYSPHERE_TEXT_COLORS.comment,
    },

    // MARKDOWN EMPHASIS
    {
        tag: [t.emphasis],
        fontStyle: 'italic',
        color: ANYSPHERE_TEXT_COLORS.default,
    },

    // MARKDOWN STRONG
    {
        tag: [t.strong],
        fontWeight: 'bold',
        color: ANYSPHERE_TEXT_COLORS.default,
    },

    // MARKDOWN STRIKETHROUGH
    {
        tag: [t.strikethrough],
        textDecoration: 'line-through',
        color: ANYSPHERE_TEXT_COLORS.muted,
    },

    // INVALID / ERRORS
    {
        tag: [t.invalid],
        color: ANYSPHERE_TEXT_COLORS.error,
    },

    // DEPRECATED
    {
        tag: [t.deleted],
        color: ANYSPHERE_TEXT_COLORS.muted,
        opacity: '0.7',
    },
])

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT COMPLETE THEME
// ═══════════════════════════════════════════════════════════════════════════

export const codexTheme: Extension = [
    codexEditorTheme,
    syntaxHighlighting(codexHighlightStyle),
]

export default codexTheme
