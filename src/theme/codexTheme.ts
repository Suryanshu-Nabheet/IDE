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
    // KEYWORDS & SELECTORS (Anysphere Blue)
    {
        tag: [
            t.keyword,
            t.modifier,
            t.controlKeyword,
            t.moduleKeyword,
            t.tagName,
            t.labelName,
        ],
        color: semantic.syntax.keyword,
    },

    // VARIABLES (Crisp Off-white)
    {
        tag: [t.variableName, t.attributeName],
        color: semantic.syntax.variable,
    },
    { tag: [t.definition(t.variableName)], color: semantic.syntax.variable },

    // PROPERTIES & ATTRIBUTES (Anysphere Light Blue)
    {
        tag: [t.propertyName, t.attributeValue],
        color: semantic.syntax.property,
    },

    // FUNCTIONS & METHODS (Anysphere Yellow)
    {
        tag: [
            t.function(t.variableName),
            t.function(t.propertyName),
            t.macroName,
        ],
        color: semantic.syntax.function,
    },

    // TYPES & CLASSES (Teal/Greenish)
    {
        tag: [t.typeName, t.className, t.standard(t.typeName)],
        color: semantic.syntax.type,
    },

    // STRINGS (Orange/Clay)
    { tag: [t.string, t.special(t.string)], color: semantic.syntax.string },

    // NUMBERS (Lime)
    { tag: [t.number, t.integer, t.float], color: semantic.syntax.number },

    // CONSTANTS & BOOLEANS (Blue)
    { tag: [t.bool, t.null, t.atom, t.constant(t.name)], color: '#569cd6' },

    // COMMENTS (Green)
    {
        tag: [t.comment, t.lineComment, t.blockComment],
        color: semantic.syntax.comment,
    },

    // OPERATORS & PUNCTUATION (Grey/White)
    {
        tag: [
            t.operator,
            t.punctuation,
            t.bracket,
            t.paren,
            t.brace,
            t.separator,
        ],
        color: semantic.syntax.operator,
    },

    // SPECIAL
    { tag: [t.escape], color: '#d7ba7d' }, // Gold
    { tag: [t.regexp], color: '#d16969' }, // Red-ish
    { tag: [t.link], color: '#9cdcfe', textDecoration: 'underline' },

    // HTML/CSS SPECIALS
    { tag: [t.angleBracket], color: '#808080' },
    { tag: [t.labelName], color: '#d7ba7d' }, // CSS Selector (Gold)

    // MARKDOWN (Premium Support)
    {
        tag: [t.heading, t.heading1, t.heading2, t.heading3],
        color: semantic.syntax.keyword,
        fontWeight: 'bold',
    },
    { tag: [t.list, t.quote], color: '#6a9955' },
    { tag: [t.emphasis], fontStyle: 'italic', color: semantic.syntax.variable },
    { tag: [t.strong], fontWeight: 'bold', color: semantic.syntax.variable },
    { tag: [t.link], color: '#3794ff', textDecoration: 'underline' },
    { tag: [t.url], color: '#9cdcfe' },
    { tag: [t.strikethrough], textDecoration: 'line-through' },
    { tag: [t.meta], color: semantic.syntax.comment },
])

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT COMPLETE THEME
// ═══════════════════════════════════════════════════════════════════════════

export const codexTheme: Extension = [
    codexEditorTheme,
    syntaxHighlighting(codexHighlightStyle),
]

export default codexTheme
