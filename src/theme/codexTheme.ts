import { EditorView } from '@codemirror/view'
import { Extension } from '@codemirror/state'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'
import { CODEX_THEME } from './tokens'
import { store } from '../app/store'

const { typography } = CODEX_THEME

/**
 * Anysphere Theme - Exact colors from Zed theme JSON
 * This is the ONLY theme - no variations
 */
const ANYSPHERE_THEME = {
    // Editor colors
    background: '#181818',
    foreground: '#d6d6dd',
    cursor: '#d6d6dd',
    selection: '#163761',
    lineHighlight: '#212121',
    gutterBg: '#181818',
    gutterFg: '#535353',
    gutterFgActive: '#d6d6dd',
    wrapGuide: '#383838',
    bracketMatch: '#163761',
    
    // Syntax colors - exact from JSON
    keyword: '#83d6c5',
    constant: '#83d6c5',
    function: '#ebc88d',
    variable: '#aa9bf5',
    variableSpecial: '#E1DAE8',
    type: '#87c3ff',
    string: '#e394dc',
    stringEscape: '#CC7832',
    stringRegex: '#DA2877',
    stringSpecial: '#CC7832',
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
    
    // UI colors
    border: '#383838',
    uiBgElevated: '#1d1d1d',
}

/**
 * Get theme colors from the theme system - ensures CodeMirror syncs with IDE theme
 * Background colors come from theme, syntax colors are ALWAYS Anysphere
 * Safe to call even if store isn't initialized yet (uses CSS variables as fallback)
 */
function getThemeColors() {
    // Try to get from store, but handle case when store isn't ready yet
    let bg = ANYSPHERE_THEME.background
    let fg = ANYSPHERE_THEME.foreground
    let cursor = ANYSPHERE_THEME.cursor
    let selection = ANYSPHERE_THEME.selection
    let lineHighlight = ANYSPHERE_THEME.lineHighlight
    
    try {
        const state = store.getState()
        const settings = state.settingsState.settings
        const themeName = settings.theme || 'codex-dark'
        const availableThemes = state.extensionsState.availableThemes
        const theme = availableThemes[themeName]
        
        if (theme?.colors) {
            bg = theme.colors.background || ANYSPHERE_THEME.background
            fg = theme.colors.foreground || ANYSPHERE_THEME.foreground
            cursor = theme.colors.cursor || ANYSPHERE_THEME.cursor
            selection = theme.colors.selection || ANYSPHERE_THEME.selection
            lineHighlight = theme.colors.lineHighlight || ANYSPHERE_THEME.lineHighlight
        }
    } catch (e) {
        // Store not ready yet - use CSS variables or defaults
        if (typeof document !== 'undefined') {
            const root = document.documentElement
            const style = getComputedStyle(root)
            bg = style.getPropertyValue('--editor-bg').trim() || ANYSPHERE_THEME.background
            fg = style.getPropertyValue('--editor-fg').trim() || ANYSPHERE_THEME.foreground
            cursor = style.getPropertyValue('--editor-cursor').trim() || ANYSPHERE_THEME.cursor
            selection = style.getPropertyValue('--editor-selection').trim() || ANYSPHERE_THEME.selection
            lineHighlight = style.getPropertyValue('--editor-line-highlight').trim() || ANYSPHERE_THEME.lineHighlight
        }
    }
    
    return {
        background: bg,
        foreground: fg,
        cursor: cursor,
        selection: selection,
        lineHighlight: lineHighlight,
        // ALWAYS use Anysphere syntax colors
        keyword: ANYSPHERE_THEME.keyword,
        string: ANYSPHERE_THEME.string,
        number: ANYSPHERE_THEME.number,
        function: ANYSPHERE_THEME.function,
        variable: ANYSPHERE_THEME.variable,
        type: ANYSPHERE_THEME.type,
        comment: ANYSPHERE_THEME.comment,
        tag: ANYSPHERE_THEME.tag,
        attribute: ANYSPHERE_THEME.attribute,
        property: ANYSPHERE_THEME.property,
        operator: ANYSPHERE_THEME.operator,
        punctuation: ANYSPHERE_THEME.punctuation,
        constant: ANYSPHERE_THEME.constant,
        bracketMatch: selection,
        gutterFg: ANYSPHERE_THEME.gutterFg,
        gutterFgActive: ANYSPHERE_THEME.gutterFgActive,
        uiBgElevated: ANYSPHERE_THEME.uiBgElevated,
        border: ANYSPHERE_THEME.border,
    }
}

/**
 * CodeMirror theme - Anysphere Theme
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

    // ALWAYS use Anysphere syntax colors - exact from JSON
    const highlightStyle = HighlightStyle.define([
        { tag: [t.keyword, t.modifier, t.definitionKeyword, t.controlKeyword, t.moduleKeyword], color: ANYSPHERE_THEME.keyword },
        { tag: [t.constant(t.variableName)], color: ANYSPHERE_THEME.constant },
        { tag: [t.function(t.variableName), t.macroName], color: ANYSPHERE_THEME.function },
        { tag: [t.variableName, t.definition(t.variableName)], color: ANYSPHERE_THEME.variable },
        { tag: [t.special(t.variableName)], color: ANYSPHERE_THEME.variableSpecial },
        { tag: [t.typeName, t.className, t.namespace], color: ANYSPHERE_THEME.type },
        { tag: [t.string, t.special(t.string)], color: ANYSPHERE_THEME.string },
        { tag: [t.escape], color: ANYSPHERE_THEME.stringEscape },
        { tag: [t.regexp], color: ANYSPHERE_THEME.stringRegex },
        { tag: [t.number], color: ANYSPHERE_THEME.number },
        { tag: [t.bool, t.null, t.atom], color: ANYSPHERE_THEME.boolean },
        { tag: [t.comment, t.lineComment, t.blockComment, t.docComment], color: ANYSPHERE_THEME.comment, fontStyle: 'italic' },
        { tag: [t.tagName], color: ANYSPHERE_THEME.tag },
        { tag: [t.attributeName], color: ANYSPHERE_THEME.attribute, fontStyle: 'italic' },
        { tag: [t.propertyName], color: ANYSPHERE_THEME.property },
        { tag: [t.punctuation, t.operator, t.bracket, t.separator], color: ANYSPHERE_THEME.punctuation },
        { tag: [t.literal], color: ANYSPHERE_THEME.textLiteral },
        { tag: [t.content], color: ANYSPHERE_THEME.text },
        { tag: [t.heading], color: ANYSPHERE_THEME.type, fontWeight: 'bold' },
    ])

    return [editorTheme, syntaxHighlighting(highlightStyle)]
}

// Legacy export for compatibility - returns minimal theme to avoid circular dependency
// Always use getCodexTheme() instead for reactive themes
export const codexTheme: Extension = EditorView.theme({
    '&': {
        backgroundColor: ANYSPHERE_THEME.background,
        color: ANYSPHERE_THEME.foreground,
    },
}, { dark: true })

export default codexTheme
