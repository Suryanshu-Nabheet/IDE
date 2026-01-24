export const BASE_TOKENS = {
    // Dynamic Anysphere Theme - Mapped to CSS Variables defined in themeSync.ts
    anysphere: {
        // UI Backgrounds
        editorBg: 'var(--editor-bg)',
        sidebarBg: 'var(--sidebar-bg)',
        panelBg: 'var(--panel-bg)',
        activityBarBg: 'var(--activity-bar-bg)',
        titleBarBg: 'var(--titlebar-bg)',
        elevatedSurfaceBg: 'var(--panel-bg-elevated)', // mapped

        // Tabs
        tabActiveBg: 'var(--tab-active-bg)',
        tabInactiveBg: 'var(--tab-inactive-bg)',
        tabHoverBg: 'var(--tab-hover-bg)',
        tabBorder: 'var(--tab-border)',

        // Text
        fgPrimary: 'var(--text)',
        fgSecondary: 'var(--ui-fg)',
        fgMuted: 'var(--ui-fg-muted)',
        fgDisabled: 'var(--ui-fg-muted)', // Fallback

        // Editor Elements
        cursor: 'var(--editor-cursor)',
        selection: 'var(--editor-selection)',
        activeLine: 'var(--editor-line-highlight)',
        lineHighlight: 'var(--editor-line-highlight)',
        indentGuide: 'var(--editor-wrap-guide)',
        bracketMatch: 'var(--editor-selection-match)',

        // Syntax Highlighting - Dynamic via css vars
        keyword: 'var(--keyword)',
        string: 'var(--string)',
        stringEscape: 'var(--string)', // Fallback
        stringRegex: 'var(--string)', // Fallback
        stringSpecial: 'var(--string)', // Fallback
        number: 'var(--number)',
        boolean: 'var(--constant)',
        function: 'var(--function)',
        variable: 'var(--variable)',
        variableSpecial: 'var(--variable)',
        type: 'var(--type)',
        comment: 'var(--comment)',
        tag: 'var(--tag)',
        attribute: 'var(--attribute)',
        constant: 'var(--constant)',
        textLiteral: 'var(--string)',
        text: 'var(--text)',
        operator: 'var(--operator)',
        punctuation: 'var(--punctuation)',
        property: 'var(--property)',

        // Accents & State
        border: 'var(--border)',
        hover: 'var(--ui-hover)',
        focus: 'var(--focus-border, var(--accent))',
        error: 'var(--input-validation-error-border, #f14c4c)',
        success: 'var(--button-success, #15ac91)',
        warning: 'var(--input-validation-warning-border, #ea7620)',
        info: 'var(--input-validation-info-border, #228df2)',
        activeFileBg:
            'var(--list-active-selection-bg, var(--sidebar-selected))',
        activeFileText: 'var(--list-active-selection-fg, var(--text))',
        elementBackground: 'var(--accent)',
    },
} as const

// ═══════════════════════════════════════════════════════════════════════════
// SEMANTIC TOKENS
// ═══════════════════════════════════════════════════════════════════════════

