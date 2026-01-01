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
        primary: '#E6EDF3', // White - normal content
        secondary: '#A0A8B5', // Light gray
        muted: '#6B7280', // Muted gray
        disabled: '#404450', // Very muted
        bright: '#FFFFFF', // Pure white for emphasis
    },

    // Precision syntax colors
    syntax: {
        // PURPLE - Main keywords, "use client", className, decorators
        purple: '#b54dfaff', // Main purple for className, "use client"
        purpleBright: '#BB86FC', // Bright purple for special keywords
        purpleDecorator: '#E879F9', // Hot purple for @decorators

        // PINK - Content inside className, string values, JSX content
        pink: '#ff50b3ff', // Bright pink for string content
        pinkSoft: '#FFB3D9', // Soft pink for attributes
        pinkVivid: '#FF6AC1', // Vivid pink for special strings

        // LIGHT GREEN - import, export, interface, type keywords
        green: '#36ff68ff', // Light green for import/export
        greenSoft: '#69FF94', // Soft green for interface/type
        greenMint: '#A6E3A1', // Mint for properties

        // BLUE - Tag names like AlertCircle, motion.div
        blue: '#03cffdff', // Cyan-blue for component tags
        blueBright: '#82AAFF', // Bright blue for functions
        blueVivid: '#61AFEF', // Vivid blue for special functions

        // YELLOW - HTML tags (div, span, button)
        yellow: '#F1FA8C', // Yellow for HTML elements
        yellowBright: '#FFD866', // Bright yellow for types
        yellowGold: '#E5C07B', // Gold for constants

        // WHITE - Normal content, variables
        white: '#E6EDF3', // White for normal text
        whiteBright: '#FFFFFF', // Pure white for emphasis

        // SUPPORTING COLORS
        operator: '#89DDFF', // Cyan for operators
        punctuation: '#ABB2BF', // Light gray for punctuation
        comment: '#6272A4', // Purple-gray for comments
        number: '#BD93F9', // Purple for numbers
        boolean: '#BD93F9', // Purple for booleans
        null: '#BD93F9', // Purple for null/undefined
    },

    // Editor UI
    editor: {
        background: '#000000', // Pure black
        lineHighlight: '#0d0d0d', // Barely visible
        selection: '#44475A', // Dark gray selection
        cursor: '#F8F8F2', // Bright cursor
        matchingBracket: '#8BE9FD', // Cyan for brackets
    },

    // Gutter
    gutter: {
        background: '#000000', // Pure black
        foreground: '#3d3d3d', // Very muted
        active: '#6E7681', // Active line
    },

    // Diagnostics (no red)
    diagnostic: {
        error: '#FF79C6', // Pink for errors
        warning: '#F1FA8C', // Yellow for warnings
        info: '#8BE9FD', // Blue for info
    },
}

