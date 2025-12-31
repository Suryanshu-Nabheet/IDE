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
            padding: '8px 0',
            fontFamily: typography.fontFamilyMono,
            lineHeight: typography.lineHeight.normal.toString(),
            fontVariantLigatures: typography.ligatures ? 'normal' : 'none',
        },

        // Cursor
        '.cm-cursor, .cm-dropCursor': {
            borderLeftColor: semantic.editor.cursor,
            borderLeftWidth: '2px',
            borderLeftStyle: 'solid',
        },

        // Selection
        '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
            {
                backgroundColor: semantic.editor.selection,
            },

        // Active line
        '.cm-activeLine': {
            backgroundColor: semantic.editor.lineHighlight,
        },

        // Selection match (find occurrences)
        '.cm-selectionMatch': {
            backgroundColor: semantic.editor.selectionMatch,
        },

        // Matching brackets
        '&.cm-focused .cm-matchingBracket': {
            backgroundColor: 'rgba(86, 156, 214, 0.2)',
            outline: `1px solid ${semantic.syntax.tag}`,
            borderRadius: radius.sm,
        },

        '&.cm-focused .cm-nonmatchingBracket': {
            backgroundColor: 'rgba(244, 135, 113, 0.2)',
            outline: `1px solid ${semantic.diagnostic.error}`,
            borderRadius: radius.sm,
        },

        // Gutters (line numbers)
        '.cm-gutters': {
            backgroundColor: semantic.gutter.background,
            color: semantic.gutter.foreground,
            border: 'none',
            paddingRight: '8px',
            fontFamily: typography.fontFamilyMono,
        },

        // Active line gutter
        '.cm-activeLineGutter': {
            backgroundColor: semantic.editor.lineHighlight,
            color: semantic.gutter.foregroundActive,
        },

        // Line numbers
        '.cm-lineNumbers .cm-gutterElement': {
            color: semantic.gutter.foreground,
            padding: '0 16px 0 24px',
            minWidth: '48px',
            fontSize: typography.fontSize.sm,
        },

        // Fold placeholder
        '.cm-foldPlaceholder': {
            backgroundColor: semantic.ui.backgroundSubtle,
            border: 'none',
            color: semantic.ui.foregroundMuted,
            borderRadius: radius.sm,
            padding: '0 8px',
            margin: '0 2px',
        },

        // Tooltips
        '.cm-tooltip': {
            border: `1px solid ${semantic.ui.border}`,
            backgroundColor: semantic.ui.backgroundElevated,
            color: semantic.ui.foreground,
            borderRadius: radius.md,
            padding: '8px 12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        },

        // Autocomplete
        '.cm-tooltip-autocomplete': {
            '& > ul > li[aria-selected]': {
                backgroundColor: semantic.editor.selection,
                color: semantic.editor.foreground,
            },
        },

        // Panels (search, replace)
        '.cm-panels': {
            backgroundColor: semantic.ui.backgroundElevated,
            color: semantic.ui.foreground,
            borderRadius: radius.md,
        },

        '.cm-panels.cm-panels-top': {
            borderBottom: `1px solid ${semantic.ui.border}`,
        },

        '.cm-panels.cm-panels-bottom': {
            borderTop: `1px solid ${semantic.ui.border}`,
        },

        // Search match
        '.cm-searchMatch': {
            backgroundColor: semantic.editor.selection,
            outline: `1px solid ${semantic.diagnostic.info}`,
            borderRadius: radius.sm,
        },

        '.cm-searchMatch.cm-searchMatch-selected': {
            backgroundColor: semantic.editor.selection,
            outline: `2px solid ${semantic.diagnostic.info}`,
            borderRadius: radius.sm,
        },

        // Diagnostics (errors, warnings, hints)
        '.cm-diagnostic-error': {
            borderLeft: `3px solid ${semantic.diagnostic.error}`,
            paddingLeft: '4px',
        },

        '.cm-diagnostic-warning': {
            borderLeft: `3px solid ${semantic.diagnostic.warning}`,
            paddingLeft: '4px',
        },

        '.cm-diagnostic-info': {
            borderLeft: `3px solid ${semantic.diagnostic.info}`,
            paddingLeft: '4px',
        },

        '.cm-diagnostic-hint': {
            borderLeft: `3px solid ${semantic.diagnostic.hint}`,
            paddingLeft: '4px',
        },

        // Lint underlines
        '.cm-lintRange-error': {
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='3'%3E%3Cpath d='M0 3 L3 0 L6 3' fill='none' stroke='${encodeURIComponent(
                semantic.diagnostic.error
            )}' stroke-width='0.6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat-x',
            backgroundPosition: 'bottom left',
        },

        '.cm-lintRange-warning': {
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='3'%3E%3Cpath d='M0 3 L3 0 L6 3' fill='none' stroke='${encodeURIComponent(
                semantic.diagnostic.warning
            )}' stroke-width='0.6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat-x',
            backgroundPosition: 'bottom left',
        },

        '.cm-lintRange-info': {
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='3'%3E%3Cpath d='M0 3 L3 0 L6 3' fill='none' stroke='${encodeURIComponent(
                semantic.diagnostic.info
            )}' stroke-width='0.6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat-x',
            backgroundPosition: 'bottom left',
        },

        // Focus outline
        '&.cm-focused': {
            outline: 'none',
        },
    },
    { dark: true }
)

