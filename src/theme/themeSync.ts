/**
 * Centralized Theme Synchronization System
 * Single source of truth for all theme values in CodeX IDE
 */

import { Settings } from '../features/window/state'

export interface ThemeColors {
    background: string
    foreground: string
    cursor: string
    selection: string
    lineHighlight: string
    keyword: string
    string: string
    number: string
    function: string
    variable: string
    type: string
    comment: string
    tag: string
    attribute: string
}

/**
 * Apply theme to root CSS variables
 * This is the only place theme values should be set
 */
export function applyThemeToRoot(theme: ThemeColors, isDark = true) {
    const root = document.documentElement

    // ═══════════════════════════════════════════════════════════════════════
    // BASE COLORS - Cursor IDE / VS Code Dark Theme
    // ═══════════════════════════════════════════════════════════════════════
    root.style.setProperty('--black', theme.background)
    root.style.setProperty('--black-soft', theme.lineHighlight)
    root.style.setProperty('--black-elevated', theme.lineHighlight)
    root.style.setProperty('--black-subtle', theme.lineHighlight)

    // Gray scale matching Cursor IDE / VS Code
    root.style.setProperty('--gray-900', theme.background)
    root.style.setProperty('--gray-800', theme.lineHighlight)
    root.style.setProperty('--gray-700', theme.lineHighlight)
    root.style.setProperty('--gray-600', theme.lineHighlight)
    root.style.setProperty('--gray-500', '#3e3e3e')
    root.style.setProperty('--gray-400', '#858585')
    root.style.setProperty('--gray-300', '#cccccc')
    root.style.setProperty('--gray-200', theme.foreground)
    root.style.setProperty('--gray-100', '#ffffff')

    root.style.setProperty('--white', '#ffffff')
    root.style.setProperty('--white-soft', '#f3f3f3')

    // ═══════════════════════════════════════════════════════════════════════
    // CORE BACKGROUNDS - All use theme.background
    // ═══════════════════════════════════════════════════════════════════════
    root.style.setProperty('--background', theme.background)
    root.style.setProperty('--editor-bg', theme.background)
    root.style.setProperty('--sidebar-bg', theme.background)
    root.style.setProperty('--panel-bg', theme.background)
    root.style.setProperty('--activity-bar-bg', theme.background)
    root.style.setProperty('--titlebar-bg', theme.background)
    root.style.setProperty('--terminal-bg', theme.background)
    root.style.setProperty('--ui-bg', theme.background)
    root.style.setProperty('--gutter-bg', theme.background)
    root.style.setProperty('--chatbar-background', theme.background)
    root.style.setProperty('--welcome-bg', theme.background)
    root.style.setProperty('--welcome-container-bg', theme.background)

    // Elevated Surfaces - Cursor IDE / VS Code
    root.style.setProperty('--ui-bg-elevated', theme.lineHighlight)
    root.style.setProperty('--ui-bg-subtle', theme.lineHighlight)
    root.style.setProperty('--panel-bg-elevated', theme.lineHighlight)

    // ═══════════════════════════════════════════════════════════════════════
    // CORE FOREGROUNDS - All use theme.foreground
    // ═══════════════════════════════════════════════════════════════════════
    root.style.setProperty('--editor-fg', theme.foreground)
    root.style.setProperty('--ui-fg', theme.foreground)
    root.style.setProperty('--sidebar-fg', theme.foreground)
    root.style.setProperty('--panel-fg', theme.foreground)
    root.style.setProperty('--titlebar-fg', theme.foreground)
    root.style.setProperty('--terminal-fg', theme.foreground)
    root.style.setProperty('--text', theme.foreground)
    root.style.setProperty('--active-text', theme.foreground)
    root.style.setProperty('--any-fg', theme.foreground)
    root.style.setProperty('--chat-text', theme.foreground)

    // Muted Foregrounds - Cursor IDE / VS Code
    root.style.setProperty('--ui-fg-muted', '#858585')
    root.style.setProperty('--any-fg-muted', '#858585')
    root.style.setProperty('--sidebar-fg-muted', '#858585')
    root.style.setProperty('--gutter-fg', '#858585')
    root.style.setProperty('--tab-fg', '#858585')
    root.style.setProperty('--gutter-fg-active', theme.foreground)

    // ═══════════════════════════════════════════════════════════════════════
    // EDITOR ELEMENTS
    // ═══════════════════════════════════════════════════════════════════════
    root.style.setProperty('--editor-cursor', theme.cursor)
    root.style.setProperty('--terminal-cursor', theme.cursor)
    root.style.setProperty('--editor-selection', theme.selection)
    root.style.setProperty('--terminal-selection', theme.selection)
    root.style.setProperty('--selection', theme.selection)
    root.style.setProperty('--editor-line-highlight', theme.lineHighlight)
    root.style.setProperty('--editor-selection-match', theme.selection)
    root.style.setProperty('--editor-wrap-guide', '#3e3e3e')

    // ═══════════════════════════════════════════════════════════════════════
    // SYNTAX COLORS - From theme
    // ═══════════════════════════════════════════════════════════════════════
    root.style.setProperty('--keyword', theme.keyword)
    root.style.setProperty('--string', theme.string)
    root.style.setProperty('--number', theme.number)
    root.style.setProperty('--function', theme.function)
    root.style.setProperty('--variable', theme.variable)
    root.style.setProperty('--type', theme.type)
    root.style.setProperty('--comment', theme.comment)
    root.style.setProperty('--tag', theme.tag)
    root.style.setProperty('--attribute', theme.attribute)
    root.style.setProperty('--constant', theme.keyword)
    root.style.setProperty('--property', theme.foreground)
    root.style.setProperty('--operator', theme.foreground)
    root.style.setProperty('--punctuation', theme.foreground)

    // ═══════════════════════════════════════════════════════════════════════
    // UNIFIED BORDER SYSTEM - Cursor IDE / VS Code
    // ═══════════════════════════════════════════════════════════════════════
    const borderColor = '#3e3e3e'
    root.style.setProperty('--border', borderColor)
    root.style.setProperty('--ui-border', 'var(--border)')
    root.style.setProperty('--ui-border-subtle', 'var(--border)')
    root.style.setProperty('--sidebar-border', 'var(--border)')
    root.style.setProperty('--panel-border', 'var(--border)')
    root.style.setProperty('--pane-border', 'var(--border)')
    root.style.setProperty('--tab-border', 'var(--border)')
    root.style.setProperty('--titlebar-border', 'var(--border)')
    root.style.setProperty('--activity-bar-border', 'var(--border)')
    root.style.setProperty('--input-border', 'var(--border)')
    root.style.setProperty('--terminal-border', 'var(--border)')
    root.style.setProperty('--editor-wrap-guide', 'var(--border)')
    root.style.setProperty('--chatbar-border', 'var(--border)')

    // ═══════════════════════════════════════════════════════════════════════
    // HOVER STATES - Cursor IDE / VS Code
    // ═══════════════════════════════════════════════════════════════════════
    root.style.setProperty('--ui-hover', theme.lineHighlight)
    root.style.setProperty('--sidebar-hover', theme.lineHighlight)
    root.style.setProperty('--tab-hover', theme.lineHighlight)
    root.style.setProperty('--tab-hover-bg', theme.lineHighlight)
    root.style.setProperty('--titlebar-button-hover', theme.lineHighlight)
    root.style.setProperty('--accent-hover', theme.lineHighlight)

    // ═══════════════════════════════════════════════════════════════════════
    // SELECTED STATES - Cursor IDE / VS Code
    // ═══════════════════════════════════════════════════════════════════════
    root.style.setProperty('--sidebar-selected', theme.selection)
    root.style.setProperty('--sidebar-bg-active', theme.lineHighlight)
    root.style.setProperty('--sidebar-fg-active', theme.foreground)
    root.style.setProperty('--accent-active', theme.selection)

    // ═══════════════════════════════════════════════════════════════════════
    // ACCENT COLORS - Cursor IDE / VS Code Blue
    // ═══════════════════════════════════════════════════════════════════════
    root.style.setProperty('--accent', '#007acc')
    root.style.setProperty('--accent-rgb', '0, 122, 204') // For rgba() usage
    root.style.setProperty('--blue', '#007acc')
    root.style.setProperty('--blue-light', '#1ba1e2')
    root.style.setProperty('--sidebar-selected-accent', '#007acc')

    // ═══════════════════════════════════════════════════════════════════════
    // ACTIVITY BAR - Cursor IDE / VS Code
    // ═══════════════════════════════════════════════════════════════════════
    if (isDark) {
        root.style.setProperty('--activity-bar-fg', '#ffffff')
        root.style.setProperty('--activity-bar-fg-muted', 'rgba(255, 255, 255, 0.4)')
    } else {
        root.style.setProperty('--activity-bar-fg', '#1f1f1f')
        root.style.setProperty('--activity-bar-fg-muted', 'rgba(0, 0, 0, 0.4)')
    }

    // ═══════════════════════════════════════════════════════════════════════
    // TABS - Cursor IDE / VS Code
    // ═══════════════════════════════════════════════════════════════════════
    root.style.setProperty('--tab-bg', theme.background)
    root.style.setProperty('--tab-bg-active', theme.background)
    root.style.setProperty('--tab-inactive-bg', theme.background)
    root.style.setProperty('--tab-active-bg', theme.background)
    root.style.setProperty('--tab-fg-active', theme.foreground)
    root.style.setProperty('--tab-inactive-font', 'rgba(204, 204, 204, 0.5)')

    // ═══════════════════════════════════════════════════════════════════════
    // INPUTS - Cursor IDE / VS Code
    // ═══════════════════════════════════════════════════════════════════════
    root.style.setProperty('--input-bg', theme.lineHighlight)
    root.style.setProperty('--input-fg', theme.foreground)
    root.style.setProperty('--input-placeholder', '#858585')
    root.style.setProperty('--input-background', theme.lineHighlight)
    root.style.setProperty('--input-text', theme.foreground)
    root.style.setProperty('--input-border-focus', '#007acc')

    // ═══════════════════════════════════════════════════════════════════════
    // BUTTONS - Cursor IDE / VS Code
    // ═══════════════════════════════════════════════════════════════════════
    root.style.setProperty('--button-primary', '#007acc')
    root.style.setProperty('--button-primary-hover', theme.lineHighlight)
    root.style.setProperty('--button-success', '#28a745')
    root.style.setProperty('--button-success-hover', '#218838')
    root.style.setProperty('--button-danger', '#dc3545')
    root.style.setProperty('--button-danger-hover', '#c82333')
    root.style.setProperty('--button-secondary', theme.lineHighlight)
    root.style.setProperty('--button-secondary-hover', theme.lineHighlight)

    // ═══════════════════════════════════════════════════════════════════════
    // SCROLLBAR - Cursor IDE / VS Code
    // ═══════════════════════════════════════════════════════════════════════
    root.style.setProperty('--scrollbar-bg', 'transparent')
    root.style.setProperty('--scrollbar-thumb', 'rgba(121, 121, 121, 0.4)')
    root.style.setProperty('--scrollbar-thumb-hover', 'rgba(121, 121, 121, 0.6)')
    root.style.setProperty('--scrollbar-thumb-border', 'rgba(121, 121, 121, 0.4)')
    root.style.setProperty('--scrollbar-track-bg', theme.background)
    root.style.setProperty('--scrollbar-track-border', 'rgba(121, 121, 121, 0.2)')
    root.style.setProperty('--scrollbar-background', 'transparent')
    root.style.setProperty('--scrollbar', 'rgba(121, 121, 121, 0.4)')

    // ═══════════════════════════════════════════════════════════════════════
    // LEGACY COMPATIBILITY - Map old variable names
    // ═══════════════════════════════════════════════════════════════════════
    root.style.setProperty('--left-pane-background', theme.background)
    root.style.setProperty('--left-pane-hover', theme.lineHighlight)
    root.style.setProperty('--left-pane-selected', theme.selection)
    root.style.setProperty('--selected-text', '#1ba1e2')
    root.style.setProperty('--marked-text', '#007acc')
    root.style.setProperty('--user-chat-bubble', '#007acc')
    root.style.setProperty('--assistant-chat-bubble', theme.lineHighlight)
    root.style.setProperty('--title-bar-background', theme.background)
    root.style.setProperty('--tab-bar-background', theme.background)
    root.style.setProperty('--tab-active', theme.background)
    root.style.setProperty('--tab-not-active', theme.background)
    root.style.setProperty('--selection-match', theme.selection)
    root.style.setProperty('--button', theme.lineHighlight)
    root.style.setProperty('--codex-theme-editor-background', theme.background)
    root.style.setProperty('--codex-blue', '#007acc')
    root.style.setProperty('--link-codex-blue', '#1ba1e2')
    root.style.setProperty('--submit-button', '#28a745')
    root.style.setProperty('--reject-button', '#dc3545')
    root.style.setProperty('--submit-transparent-button', 'rgba(40, 167, 69, 0.5)')
    root.style.setProperty('--reject-transparent-button', 'rgba(220, 53, 69, 0.5)')
    root.style.setProperty('--cancel-button', theme.lineHighlight)
    root.style.setProperty('--continue-button', '#007acc')
    root.style.setProperty('--full-continue-button', '#28a745')
    root.style.setProperty('--ai-color', '#007acc')
    root.style.setProperty('--diff-add', '#e5feeb')
    root.style.setProperty('--other-diff-add', 'rgba(40, 167, 69, 0.2)')
    root.style.setProperty('--diff-bright-add', '#28a745')
    root.style.setProperty('--diff-delete', '#ffe5e5')
    root.style.setProperty('--diff-bright-delete', '#dc3545')

    // ═══════════════════════════════════════════════════════════════════════
    // ANYSPHERE LEGACY
    // ═══════════════════════════════════════════════════════════════════════
    root.style.setProperty('--any-bg-lighter', theme.lineHighlight)
    root.style.setProperty('--any-bg-darker', theme.background)
    root.style.setProperty('--any-bg', theme.background)
    root.style.setProperty('--any-fg', theme.foreground)
    root.style.setProperty('--any-fg-muted', '#858585')
    root.style.setProperty('--any-tag', '#007acc')
}

