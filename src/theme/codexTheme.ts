import { EditorView } from '@codemirror/view'
import { Extension } from '@codemirror/state'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'
import { CODEX_THEME } from './tokens'

const { typography } = CODEX_THEME

// ═══════════════════════════════════════════════════════════════════════════
// ANYSPHERE DARK - PERFECT DEVELOPER THEME
// Purple/Pink/Green/Blue/Yellow on Pure Black
// ═══════════════════════════════════════════════════════════════════════════

const ANYSPHERE_COLORS = {
    // Base text colors
    text: {
        primary: '#E6EDF3',
        secondary: '#9DA7B3',
        muted: '#768390',
        disabled: '#545D68',
        bright: '#FFFFFF',
    },

    // Syntax highlighting — EXACT Cursor (Anysphere Dark)
    syntax: {
        // Keywords, modifiers, directives ("use client", import, export, return)
        keyword: '#C792EA',

        // Strings, template literals, JSX text
        string: '#ECC48D',

        // Numbers, booleans, null, undefined
        constant: '#F78C6C',

        // Function names, method calls
        function: '#82AAFF',

        // Variables, identifiers
        variable: '#E6EDF3',

        // Parameters
        parameter: '#D4D4D4',

        // Classes, types, interfaces
        type: '#FFCB6B',

        // JSX / HTML tags
        tag: '#89DDFF',

        // JSX / HTML attributes
        attribute: '#C3E88D',

        // Object keys
        property: '#C3E88D',

        // Operators
        operator: '#89DDFF',

        // Punctuation
        punctuation: '#A6ACCD',

        // Comments (line + block)
        comment: '#5F6A7D',

        // Decorators / annotations
        decorator: '#C792EA',

        // Errors
        error: '#FF5370',

        // Warnings
        warning: '#FFCB6B',

        // Info / hints
        info: '#82AAFF',
    },
}