// ═══════════════════════════════════════════════════════════════════════════
// SYNTAX HIGHLIGHTING
// ═══════════════════════════════════════════════════════════════════════════

const codexHighlightStyle = HighlightStyle.define([
    // Keywords (purple) — if, else, return, const, let, var, function, class, etc.
    {
        tag: [t.keyword, t.modifier, t.operatorKeyword],
        color: semantic.syntax.keyword,
    },

    // Control keywords (purple)
    {
        tag: [t.controlKeyword, t.moduleKeyword],
        color: semantic.syntax.keyword,
    },

    // Types, Classes, Interfaces (cyan)
    {
        tag: [t.typeName, t.className, t.namespace],
        color: semantic.syntax.type,
    },

    // Functions (yellow)
    {
        tag: [t.function(t.variableName), t.function(t.propertyName)],
        color: semantic.syntax.function,
    },

    // Properties, Attributes (light blue)
    {
        tag: [t.propertyName, t.attributeName],
        color: semantic.syntax.property,
    },

    // Variables (light blue)
    {
        tag: [t.variableName, t.definition(t.variableName)],
        color: semantic.syntax.variable,
    },

    // Constants (light blue)
    {
        tag: [t.constant(t.name), t.standard(t.name)],
        color: semantic.syntax.constant,
    },

    // Strings (orange)
    {
        tag: [
            t.string,
            t.special(t.string),
            t.processingInstruction,
            t.inserted,
        ],
        color: semantic.syntax.string,
    },

    // Template strings (orange)
    {
        tag: [t.special(t.brace)],
        color: semantic.syntax.string,
    },

    // Numbers (light green)
    {
        tag: [t.number, t.integer, t.float],
        color: semantic.syntax.number,
    },

    // Booleans, null (blue)
    {
        tag: [t.bool, t.null, t.atom],
        color: semantic.syntax.boolean,
    },

    // Comments (green, italic)
    {
        tag: [t.comment, t.lineComment, t.blockComment],
        color: semantic.syntax.comment,
        fontStyle: 'italic',
    },

    // Tags (blue) — HTML/JSX tags
    {
        tag: [t.tagName, t.angleBracket],
        color: semantic.syntax.tag,
    },

    // Operators (white)
    {
        tag: [
            t.operator,
            t.derefOperator,
            t.arithmeticOperator,
            t.logicOperator,
            t.bitwiseOperator,
            t.compareOperator,
            t.updateOperator,
        ],
        color: semantic.syntax.operator,
    },

    // Punctuation (white)
    {
        tag: [
            t.punctuation,
            t.separator,
            t.bracket,
            t.paren,
            t.brace,
            t.squareBracket,
        ],
        color: semantic.syntax.punctuation,
    },

    // CSS Selectors (gold)
    {
        tag: [t.labelName, t.name],
        color: semantic.syntax.selector,
    },

    // Regular expressions (orange)
    {
        tag: [t.regexp],
        color: semantic.syntax.regex,
    },

    // Escape sequences (yellow bright)
    {
        tag: [t.escape, t.character],
        color: semantic.syntax.escape,
    },

    // Links (blue bright, underlined)
    {
        tag: [t.link, t.url],
        color: semantic.diagnostic.info,
        textDecoration: 'underline',
    },

    // Headings (yellow, bold)
    {
        tag: [t.heading],
        color: semantic.syntax.function,
        fontWeight: typography.fontWeight.bold.toString(),
    },

    // Strong (bold)
    {
        tag: [t.strong],
        fontWeight: typography.fontWeight.bold.toString(),
    },

    // Emphasis (italic)
    {
        tag: [t.emphasis],
        fontStyle: 'italic',
    },

    // Strikethrough
    {
        tag: [t.strikethrough],
        textDecoration: 'line-through',
    },

    // Invalid/Error (red)
    {
        tag: [t.invalid],
        color: semantic.diagnostic.error,
    },

    // Meta (comments, muted)
    {
        tag: [t.meta],
        color: semantic.syntax.comment,
    },

    // Deleted (red)
    {
        tag: [t.deleted],
        color: semantic.diagnostic.error,
        backgroundColor: semantic.diagnostic.errorBackground,
    },

    // Changed (amber)
    {
        tag: [t.changed],
        color: semantic.diagnostic.warning,
        backgroundColor: semantic.diagnostic.warningBackground,
    },
])

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT COMPLETE THEME
// ═══════════════════════════════════════════════════════════════════════════

/**
 * The one and only CodeX IDE editor theme.
 * Pure black, production-ready, Anysphere Dark-inspired.
 */
export const codexTheme: Extension = [
    codexEditorTheme,
    syntaxHighlighting(codexHighlightStyle),
]

export default codexTheme