export const SEMANTIC_TOKENS = {
    editor: {
        background: BASE_TOKENS.anysphere.editorBg,
        foreground: BASE_TOKENS.anysphere.fgPrimary,
        selection: BASE_TOKENS.anysphere.selection,
        lineHighlight: BASE_TOKENS.anysphere.activeLine,
        selectionMatch: BASE_TOKENS.anysphere.bracketMatch,
        cursor: BASE_TOKENS.anysphere.cursor,
        indentGuide: BASE_TOKENS.anysphere.indentGuide,
    },
    gutter: {
        background: BASE_TOKENS.anysphere.editorBg,
        foreground: BASE_TOKENS.anysphere.fgMuted,
        foregroundActive: BASE_TOKENS.anysphere.fgSecondary,
        border: 'transparent',
    },
    syntax: {
        keyword: BASE_TOKENS.anysphere.keyword,
        constant: BASE_TOKENS.anysphere.constant,
        string: BASE_TOKENS.anysphere.string,
        number: BASE_TOKENS.anysphere.number,
        boolean: BASE_TOKENS.anysphere.boolean,
        null: BASE_TOKENS.anysphere.constant,
        comment: BASE_TOKENS.anysphere.comment,
        operator: BASE_TOKENS.anysphere.operator,
        punctuation: BASE_TOKENS.anysphere.punctuation,
        tag: BASE_TOKENS.anysphere.tag,
        attribute: BASE_TOKENS.anysphere.attribute,
        property: BASE_TOKENS.anysphere.property,
        function: BASE_TOKENS.anysphere.function,
        variable: BASE_TOKENS.anysphere.variable,
        type: BASE_TOKENS.anysphere.type,

        // Fallback
        selector: BASE_TOKENS.anysphere.tag,
        regex: BASE_TOKENS.anysphere.string,
        escape: BASE_TOKENS.anysphere.number,
    },

    // Diagnostics
    diagnostic: {
        error: BASE_TOKENS.anysphere.error,
        errorBackground: 'var(--input-validation-error-bg)',
        warning: BASE_TOKENS.anysphere.warning,
        warningBackground: 'var(--input-validation-warning-bg)',
        info: BASE_TOKENS.anysphere.info,
        infoBackground: 'var(--input-validation-info-bg)',
        hint: BASE_TOKENS.anysphere.fgMuted,
        hintBackground: 'transparent',
    },

    // UI Elements
    ui: {
        background: BASE_TOKENS.anysphere.sidebarBg,
        backgroundElevated: BASE_TOKENS.anysphere.panelBg,
        backgroundSubtle: BASE_TOKENS.anysphere.hover,
        foreground: BASE_TOKENS.anysphere.fgPrimary,
        foregroundMuted: BASE_TOKENS.anysphere.fgMuted,
        border: BASE_TOKENS.anysphere.border,
        borderSubtle: BASE_TOKENS.anysphere.border,
    },

    // Terminal
    terminal: {
        background: BASE_TOKENS.anysphere.panelBg,
        foreground: BASE_TOKENS.anysphere.fgPrimary,
        cursor: BASE_TOKENS.anysphere.cursor,
        selection: BASE_TOKENS.anysphere.selection,

        // ANSI Colors - Mapped to Palette or Vars if available
        // For now we map to standard semantic vars or keep high quality ref
        black: 'var(--black)',
        red: 'var(--red, #cd3131)',
        green: 'var(--green, #0dbc79)',
        yellow: 'var(--yellow, #e5e510)',
        blue: 'var(--blue, #2472c8)',
        magenta: 'var(--magenta, #bc3fbc)',
        cyan: 'var(--cyan, #11a8cd)',
        white: 'var(--white, #e5e5e5)',

        brightBlack: 'var(--black-soft, #666666)',
        brightRed: 'var(--red-light, #f14c4c)',
        brightGreen: 'var(--green-light, #23d18b)',
        brightYellow: 'var(--yellow-light, #f5f543)',
        brightBlue: 'var(--blue-light, #3b8eea)',
        brightMagenta: 'var(--magenta-light, #d670d6)',
        brightCyan: 'var(--cyan-light, #29b8db)',
        brightWhite: 'var(--white, #ffffff)',
    },
} as const

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT TOKENS
// ═══════════════════════════════════════════════════════════════════════════

