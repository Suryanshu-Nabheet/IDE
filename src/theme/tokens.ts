export const BASE_TOKENS = {
    // Dark Brown Background with ANYSPHERE DARK Font Colors
    anysphere: {
        // UI Backgrounds - Dark Brown
        editorBg: '#1e1e1e', // Editor background - warm dark brown
        sidebarBg: '#1e1e1e', // Sidebar background - warm dark brown
        panelBg: '#181818', // Panel background - ANYSPHERE DARK exact
        activityBarBg: '#1e1e1e', // Activity bar - warm dark brown
        titleBarBg: '#1e1e1e', // Title bar - warm dark brown
        elevatedSurfaceBg: '#1d1d1d', // Elevated surface - ANYSPHERE DARK exact

        // Tabs - Dark Brown Background with ANYSPHERE DARK Font Colors
        tabActiveBg: '#1e1e1e', // Active tab background - ANYSPHERE DARK exact
        tabInactiveBg: '#1e1e1e', // Inactive tabs - warm dark brown
        tabHoverBg: '#2a282a', // Tab hover - ANYSPHERE DARK exact
        tabBorder: '#383838', // Border / Divider - ANYSPHERE DARK exact

        // Text - Anysphere Dark
        fgPrimary: '#d6d6dd', // Primary text
        fgSecondary: '#d6d6dd', // Secondary text
        fgMuted: '#d6d6dd', // Muted text
        fgDisabled: '#535353', // Disabled text

        // Editor Elements - Anysphere Dark
        cursor: '#d6d6dd',
        selection: '#163761', // Element selected
        activeLine: '#212121', // Active line background
        lineHighlight: '#212121',
        indentGuide: '#383838',
        bracketMatch: '#163761', // Document highlight bracket

        // Syntax Highlighting - Anysphere Dark (Exact Match)
        keyword: '#83d6c5', // Keywords
        string: '#e394dc', // Strings
        stringEscape: '#CC7832', // String escapes
        stringRegex: '#DA2877', // Regex
        stringSpecial: '#CC7832', // Special strings
        number: '#d6d6dd', // Numbers
        boolean: '#fad075', // Booleans
        function: '#ebc88d', // Functions
        variable: '#aa9bf5', // Variables
        variableSpecial: '#E1DAE8', // Special variables
        type: '#87c3ff', // Types
        comment: '#474747', // Comments
        tag: '#fad075', // Tags
        attribute: '#aaa0fa', // Attributes
        constant: '#83d6c5', // Constants
        textLiteral: '#B5BD68', // Text literals
        text: '#fad075', // Text
        operator: '#d6d6dd', // Operators
        punctuation: '#d6d6dd', // Punctuation
        property: '#d6d6dd', // Properties

        // Accents & State - Anysphere Dark
        border: '#383838', // Borders
        hover: '#2a282a', // Element hover
        focus: '#d6d6dd00', // Focus border (transparent)
        error: '#f14c4c', // Error color
        success: '#15ac91', // Success color
        warning: '#ea7620', // Warning color
        info: '#228df2', // Info color
        activeFileBg: '#163761', // Element selected
        activeFileText: '#d6d6dd', // Active file text
        elementBackground: '#228df2', // Element background (accent)
    },
} as const