const codexEditorTheme = EditorView.theme(
    {
        // Root editor - pure black
        '&': {
            color: ANYSPHERE_COLORS.text.primary,
            backgroundColor: ANYSPHERE_COLORS.editor.background,
            fontSize: typography.fontSize.base,
            fontFamily: typography.fontFamilyMono,
            height: '100%',
        },

        // Content area
        '.cm-content': {
            caretColor: ANYSPHERE_COLORS.editor.cursor,
            padding: '4px 0',
            fontFamily: typography.fontFamilyMono,
            lineHeight: '1.6',
            fontVariantLigatures: typography.ligatures ? 'normal' : 'none',
        },

        // Cursor
        '.cm-cursor, .cm-dropCursor': {
            borderLeftColor: ANYSPHERE_COLORS.editor.cursor,
            borderLeftWidth: '2px',
            borderLeftStyle: 'solid',
        },

        // Selection
        '.cm-selectionBackground, ::selection': {
            backgroundColor: ANYSPHERE_COLORS.editor.selection + ' !important',
        },
        '&.cm-focused .cm-selectionBackground': {
            backgroundColor: ANYSPHERE_COLORS.editor.selection + ' !important',
        },

        // Active line
        '.cm-activeLine': {
            backgroundColor: ANYSPHERE_COLORS.editor.lineHighlight,
        },

        // Selection match
        '.cm-selectionMatch': {
            backgroundColor: '#44475A60',
            outline: '1px solid #44475A90',
        },

        // Matching brackets
        '&.cm-focused .cm-matchingBracket': {
            backgroundColor: 'transparent',
            color: ANYSPHERE_COLORS.editor.matchingBracket,
            outline: '2px solid ' + ANYSPHERE_COLORS.editor.matchingBracket,
            borderRadius: '3px',
            fontWeight: '700',
        },

        '&.cm-focused .cm-nonmatchingBracket': {
            backgroundColor: '#FF79C620',
            color: ANYSPHERE_COLORS.diagnostic.error,
            outline: '2px solid ' + ANYSPHERE_COLORS.diagnostic.error,
            borderRadius: '3px',
        },

        // Gutters
        '.cm-gutters': {
            backgroundColor: ANYSPHERE_COLORS.gutter.background,
            color: ANYSPHERE_COLORS.gutter.foreground,
            border: 'none',
            paddingRight: '16px',
            fontFamily: typography.fontFamilyMono,
        },

        // Active line gutter
        '.cm-activeLineGutter': {
            backgroundColor: 'transparent',
            color: ANYSPHERE_COLORS.gutter.active,
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
            backgroundColor: ANYSPHERE_COLORS.editor.selection,
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
        color: ANYSPHERE_COLORS.syntax.purple,
        fontWeight: '700',
    },

    // PURPLE - Control flow
    {
        tag: [t.controlKeyword, t.operatorKeyword],
        color: ANYSPHERE_COLORS.syntax.purpleBright,
        fontWeight: '700',
    },

    // HOT PURPLE - Decorators (@decorator)
    {
        tag: [t.annotation, t.meta],
        color: ANYSPHERE_COLORS.syntax.purpleDecorator,
        fontWeight: '600',
    },

    // LIGHT GREEN - import, export, from, as
    {
        tag: [t.moduleKeyword],
        color: ANYSPHERE_COLORS.syntax.green,
        fontWeight: '700',
    },

    // LIGHT GREEN - interface, type, enum
    {
        tag: [t.typeName, t.namespace],
        color: ANYSPHERE_COLORS.syntax.greenSoft,
        fontWeight: '600',
    },

    // YELLOW - HTML tags (div, span, button, input)
    {
        tag: [t.standard(t.tagName)],
        color: ANYSPHERE_COLORS.syntax.yellow,
        fontWeight: '600',
    },

    // BLUE - Component tags (AlertCircle, motion.div, custom components)
    {
        tag: [t.tagName],
        color: ANYSPHERE_COLORS.syntax.blue,
        fontWeight: '600',
    },

    // YELLOW BRIGHT - Class names (when used as types)
    {
        tag: [t.className],
        color: ANYSPHERE_COLORS.syntax.yellowBright,
        fontWeight: '600',
    },

    // BLUE - Function declarations and calls
    {
        tag: [
            t.function(t.variableName),
            t.function(t.propertyName),
            t.macroName,
        ],
        color: ANYSPHERE_COLORS.syntax.blueBright,
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
        color: ANYSPHERE_COLORS.syntax.white,
    },

    // MINT GREEN - Properties (object.property)
    {
        tag: [t.propertyName],
        color: ANYSPHERE_COLORS.syntax.greenMint,
    },

    // PINK - String content (including "use client", className="...")
    {
        tag: [t.string, t.special(t.string), t.docString],
        color: ANYSPHERE_COLORS.syntax.pink,
    },

    // SOFT PINK - JSX/HTML attributes
    {
        tag: [t.attributeName],
        color: ANYSPHERE_COLORS.syntax.pinkSoft,
    },

    // PURPLE - Numbers
    {
        tag: [t.number, t.integer, t.float],
        color: ANYSPHERE_COLORS.syntax.number,
        fontWeight: '600',
    },

    // PURPLE - Booleans (true, false)
    {
        tag: [t.bool],
        color: ANYSPHERE_COLORS.syntax.boolean,
        fontWeight: '700',
    },

    // PURPLE - null, undefined
    {
        tag: [t.null, t.atom],
        color: ANYSPHERE_COLORS.syntax.null,
        fontWeight: '700',
    },

    // GOLD - Constants (UPPER_CASE)
    {
        tag: [t.constant(t.name), t.constant(t.variableName)],
        color: ANYSPHERE_COLORS.syntax.yellowGold,
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
        color: ANYSPHERE_COLORS.syntax.purpleBright,
        fontWeight: '600',
    },

    // PINK - Regex
    {
        tag: [t.regexp],
        color: ANYSPHERE_COLORS.syntax.pinkVivid,
    },

    // BLUE - Links
    {
        tag: [t.link, t.url],
        color: ANYSPHERE_COLORS.syntax.blue,
        textDecoration: 'underline',
    },

    // YELLOW - CSS selectors
    {
        tag: [t.labelName],
        color: ANYSPHERE_COLORS.syntax.yellow,
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
        color: ANYSPHERE_COLORS.syntax.yellowBright,
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
        color: ANYSPHERE_COLORS.syntax.white,
    },

    // BRIGHT WHITE - Markdown strong
    {
        tag: [t.strong],
        fontWeight: 'bold',
        color: ANYSPHERE_COLORS.syntax.whiteBright,
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
        color: ANYSPHERE_COLORS.diagnostic.error,
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
