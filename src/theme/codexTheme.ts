import { EditorView } from '@codemirror/view'
import { Extension } from '@codemirror/state'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'
import { CODEX_THEME } from './tokens'

const { typography } = CODEX_THEME

/**
 * Get color from CSS variable or fallback
 */
function getCssVar(name: string, fallback: string): string {
    if (typeof document === 'undefined') return fallback
    const val = getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim()
    return val || fallback
}

/**
 * Get theme colors from the theme system
 * Completely dynamic - relies on CSS variables populated by index.css or the theme loader
 */
function getThemeColors() {
    return {
        background: getCssVar('--editor-bg', '#000000'),
        foreground: getCssVar('--editor-fg', '#e5e5e5'),
        cursor: getCssVar('--editor-cursor', '#3b82f6'),
        selection: getCssVar('--editor-selection', 'rgba(59, 130, 246, 0.25)'),
        lineHighlight: getCssVar('--editor-line-highlight', '#0a0a0a'),
        gutterBg: getCssVar('--gutter-bg', '#000000'),
        gutterFg: getCssVar('--gutter-fg', '#6b6b6b'),
        gutterFgActive: getCssVar('--gutter-fg-active', '#a0a0a0'),
        uiBgElevated: getCssVar('--ui-bg-elevated', '#121212'),
        border: getCssVar('--border', '#1e1e1e'),
        bracketMatch: getCssVar(
            '--editor-selection-match',
            'rgba(59, 130, 246, 0.35)'
        ),

        // Syntax
        keyword: getCssVar('--keyword', '#569cd6'),
        constant: getCssVar('--constant', '#4fc1ff'),
        function: getCssVar('--function', '#dcdcaa'),
        variable: getCssVar('--variable', '#9cdcfe'),
        variableSpecial: getCssVar('--variable', '#9cdcfe'), // Fallback to variable
        type: getCssVar('--type', '#4ec9b0'),
        string: getCssVar('--string', '#ce9178'),
        stringEscape: getCssVar('--string', '#ce9178'),
        stringRegex: getCssVar('--string', '#ce9178'),
        number: getCssVar('--number', '#b5cea8'),
        boolean: getCssVar('--constant', '#569cd6'),
        comment: getCssVar('--comment', '#6a9955'),
        tag: getCssVar('--tag', '#569cd6'),
        attribute: getCssVar('--attribute', '#9cdcfe'),
        property: getCssVar('--property', '#d4d4d4'),
        operator: getCssVar('--operator', '#d4d4d4'),
        punctuation: getCssVar('--punctuation', '#d4d4d4'),
        textLiteral: getCssVar('--string', '#ce9178'),
        text: getCssVar('--editor-fg', '#e5e5e5'),
    }
}

/**
 * CodeMirror theme - Dynamic from CSS variables
 * This function MUST be called fresh each time - it reads from store/theme system
 */
export function getCodexTheme(): Extension {
    const colors = getThemeColors()

    const editorTheme = EditorView.theme(
        {
            '&': {
                color: colors.foreground,
                backgroundColor: colors.background,
                fontSize: 'var(--editor-font-size, 14px)',
                fontFamily: typography.fontFamilyMono,
                height: '100%',
            },
            '.cm-content': {
                color: colors.foreground,
                caretColor: colors.cursor,
                padding: '4px 0',
                fontFamily: typography.fontFamilyMono,
                lineHeight: '1.5',
                fontVariantLigatures: typography.ligatures ? 'normal' : 'none',
            },
            '.cm-cursor, .cm-dropCursor': {
                borderLeftColor: colors.cursor,
                borderLeftWidth: '2px',
                borderLeftStyle: 'solid',
            },
            '.cm-selectionBackground, ::selection': {
                backgroundColor: colors.selection + ' !important',
            },
            '&.cm-focused .cm-selectionBackground': {
                backgroundColor: colors.selection + ' !important',
            },
            '.cm-activeLine': {
                backgroundColor: colors.lineHighlight,
            },
            '.cm-selectionMatch': {
                backgroundColor: colors.bracketMatch,
            },
            '&.cm-focused .cm-matchingBracket': {
                backgroundColor: colors.bracketMatch,
                outline: 'none',
            },
            '&.cm-focused .cm-nonmatchingBracket': {
                backgroundColor: 'rgba(241, 76, 76, 0.3)',
            },
            '.cm-gutters': {
                backgroundColor: colors.background,
                color: colors.gutterFg,
                border: 'none',
                paddingRight: '16px',
                fontFamily: typography.fontFamilyMono,
            },
            '.cm-activeLineGutter': {
                backgroundColor: 'transparent',
                color: colors.gutterFgActive,
                fontWeight: '500',
            },
            '.cm-lineNumbers .cm-gutterElement': {
                padding: '0 12px 0 16px',
                minWidth: '48px',
                fontSize: typography.fontSize.sm,
                textAlign: 'right',
            },
            '&.cm-focused': {
                outline: 'none',
            },
            '.cm-panels': {
                backgroundColor: colors.background,
                color: colors.foreground,
            },
            '.cm-tooltip': {
                backgroundColor: colors.uiBgElevated,
                border: `1px solid ${colors.border}`,
                color: colors.foreground,
                borderRadius: '4px',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.4)',
            },
            '.cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]': {
                backgroundColor: colors.selection,
                color: colors.foreground,
            },
            '.cm-panel': {
                backgroundColor: colors.background,
            },
            '.cm-scroller': {
                fontFamily: typography.fontFamilyMono,
            },
        },
        { dark: true }
    )

    // Dynamic syntax highlighting
    const highlightStyle = HighlightStyle.define([
        {
            tag: [
                t.keyword,
                t.modifier,
                t.definitionKeyword,
                t.controlKeyword,
                t.moduleKeyword,
            ],
            color: colors.keyword,
        },
        { tag: [t.constant(t.variableName)], color: colors.constant },
        {
            tag: [t.function(t.variableName), t.macroName],
            color: colors.function,
        },
        {
            tag: [t.variableName, t.definition(t.variableName)],
            color: colors.variable,
        },
        { tag: [t.special(t.variableName)], color: colors.variableSpecial },
        {
            tag: [t.typeName, t.className, t.namespace],
            color: colors.type,
        },
        {
            tag: [t.string, t.special(t.string)],
            color: colors.string,
        },
        { tag: [t.escape], color: colors.stringEscape },
        { tag: [t.regexp], color: colors.stringRegex },
        { tag: [t.number], color: colors.number },
        { tag: [t.bool, t.null, t.atom], color: colors.boolean },
        {
            tag: [t.comment, t.lineComment, t.blockComment, t.docComment],
            color: colors.comment,
            fontStyle: 'italic',
        },
        { tag: [t.tagName], color: colors.tag },
        {
            tag: [t.attributeName],
            color: colors.attribute,
            fontStyle: 'italic',
        },
        { tag: [t.propertyName], color: colors.property },
        {
            tag: [t.punctuation, t.operator, t.bracket, t.separator],
            color: colors.punctuation,
        },
        { tag: [t.literal], color: colors.textLiteral },
        { tag: [t.content], color: colors.text },
        { tag: [t.heading], color: colors.type, fontWeight: 'bold' },
    ])

    return [editorTheme, syntaxHighlighting(highlightStyle)]
}

// Legacy export - returns a basic theme that matches the CSS variables
// This ensures we don't break imports, but the theme is still dynamic
export const codexTheme: Extension = EditorView.theme(
    {
        '&': {
            backgroundColor: 'var(--editor-bg)',
            color: 'var(--editor-fg)',
        },
    },
    { dark: true }
)

export default codexTheme