/**
 * Sync theme from settings - called when theme changes
 * This is the ONLY place theme values should be set
 */
export function syncThemeFromSettings(settings: Settings, availableThemes: any) {
    const themeName = settings.theme || 'codex-dark'
    const theme = availableThemes[themeName]

    if (theme && theme.colors) {
        const c = theme.colors
        applyThemeToRoot(
            {
                background: c.background || '#0d0d0d',
                foreground: c.foreground || '#d6d6dd',
                cursor: c.cursor || '#d6d6dd',
                selection: c.selection || '#163761',
                lineHighlight: c.lineHighlight || '#151515',
                // ALWAYS use Anysphere syntax colors - no theme variations
                keyword: '#83d6c5',
                string: '#e394dc',
                number: '#d6d6dd',
                function: '#ebc88d',
                variable: '#aa9bf5',
                type: '#87c3ff',
                comment: '#474747',
                tag: '#fad075',
                attribute: '#aaa0fa',
            },
            theme.type === 'dark'
        )
    } else {
        // Fallback with Anysphere theme syntax colors
        applyThemeToRoot(
            {
                background: '#0d0d0d',
                foreground: '#d6d6dd',
                cursor: '#d6d6dd',
                selection: '#163761',
                lineHighlight: '#151515',
                // Syntax colors are always Anysphere - set in codexTheme.ts
                keyword: '#83d6c5',
                string: '#e394dc',
                number: '#d6d6dd',
                function: '#ebc88d',
                variable: '#aa9bf5',
                type: '#87c3ff',
                comment: '#474747',
                tag: '#fad075',
                attribute: '#aaa0fa',
            },
            true
        )
    }
}