// ═══════════════════════════════════════════════════════════════════════════
// SEMANTIC TOKENS — Meaningful Abstractions
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
        constant: BASE_TOKENS.anysphere.number,
        string: BASE_TOKENS.anysphere.string,
        number: BASE_TOKENS.anysphere.number,
        boolean: BASE_TOKENS.anysphere.number,
        null: BASE_TOKENS.anysphere.number,
        comment: BASE_TOKENS.anysphere.comment,
        operator: BASE_TOKENS.anysphere.tag,
        punctuation: BASE_TOKENS.anysphere.fgSecondary,
        tag: BASE_TOKENS.anysphere.tag,
        attribute: BASE_TOKENS.anysphere.attribute,
        property: BASE_TOKENS.anysphere.variable,
        function: BASE_TOKENS.anysphere.function,
        variable: BASE_TOKENS.anysphere.variable,
        type: BASE_TOKENS.anysphere.type,

        // Fallback
        selector: BASE_TOKENS.anysphere.tag,
        regex: BASE_TOKENS.anysphere.keyword,
        escape: BASE_TOKENS.anysphere.number,
    },

    // Diagnostics
    diagnostic: {
        error: BASE_TOKENS.anysphere.error,
        errorBackground: 'rgba(255, 83, 112, 0.2)',
        warning: BASE_TOKENS.anysphere.warning,
        warningBackground: 'rgba(255, 203, 107, 0.2)',
        info: '#82AAFF',
        infoBackground: 'rgba(130, 170, 255, 0.2)',
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

    // Terminal - Cursor IDE Dark Brown
    terminal: {
        background: '#1e1e1e', // Terminal background - warm dark brown
        foreground: BASE_TOKENS.anysphere.fgPrimary,
        cursor: BASE_TOKENS.anysphere.cursor,
        selection: BASE_TOKENS.anysphere.selection,

        // ANSI Colors - Cursor IDE Dark Brown
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',

        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#ffffff',
    },
} as const

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT TOKENS — UI-Specific Mappings
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
        foreground: BASE_TOKENS.anysphere.fgSecondary, // #9AA4BF
        foregroundMuted: BASE_TOKENS.anysphere.fgMuted,
        hover: BASE_TOKENS.anysphere.hover,
        selected: BASE_TOKENS.anysphere.activeFileBg,
        selectedAccent: BASE_TOKENS.anysphere.activeFileText, // Or use a color bar?
        border: BASE_TOKENS.anysphere.border,
    },

    // Tabs
    tabs: {
        background: BASE_TOKENS.anysphere.tabInactiveBg, // Transparent
        backgroundActive: BASE_TOKENS.anysphere.tabActiveBg,
        foreground: BASE_TOKENS.anysphere.fgSecondary, // #9AA4BF
        foregroundActive: BASE_TOKENS.anysphere.activeFileText, // #FFFFFF
        border: BASE_TOKENS.anysphere.tabBorder,
        hover: BASE_TOKENS.anysphere.tabHoverBg,
        dirty: '#CC3E44', // Reddish for dirty state? Or standard text
    },

    // Panels
    panel: {
        background: BASE_TOKENS.anysphere.panelBg,
        backgroundElevated: BASE_TOKENS.anysphere.sidebarBg,
        foreground: BASE_TOKENS.anysphere.fgPrimary,
        border: BASE_TOKENS.anysphere.border,
    },

    // Inputs - Cursor IDE Dark Brown
    input: {
        background: '#252525', // Elevated surface
        foreground: BASE_TOKENS.anysphere.fgPrimary,
        border: BASE_TOKENS.anysphere.border,
        borderFocus: BASE_TOKENS.anysphere.focus, // Soft blue glow
        placeholder: BASE_TOKENS.anysphere.fgDisabled,
    },

    // Buttons - Cursor IDE Dark Brown
    button: {
        primary: '#569cd6', // Soft blue
        primaryHover: '#4a8bc2',
        primaryActive: '#3d7aae',

        success: BASE_TOKENS.anysphere.success,
        successHover: '#9ae09a',

        danger: BASE_TOKENS.anysphere.error,
        dangerHover: '#ff6b6b',

        secondary: '#3a3a3a', // Warm brown
        secondaryHover: '#4a4a4a',
    },

    // Scrollbar - Cursor IDE Dark Brown
    scrollbar: {
        background: 'transparent',
        thumb: 'rgba(138, 138, 138, 0.4)', // Muted brown
        thumbHover: 'rgba(138, 138, 138, 0.6)',
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
    // Monospace (Editor, Terminal)
    fontFamilyMono:
        "'JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', monospace",

    // Sans-serif (UI)
    fontFamilySans:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",

    // Font Sizes
    fontSize: {
        xs: '11px',
        sm: '12px',
        base: '13px',
        md: '14px',
        lg: '16px',
        xl: '18px',
    },

    // Font Weights
    fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
    },

    // Line Heights
    lineHeight: {
        tight: 1.4,
        normal: 1.5,
        relaxed: 1.6,
        loose: 1.8,
    },

    // Ligatures
    ligatures: true,
} as const

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATION & TRANSITIONS
// ═══════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════
// SPACING SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

export const SPACING = {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
} as const

// ═══════════════════════════════════════════════════════════════════════════
// BORDER RADIUS
// ═══════════════════════════════════════════════════════════════════════════

export const RADIUS = {
    none: '0',
    sm: '2px',
    md: '3px',
    lg: '5px',
    xl: '8px',
    full: '9999px',
} as const

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT UNIFIED THEME
// ═══════════════════════════════════════════════════════════════════════════

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
