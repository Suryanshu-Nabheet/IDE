import { EditorView } from '@codemirror/view'
import { Extension } from '@codemirror/state'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'
import { CODEX_THEME } from './tokens'

const { semantic, typography, radius } = CODEX_THEME

const codexEditorTheme = EditorView.theme(
    {
        // Root editor
        '&': {
            color: semantic.editor.foreground,
            backgroundColor: semantic.editor.background,
            fontSize: typography.fontSize.base,
            fontFamily: typography.fontFamilyMono,
            height: '100%',
        },

        // Content area
        '.cm-content': {
            caretColor: semantic.editor.cursor,
            padding: '4px 0',
            fontFamily: typography.fontFamilyMono,
            lineHeight: typography.lineHeight.tight.toString(),
            fontVariantLigatures: typography.ligatures ? 'normal' : 'none',
        },

        // Cursor
        '.cm-cursor, .cm-dropCursor': {
            borderLeftColor: semantic.editor.cursor,
            borderLeftWidth: '2px',
            borderLeftStyle: 'solid',
        },

        // Selection
        '.cm-selectionBackground, ::selection': {
            backgroundColor: semantic.editor.selection + ' !important',
        },
        '&.cm-focused .cm-selectionBackground': {
            backgroundColor: semantic.editor.selection + ' !important',
        },

        // Active line
        '.cm-activeLine': {
            backgroundColor: semantic.editor.lineHighlight,
        },

        // Selection match (find occurrences)
        '.cm-selectionMatch': {
            backgroundColor: semantic.editor.selectionMatch,
            outline: '1px solid #333',
        },

        // Matching brackets
        '&.cm-focused .cm-matchingBracket': {
            backgroundColor: 'transparent',
            outline: `1px solid ${semantic.ui.foregroundMuted}`,
        },

        '&.cm-focused .cm-nonmatchingBracket': {
            backgroundColor: 'rgba(241, 76, 76, 0.2)',
            outline: `1px solid ${semantic.diagnostic.error}`,
        },

        // Gutters (line numbers)
        '.cm-gutters': {
            backgroundColor: semantic.gutter.background,
            color: semantic.gutter.foreground,
            border: 'none',
            paddingRight: '12px',
            fontFamily: typography.fontFamilyMono,
        },

        // Active line gutter
        '.cm-activeLineGutter': {
            backgroundColor: 'transparent',
            color: semantic.gutter.foregroundActive,
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

        // Panels (Standardize)
        '.cm-panels': {
            backgroundColor: semantic.ui.backgroundElevated,
            color: semantic.ui.foreground,
        },
        '.cm-tooltip': {
            backgroundColor: semantic.ui.backgroundElevated,
            border: `1px solid ${semantic.ui.border}`,
            color: semantic.ui.foreground,
        },
        '.cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]': {
            backgroundColor: '#04395e',
            color: '#fff',
        },
    },
    { dark: true }
)

// ═══════════════════════════════════════════════════════════════════════════
// SYNTAX HIGHLIGHTING (Anysphere Style)
// ═══════════════════════════════════════════════════════════════════════════

const codexHighlightStyle = HighlightStyle.define([
    // KEYWORDS & CONTROL FLOW -> Purple
    {
        tag: [
            t.keyword,
            t.modifier,
            t.controlKeyword,
            t.moduleKeyword,
            t.definitionKeyword,
            t.standard(t.tagName),
        ],
        color: '#C678DD', // Purple
    },

    // FUNCTIONS & METHODS -> Blue
    {
        tag: [
            t.function(t.variableName),
            t.function(t.propertyName),
            t.macroName,
            t.special(t.variableName),
        ],
        color: '#61AFEF', // Blue
    },

    // STRINGS -> Light Green
    {
        tag: [t.string, t.special(t.string), t.regexp, t.escape],
        color: '#98C379', // Light Green
    },

    // NUMBERS & CONSTANTS -> Yellow (or Orange/Yellow hybrid)
    {
        tag: [
            t.number,
            t.integer,
            t.float,
            t.bool,
            t.null,
            t.atom,
            t.constant(t.name),
        ],
        color: '#E5C07B', // Yellow
    },

    // TYPES, CLASSES, & INTERFACES -> Yellow
    {
        tag: [
            t.typeName,
            t.className,
            t.standard(t.typeName),
            t.changed,
            t.annotation,
            t.namespace,
        ],
        color: '#E5C07B', // Yellow
    },

    // VARIABLES & PROPERTIES -> White
    {
        tag: [
            t.variableName,
            t.propertyName,
            t.attributeName,
            t.labelName,
            t.definition(t.variableName),
        ],
        color: '#FFFFFF', // White
    },

    // TAGS (HTML/JSX) -> Pink
    {
        tag: [t.tagName, t.standard(t.tagName), t.angleBracket],
        color: '#E06C75', // Pink
    },

    // ATTRIBUTES -> Yellow (or soft Orange)
    {
        tag: [t.attributeValue],
        color: '#E5C07B', // Yellow
    },

    // OPERATORS & PUNCTUATION -> White / Muted White
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
        ],
        color: '#FFFFFF', // White
    },

    // COMMENTS -> Muted Gray
    {
        tag: [t.comment, t.lineComment, t.blockComment, t.meta],
        color: '#7F848E', // Muted Gray
        fontStyle: 'italic',
    },

    // URL/LINKS -> Blue
    {
        tag: [t.link, t.url],
        color: '#61AFEF', // Blue
        textDecoration: 'underline',
    },

    // MARKDOWN HEADERS -> Purple (Distinct)
    {
        tag: [t.heading, t.heading1, t.heading2, t.heading3, t.heading4],
        color: '#C678DD', // Purple
        fontWeight: 'bold',
    },

    // LISTS & QUOTES -> Yellow
    {
        tag: [t.list, t.quote],
        color: '#E5C07B',
    },

    // EMPHASIS -> White Italic
    {
        tag: [t.emphasis],
        color: '#FFFFFF',
        fontStyle: 'italic',
    },

    // STRONG -> White Bold
    {
        tag: [t.strong],
        color: '#FFFFFF',
        fontWeight: 'bold',
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