const codexEditorTheme = EditorView.theme(
    {
        // Root editor - pure black
        '&': {
            color: ANYSPHERE_COLORS.text.primary,
            backgroundColor: '#000000', // Pure Black
            fontSize: typography.fontSize.base,
            fontFamily: typography.fontFamilyMono,
            height: '100%',
        },

        // Content area
        '.cm-content': {
            caretColor: '#FFFFFF', // White Cursor
            padding: '4px 0',
            fontFamily: typography.fontFamilyMono,
            lineHeight: '1.6',
            fontVariantLigatures: typography.ligatures ? 'normal' : 'none',
        },

        // Cursor
        '.cm-cursor, .cm-dropCursor': {
            borderLeftColor: '#FFFFFF', // White Cursor
            borderLeftWidth: '2px',
            borderLeftStyle: 'solid',
        },

        // Selection
        '.cm-selectionBackground, ::selection': {
            backgroundColor: 'rgba(97, 175, 239, 0.2) !important', // Blue Selection
        },
        '&.cm-focused .cm-selectionBackground': {
            backgroundColor: 'rgba(97, 175, 239, 0.2) !important', // Blue Selection
        },

        // Active line
        '.cm-activeLine': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
        },

        // Selection match
        '.cm-selectionMatch': {
            backgroundColor: '#44475A60',
            outline: '1px solid #44475A90',
        },

        // Matching brackets
        '&.cm-focused .cm-matchingBracket': {
            backgroundColor: 'transparent',
            color: ANYSPHERE_COLORS.syntax.keyword, // Purple
            outline: '2px solid ' + ANYSPHERE_COLORS.syntax.keyword, // Purple outlined
            borderRadius: '3px',
            fontWeight: '700',
        },

        '&.cm-focused .cm-nonmatchingBracket': {
            backgroundColor: '#FF79C620',
            color: ANYSPHERE_COLORS.syntax.error,
            outline: '2px solid ' + ANYSPHERE_COLORS.syntax.error,
            borderRadius: '3px',
        },

        // Gutters
        '.cm-gutters': {
            backgroundColor: '#000000', // Pure Black
            color: '#444444',
            border: 'none',
            paddingRight: '16px',
            fontFamily: typography.fontFamilyMono,
        },

        // Active line gutter
        '.cm-activeLineGutter': {
            backgroundColor: 'transparent',
            color: '#FFFFFF',
            fontWeight: '600',
        },

        // Line numbers
        '.cm-lineNumbers .cm-gutterElement': {
            padding: '0 12px 0 16px',
            minWidth: '48px',
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
            color: ANYSPHERE_COLORS.text.primary,
        },

        // Tooltips
        '.cm-tooltip': {
            backgroundColor: '#1a1a1a',
            border: '1px solid #2a2a2a',
            color: ANYSPHERE_COLORS.text.primary,
            borderRadius: '6px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
        },

        // Autocomplete
        '.cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]': {
            backgroundColor: 'rgba(97, 175, 239, 0.2)', // Blue Selection
            color: ANYSPHERE_COLORS.text.bright,
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
// PERFECT SYNTAX HIGHLIGHTING
// Purple → Main (className, "use client")
// Pink → String content
// Light Green → import/export/interface
// Blue → Component tags (AlertCircle, motion.div)
// Yellow → HTML tags (div, span)
// White → Normal content
// ═══════════════════════════════════════════════════════════════════════════

const codexHighlightStyle = HighlightStyle.define([
    // PURPLE - Main keywords, "use client", className, const, let, var
    {
        tag: [t.keyword, t.modifier, t.definitionKeyword],
        color: ANYSPHERE_COLORS.syntax.keyword,
        fontWeight: '700',
    },

    // PURPLE - Control flow
    {
        tag: [t.controlKeyword, t.operatorKeyword],
        color: ANYSPHERE_COLORS.syntax.keyword,
        fontWeight: '700',
    },

    // HOT PURPLE - Decorators (@decorator)
    {
        tag: [t.annotation, t.meta],
        color: ANYSPHERE_COLORS.syntax.decorator,
        fontWeight: '600',
    },

    // LIGHT GREEN - import, export, from, as
    {
        tag: [t.moduleKeyword],
        color: ANYSPHERE_COLORS.syntax.attribute, // Closest map to Green for now
        fontWeight: '700',
    },

    // LIGHT GREEN - interface, type, enum
    {
        tag: [t.typeName, t.namespace],
        color: ANYSPHERE_COLORS.syntax.type,
        fontWeight: '600',
    },

    // YELLOW - HTML tags (div, span, button, input)
    {
        tag: [t.standard(t.tagName)],
        color: ANYSPHERE_COLORS.syntax.warning, // Yellow
        fontWeight: '600',
    },

    // BLUE - Component tags (AlertCircle, motion.div, custom components)
    {
        tag: [t.tagName],
        color: ANYSPHERE_COLORS.syntax.tag, // Blue
        fontWeight: '600',
    },

    // YELLOW BRIGHT - Class names (when used as types)
    {
        tag: [t.className],
        color: ANYSPHERE_COLORS.syntax.type,
        fontWeight: '600',
    },

    // BLUE - Function declarations and calls
    {
        tag: [
            t.function(t.variableName),
            t.function(t.propertyName),
            t.macroName,
        ],
        color: ANYSPHERE_COLORS.syntax.function,
        fontWeight: '500',
    },

    // WHITE - Variables (normal content)
    {
        tag: [
            t.variableName,
            t.local(t.variableName),
            t.definition(t.variableName),
            t.self,
        ],
        color: ANYSPHERE_COLORS.text.primary,
    },

    // MINT GREEN - Properties (object.property)
    {
        tag: [t.propertyName],
        color: ANYSPHERE_COLORS.syntax.property,
    },

    // PINK - String content (including "use client", className="...")
    {
        tag: [t.string, t.special(t.string), t.docString],
        color: ANYSPHERE_COLORS.syntax.string,
    },

    // SOFT PINK - JSX/HTML attributes
    {
        tag: [t.attributeName],
        color: ANYSPHERE_COLORS.syntax.attribute, // Greenish/Yellow in Anysphere?
    },

    // PURPLE - Numbers
    {
        tag: [t.number, t.integer, t.float],
        color: ANYSPHERE_COLORS.syntax.constant,
        fontWeight: '600',
    },

    // PURPLE - Booleans (true, false)
    {
        tag: [t.bool],
        color: ANYSPHERE_COLORS.syntax.constant,
        fontWeight: '700',
    },

    // PURPLE - null, undefined
    {
        tag: [t.null, t.atom],
        color: ANYSPHERE_COLORS.syntax.constant,
        fontWeight: '700',
    },

    // GOLD - Constants (UPPER_CASE)
    {
        tag: [t.constant(t.name), t.constant(t.variableName)],
        color: ANYSPHERE_COLORS.syntax.constant,
        fontWeight: '700',
    },

    // CYAN - Operators
    {
        tag: [
            t.operator,
            t.derefOperator,
            t.arithmeticOperator,
            t.logicOperator,
            t.bitwiseOperator,
            t.compareOperator,
        ],
        color: ANYSPHERE_COLORS.syntax.operator,
    },

    // LIGHT GRAY - Punctuation
    {
        tag: [t.punctuation, t.separator],
        color: ANYSPHERE_COLORS.syntax.punctuation,
    },

    // CYAN - Brackets
    {
        tag: [t.bracket, t.paren, t.brace, t.angleBracket],
        color: ANYSPHERE_COLORS.syntax.operator,
    },

    // PURPLE-GRAY - Comments
    {
        tag: [t.comment, t.lineComment, t.blockComment, t.docComment],
        color: ANYSPHERE_COLORS.syntax.comment,
        fontStyle: 'italic',
    },

    // PURPLE - Escape sequences
    {
        tag: [t.escape],
        color: ANYSPHERE_COLORS.syntax.keyword,
        fontWeight: '600',
    },

    // PINK - Regex
    {
        tag: [t.regexp],
        color: ANYSPHERE_COLORS.syntax.string,
    },

    // BLUE - Links
    {
        tag: [t.link, t.url],
        color: ANYSPHERE_COLORS.syntax.info,
        textDecoration: 'underline',
    },

    // YELLOW - CSS selectors
    {
        tag: [t.labelName],
        color: ANYSPHERE_COLORS.syntax.type,
        fontWeight: '600',
    },

    // CYAN - CSS units
    {
        tag: [t.unit],
        color: ANYSPHERE_COLORS.syntax.operator,
    },

    // YELLOW - Markdown headings
    {
        tag: [t.heading, t.heading1, t.heading2, t.heading3],
        color: ANYSPHERE_COLORS.syntax.type,
        fontWeight: 'bold',
    },

    // COMMENT COLOR - Markdown lists
    {
        tag: [t.list, t.quote],
        color: ANYSPHERE_COLORS.syntax.comment,
    },

    // WHITE - Markdown emphasis
    {
        tag: [t.emphasis],
        fontStyle: 'italic',
        color: ANYSPHERE_COLORS.text.primary,
    },

    // BRIGHT WHITE - Markdown strong
    {
        tag: [t.strong],
        fontWeight: 'bold',
        color: ANYSPHERE_COLORS.text.bright,
    },

    // MUTED - Markdown strikethrough
    {
        tag: [t.strikethrough],
        textDecoration: 'line-through',
        color: ANYSPHERE_COLORS.text.muted,
    },

    // PINK - Invalid/errors (no red!)
    {
        tag: [t.invalid],
        color: ANYSPHERE_COLORS.syntax.error,
        textDecoration: 'underline wavy',
    },

    // MUTED - Deprecated
    {
        tag: [t.deleted],
        color: ANYSPHERE_COLORS.text.muted,
        opacity: '0.5',
        textDecoration: 'line-through',
    },
])

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT PERFECT THEME
// ═══════════════════════════════════════════════════════════════════════════

export const codexTheme: Extension = [
    codexEditorTheme,
    syntaxHighlighting(codexHighlightStyle),
]

export default codexTheme