export const COMPONENT_TOKENS = {
    // Title Bar
    titleBar: {
        background: BASE_TOKENS.anysphere.titleBarBg,
        foreground: BASE_TOKENS.anysphere.fgSecondary,
        border: BASE_TOKENS.anysphere.border,
        buttonHover: BASE_TOKENS.anysphere.hover,
        aiButton: '#3794ff',
        aiButtonHover: '#66b2ff',
    },

    // Sidebar / File Tree
    sidebar: {
        background: BASE_TOKENS.anysphere.sidebarBg,
        foreground: BASE_TOKENS.anysphere.fgSecondary,
        foregroundMuted: BASE_TOKENS.anysphere.fgMuted,
        hover: BASE_TOKENS.anysphere.hover,
        selected: BASE_TOKENS.anysphere.activeFileBg,
        selectedAccent: BASE_TOKENS.anysphere.activeFileText,
        border: BASE_TOKENS.anysphere.border,
    },

    // Tabs
    tabs: {
        background: BASE_TOKENS.anysphere.tabInactiveBg,
        backgroundActive: BASE_TOKENS.anysphere.tabActiveBg,
        foreground: BASE_TOKENS.anysphere.fgSecondary,
        foregroundActive: BASE_TOKENS.anysphere.activeFileText,
        border: BASE_TOKENS.anysphere.tabBorder,
        hover: BASE_TOKENS.anysphere.tabHoverBg,
        dirty: 'var(--diff-bright-delete, #CC3E44)',
    },

    // Panels
    panel: {
        background: BASE_TOKENS.anysphere.panelBg,
        backgroundElevated: BASE_TOKENS.anysphere.sidebarBg,
        foreground: BASE_TOKENS.anysphere.fgPrimary,
        border: BASE_TOKENS.anysphere.border,
    },

    // Inputs
    input: {
        background: 'var(--input-bg)',
        foreground: 'var(--input-fg)',
        border: 'var(--input-border)',
        borderFocus: 'var(--input-border-focus)',
        placeholder: 'var(--input-placeholder, rgba(255,255,255,0.4))',
    },

    // Buttons
    button: {
        primary: 'var(--button-primary)',
        primaryHover: 'var(--button-primary-hover)',
        primaryActive: 'var(--button-primary-hover)', // Fallback

        success: BASE_TOKENS.anysphere.success,
        successHover: 'var(--button-success-hover)',

        danger: BASE_TOKENS.anysphere.error,
        dangerHover: 'var(--button-danger-hover)',

        secondary: 'var(--button-secondary)',
        secondaryHover: 'var(--button-secondary-hover)',
    },

    // Scrollbar
    scrollbar: {
        background: 'var(--scrollbar-bg)',
        thumb: 'var(--scrollbar-thumb)',
        thumbHover: 'var(--scrollbar-thumb-hover)',
    },

    // Tooltips
    tooltip: {
        background: BASE_TOKENS.anysphere.sidebarBg,
        foreground: BASE_TOKENS.anysphere.fgPrimary,
        border: BASE_TOKENS.anysphere.border,
    },

    // Modals
    modal: {
        background: BASE_TOKENS.anysphere.sidebarBg,
        foreground: BASE_TOKENS.anysphere.fgPrimary,
        border: BASE_TOKENS.anysphere.border,
        overlay: 'rgba(0, 0, 0, 0.85)',
    },
} as const

// ═══════════════════════════════════════════════════════════════════════════
// TYPOGRAPHY SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

export const TYPOGRAPHY = {
    fontFamilyMono:
        "'JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
    fontFamilySans:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
    fontSize: {
        xs: '11px',
        sm: '12px',
        base: '13px',
        md: '14px',
        lg: '16px',
        xl: '18px',
    },
    fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
    },
    lineHeight: {
        tight: 1.4,
        normal: 1.5,
        relaxed: 1.6,
        loose: 1.8,
    },
    ligatures: true,
} as const

export const TRANSITIONS = {
    fast: '0.1s ease',
    normal: '0.15s ease',
    slow: '0.2s ease',
    easing: {
        standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    },
} as const

export const SPACING = {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
} as const

export const RADIUS = {
    none: '0',
    sm: '2px',
    md: '3px',
    lg: '5px',
    xl: '8px',
    full: '9999px',
} as const

export const CODEX_THEME = {
    base: BASE_TOKENS,
    semantic: SEMANTIC_TOKENS,
    component: COMPONENT_TOKENS,
    typography: TYPOGRAPHY,
    transitions: TRANSITIONS,
    spacing: SPACING,
    radius: RADIUS,
} as const

export type CodexTheme = typeof CODEX_THEME
