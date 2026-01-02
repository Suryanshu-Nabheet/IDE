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

// ═══════════════════════════════════════════════════════════════════════════
// VS CODE DARK MODERN (PURE BLACK)
// ═══════════════════════════════════════════════════════════════════════════

const VSCODE_DARK_COLORS = {
    // Base Colors
    background: '#000000', // Pure Black
    foreground: '#CCCCCC', // Standard VSCode Light Gray
    cursor: '#FFFFFF',
    selection: '#264F78', // VSCode Dark Blue Selection
    lineHighlight: '#FFFFFF0B', // Very subtle

    // Syntax Colors (VS Code Default)
    blue: '#569CD6', // Keywords, Storage
    green: '#6A9955', // Comments
    greenBright: '#B5CEA8', // Numbers
    cyan: '#9CDCFE', // Variables, Parameters
    cyanBright: '#4EC9B0', // Types, Interfaces
    orange: '#CE9178', // Strings
    yellow: '#DCDCAA', // Functions
    pink: '#C586C0', // Control Flow
    white: '#D4D4D4', // Punctuation, Default
    red: '#F44747', // Errors
}

const codexEditorTheme = EditorView.theme(
    {
        // Root editor - VS Code Style (Black)
        '&': {
            color: VSCODE_DARK_COLORS.foreground,
            backgroundColor: 'var(--background, #000000)',
            fontSize: 'var(--editor-font-size, 14px)',
            fontFamily: typography.fontFamilyMono,
            height: '100%',
        },

        // Content area
        '.cm-content': {
            caretColor: VSCODE_DARK_COLORS.cursor,
            padding: '4px 0',
            fontFamily: typography.fontFamilyMono,
            lineHeight: '1.5', // VS Code default is slightly tighter
            fontVariantLigatures: typography.ligatures ? 'normal' : 'none',
        },

        // Cursor
        '.cm-cursor, .cm-dropCursor': {
            borderLeftColor: VSCODE_DARK_COLORS.cursor,
            borderLeftWidth: '2px',
            borderLeftStyle: 'solid',
        },

        // Selection
        '.cm-selectionBackground, ::selection': {
            backgroundColor: VSCODE_DARK_COLORS.selection + ' !important',
        },
        '&.cm-focused .cm-selectionBackground': {
            backgroundColor: VSCODE_DARK_COLORS.selection + ' !important',
        },

        // Active line
        '.cm-activeLine': {
            backgroundColor: VSCODE_DARK_COLORS.lineHighlight,
        },

        // Selection match
        '.cm-selectionMatch': {
            backgroundColor: '#3a3d41', // VS Code match highlight
            border: '1px solid #3a3d41',
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
            backgroundColor: VSCODE_DARK_COLORS.background,
            color: '#858585', // VS Code Line Numbers
            border: 'none',
            paddingRight: '16px',
            fontFamily: typography.fontFamilyMono,
        },

        // Active line gutter
        '.cm-activeLineGutter': {
            backgroundColor: 'transparent',
            color: '#FFFFFF',
            fontWeight: '500',
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
            backgroundColor: VSCODE_DARK_COLORS.background,
            color: VSCODE_DARK_COLORS.foreground,
        },

        // Tooltips
        '.cm-tooltip': {
            backgroundColor: '#252526', // VS Code Menu BG
            border: '1px solid #454545',
            color: '#CCCCCC',
            borderRadius: '4px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.4)',
        },

        // Autocomplete
        '.cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]': {
            backgroundColor: '#04395E', // VS Code List Hover
            color: '#FFFFFF',
        },

        '.cm-panel': {
            backgroundColor: VSCODE_DARK_COLORS.background,
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
    // VS CODE: Keywords (Blue)
    {
        tag: [
            t.keyword,
            t.modifier,
            t.definitionKeyword,
            t.standard(t.tagName),
        ],
        color: VSCODE_DARK_COLORS.blue,
    },

    // VS CODE: Control Flow (Pink)
    {
        tag: [t.controlKeyword, t.moduleKeyword],
        color: VSCODE_DARK_COLORS.pink,
    },

    // VS CODE: Functions (Yellow)
    {
        tag: [t.function(t.variableName), t.macroName],
        color: VSCODE_DARK_COLORS.yellow,
    },

    // VS CODE: Variables & Parameters (Light Blue / White)
    {
        tag: [t.variableName, t.propertyName],
        color: VSCODE_DARK_COLORS.cyan,
    },
    {
        tag: [t.definition(t.variableName)],
        color: VSCODE_DARK_COLORS.cyan,
    },

    // VS CODE: Types & Classes (Teal/Green)
    {
        tag: [t.typeName, t.className, t.namespace],
        color: VSCODE_DARK_COLORS.cyanBright,
    },

    // VS CODE: Strings (Orange)
    {
        tag: [t.string, t.special(t.string), t.regexp],
        color: VSCODE_DARK_COLORS.orange,
    },

    // VS CODE: Numbers & Booleans (Light Green)
    {
        tag: [t.number, t.bool, t.null, t.atom],
        color: VSCODE_DARK_COLORS.greenBright,
    },

    // VS CODE: Comments (Green)
    {
        tag: [t.comment, t.lineComment, t.blockComment],
        color: VSCODE_DARK_COLORS.green,
    },

    // VS CODE: HTML/JSX Tags (Blue)
    {
        tag: [t.tagName],
        color: VSCODE_DARK_COLORS.blue,
    },

    // VS CODE: Attributes (Light Blue)
    {
        tag: [t.attributeName],
        color: VSCODE_DARK_COLORS.cyan,
    },

    // VS CODE: Default Text / Punctuation (Light Gray/White)
    {
        tag: [t.punctuation, t.operator, t.bracket, t.separator],
        color: VSCODE_DARK_COLORS.white,
    },

    // VS CODE: Escape (Yellow-Orange)
    {
        tag: [t.escape],
        color: '#D7BA7D',
    },

    // Markdown / Headings
    {
        tag: [t.heading],
        color: VSCODE_DARK_COLORS.blue,
        fontWeight: 'bold',
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
