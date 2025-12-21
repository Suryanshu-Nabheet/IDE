import { EditorView } from '@codemirror/view'
import { Extension } from '@codemirror/state'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

/**
 * Oxocarbon Theme for CodeMirror 6
 * Inspired by IBM Carbon Design System
 * https://github.com/nyoom-engineering/oxocarbon.nvim
 */

// Oxocarbon Color Palette
const colors = {
    // Background/Dark Grays
    base00: '#161616', // Background
    base01: '#262626', // Lighter background
    base02: '#393939', // Selection background
    base03: '#525252', // Comments, invisibles
    
    // Foreground/Light Grays & Whites
    base04: '#dde1e6', // Dark foreground
    base05: '#f2f4f8', // Default foreground
    base06: '#ffffff', // Light foreground
    
    // Accent Colors
    blue: '#78a9ff',      // Primary blue
    cyan: '#3ddbd9',      // Cyan/Teal
    teal: '#08bdba',      // Dark teal
    lightBlue: '#82cfff', // Light blue
    skyBlue: '#33b1ff',   // Sky blue
    pink: '#ee5396',      // Pink
    lightPink: '#ff7eb6', // Light pink
    green: '#42be65',     // Green
    purple: '#be95ff',    // Purple
    
    // Semantic colors
    error: '#ff7eb6',
    warning: '#ff7eb6',
    info: '#78a9ff',
    success: '#42be65',
}

// Editor theme
const oxocarbonTheme = EditorView.theme(
    {
        '&': {
            color: colors.base05,
            backgroundColor: colors.base00,
        },
        
        '.cm-content': {
            caretColor: colors.blue,
        },
        
        '.cm-cursor, .cm-dropCursor': {
            borderLeftColor: colors.blue,
        },
        
        '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
            backgroundColor: colors.base02,
        },
        
        '.cm-panels': {
            backgroundColor: colors.base01,
            color: colors.base05,
        },
        
        '.cm-panels.cm-panels-top': {
            borderBottom: `2px solid ${colors.base02}`,
        },
        
        '.cm-panels.cm-panels-bottom': {
            borderTop: `2px solid ${colors.base02}`,
        },
        
        '.cm-searchMatch': {
            backgroundColor: colors.base02,
            outline: `1px solid ${colors.blue}`,
        },
        
        '.cm-searchMatch.cm-searchMatch-selected': {
            backgroundColor: colors.base02,
            outline: `2px solid ${colors.skyBlue}`,
        },
        
        '.cm-activeLine': {
            backgroundColor: colors.base01,
        },
        
        '.cm-selectionMatch': {
            backgroundColor: colors.base02,
        },
        
        '&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket': {
            backgroundColor: colors.base02,
            outline: `1px solid ${colors.blue}`,
        },
        
        '.cm-gutters': {
            backgroundColor: colors.base00,
            color: colors.base03,
            border: 'none',
        },
        
        '.cm-activeLineGutter': {
            backgroundColor: colors.base01,
            color: colors.base05,
        },
        
        '.cm-foldPlaceholder': {
            backgroundColor: colors.base02,
            border: 'none',
            color: colors.base04,
        },
        
        '.cm-tooltip': {
            border: 'none',
            backgroundColor: colors.base01,
            color: colors.base05,
        },
        
        '.cm-tooltip .cm-tooltip-arrow:before': {
            borderTopColor: 'transparent',
            borderBottomColor: 'transparent',
        },
        
        '.cm-tooltip .cm-tooltip-arrow:after': {
            borderTopColor: colors.base01,
            borderBottomColor: colors.base01,
        },
        
        '.cm-tooltip-autocomplete': {
            '& > ul > li[aria-selected]': {
                backgroundColor: colors.base02,
                color: colors.base06,
            },
        },
        
        // Line numbers
        '.cm-lineNumbers .cm-gutterElement': {
            color: colors.base03,
        },
        
        // Diagnostic styles
        '.cm-diagnostic-error': {
            borderLeft: `3px solid ${colors.error}`,
        },
        
        '.cm-diagnostic-warning': {
            borderLeft: `3px solid ${colors.warning}`,
        },
        
        '.cm-diagnostic-info': {
            borderLeft: `3px solid ${colors.info}`,
        },
    },
    { dark: true }
)

// Syntax highlighting
const oxocarbonHighlightStyle = HighlightStyle.define([
    { tag: t.keyword, color: colors.purple },
    { tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName], color: colors.pink },
    { tag: [t.function(t.variableName), t.labelName], color: colors.blue },
    { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: colors.cyan },
    { tag: [t.definition(t.name), t.separator], color: colors.base05 },
    { tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: colors.lightBlue },
    { tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)], color: colors.teal },
    { tag: [t.meta, t.comment], color: colors.base03, fontStyle: 'italic' },
    { tag: t.strong, fontWeight: 'bold' },
    { tag: t.emphasis, fontStyle: 'italic' },
    { tag: t.strikethrough, textDecoration: 'line-through' },
    { tag: t.link, color: colors.blue, textDecoration: 'underline' },
    { tag: t.heading, fontWeight: 'bold', color: colors.skyBlue },
    { tag: [t.atom, t.bool, t.special(t.variableName)], color: colors.lightPink },
    { tag: [t.processingInstruction, t.string, t.inserted], color: colors.green },
    { tag: t.invalid, color: colors.error },
])

// Export the complete theme
export const oxocarbon: Extension = [
    oxocarbonTheme,
    syntaxHighlighting(oxocarbonHighlightStyle),
]

export default oxocarbon
