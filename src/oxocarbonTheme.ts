import { EditorView } from '@codemirror/view'
import { Extension } from '@codemirror/state'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

/**
 * Oxocarbon Theme for CodeMirror 6 - Premium Dark Edition
 * Enhanced with deeper blacks and richer tones for a luxurious feel
 * Inspired by IBM Carbon Design System
 * https://github.com/nyoom-engineering/oxocarbon.nvim
 */

// Oxocarbon Color Palette - Premium Dark Edition
const colors = {
    // Background/Dark Grays - Deeper and more premium
    base00: '#0a0a0a', // Deeper background - almost pure black
    base01: '#141414', // Even darker lighter background
    base02: '#1e1e1e', // Darker selection background
    base03: '#3a3a3a', // Darker gray for subtle elements

    // Foreground/Light Grays & Whites - Enhanced contrast
    base04: '#a0a8b0', // Darker muted foreground
    base05: '#d8dce0', // Softer bright foreground
    base06: '#ffffff', // Pure white for maximum contrast

    // Accent Colors - More vibrant and saturated for premium feel
    blue: '#6fa0ff', // Slightly brighter blue
    cyan: '#2dd4d1', // More vibrant cyan
    teal: '#06b8b5', // Richer teal
    lightBlue: '#75c7ff', // Brighter light blue
    skyBlue: '#2fb8ff', // More vibrant sky blue
    pink: '#ff4d9e', // More saturated pink
    lightPink: '#ff6eb8', // Brighter light pink
    green: '#3bc95f', // More vibrant green
    purple: '#b88dff', // Richer purple

    // Semantic colors
    error: '#ff6eb8',
    warning: '#ff6eb8',
    info: '#6fa0ff',
    success: '#3bc95f',
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

        '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
            {
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

        '&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket':
            {
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
    {
        tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],
        color: colors.pink,
    },
    { tag: [t.function(t.variableName), t.labelName], color: colors.blue },
    {
        tag: [t.color, t.constant(t.name), t.standard(t.name)],
        color: colors.cyan,
    },
    { tag: [t.definition(t.name), t.separator], color: colors.base05 },
    {
        tag: [
            t.typeName,
            t.className,
            t.number,
            t.changed,
            t.annotation,
            t.modifier,
            t.self,
            t.namespace,
        ],
        color: colors.lightBlue,
    },
    {
        tag: [
            t.operator,
            t.operatorKeyword,
            t.url,
            t.escape,
            t.regexp,
            t.link,
            t.special(t.string),
        ],
        color: colors.teal,
    },
    { tag: [t.meta, t.comment], color: colors.base03, fontStyle: 'italic' },
    { tag: t.strong, fontWeight: 'bold' },
    { tag: t.emphasis, fontStyle: 'italic' },
    { tag: t.strikethrough, textDecoration: 'line-through' },
    { tag: t.link, color: colors.blue, textDecoration: 'underline' },
    { tag: t.heading, fontWeight: 'bold', color: colors.skyBlue },
    {
        tag: [t.atom, t.bool, t.special(t.variableName)],
        color: colors.lightPink,
    },
    {
        tag: [t.processingInstruction, t.string, t.inserted],
        color: colors.green,
    },
    { tag: t.invalid, color: colors.error },
])

// Export the complete theme
export const oxocarbon: Extension = [
    oxocarbonTheme,
    syntaxHighlighting(oxocarbonHighlightStyle),
]

export default oxocarbon
