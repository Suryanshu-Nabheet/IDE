export const BASE_TOKENS = {
    // Pure Black Backgrounds (Progressive Depth)
    // CodeX Vibrant Black Palette (User Requested)
    anysphere: {
        // UI Backgrounds
        editorBg: '#000000', // Pure Black
        sidebarBg: '#000000', // Pure Black
        panelBg: '#000000', // Pure Black
        activityBarBg: '#000000', // Pure Black
        titleBarBg: '#000000', // Pure Black

        // Tabs
        tabActiveBg: '#000000',
        tabInactiveBg: '#000000',
        tabHoverBg: '#111111',
        tabBorder: '#222222',

        // Text
        fgPrimary: '#FFFFFF', // White
        fgSecondary: '#B0B0B0',
        fgMuted: '#666666',
        fgDisabled: '#444444',

        // Editor Elements
        cursor: '#FFFFFF',
        selection: 'rgba(55, 148, 255, 0.2)', // Blue Selection
        activeLine: 'rgba(255, 255, 255, 0.05)',
        lineHighlight: 'rgba(255, 255, 255, 0.05)',
        indentGuide: '#222222',
        bracketMatch: 'rgba(198, 120, 221, 0.3)', // Purple

        // Syntax Highlighting - Vibrant Palette
        // "blue , purple , pink , light green , yellow , and white"
        keyword: '#C678DD', // Purple
        string: '#98C379', // Light Green
        number: '#E5C07B', // Yellow
        function: '#61AFEF', // Blue
        variable: '#FFFFFF', // White
        type: '#E5C07B', // Yellow
        comment: '#666666', // Muted Gray (Classic)
        tag: '#E06C75', // Pink (using Reddish-Pink for tags usually, or could be Pink #FF79C6)
        attribute: '#D19A66', // Orange-ish for variety or reuse Pink? User asked for Pink. Let's use Pink for something distinct.

        // Accents & State
        border: '#222222',
        hover: '#111111',
        focus: '#61AFEF',
        error: '#E06C75', // Pink/Red
        success: '#98C379', // Light Green
        warning: '#E5C07B', // Yellow
        activeFileBg: '#111111',
        activeFileText: '#61AFEF', // Blue Text for active file

        // Specific User Colors mapped to generic names for reuse
        userBlue: '#61AFEF',
        userPurple: '#C678DD',
        userPink: '#E06C75', // Using a nice soft pink/red
        userGreen: '#98C379',
        userYellow: '#E5C07B',
        userWhite: '#FFFFFF',
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
        operator: BASE_TOKENS.anysphere.fgSecondary,
        punctuation: BASE_TOKENS.anysphere.fgSecondary,
        tag: BASE_TOKENS.anysphere.userPink,
        attribute: BASE_TOKENS.anysphere.userYellow,
        property: BASE_TOKENS.anysphere.userWhite,
        function: BASE_TOKENS.anysphere.userBlue,
        variable: BASE_TOKENS.anysphere.userWhite,
        type: BASE_TOKENS.anysphere.userYellow,

        // Legacy fallbacks / specific mappings
        selector: BASE_TOKENS.anysphere.userPink,
        regex: BASE_TOKENS.anysphere.userPurple,
        escape: BASE_TOKENS.anysphere.userYellow,
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

    // Terminal
    terminal: {
        background: BASE_TOKENS.anysphere.panelBg,
        foreground: BASE_TOKENS.anysphere.fgPrimary,
        cursor: BASE_TOKENS.anysphere.cursor,
        selection: BASE_TOKENS.anysphere.selection,

        // ANSI (Mapping to Anysphere Palette approximations where feasible or standards)
        black: '#000000',
        red: BASE_TOKENS.anysphere.error,
        green: BASE_TOKENS.anysphere.success,
        yellow: BASE_TOKENS.anysphere.warning,
        blue: '#82AAFF',
        magenta: '#C792EA',
        cyan: '#89DDFF',
        white: BASE_TOKENS.anysphere.fgPrimary,

        brightBlack: BASE_TOKENS.anysphere.fgMuted,
        brightRed: '#FF5370',
        brightGreen: '#C3E88D',
        brightYellow: '#FFCB6B',
        brightBlue: '#82AAFF',
        brightMagenta: '#C792EA',
        brightCyan: '#89DDFF',
        brightWhite: '#FFFFFF',
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

    // Inputs
    input: {
        background: '#0B0E14',
        foreground: BASE_TOKENS.anysphere.fgPrimary,
        border: BASE_TOKENS.anysphere.border,
        borderFocus: BASE_TOKENS.anysphere.focus, // Blue glow
        placeholder: BASE_TOKENS.anysphere.fgDisabled,
    },

    // Buttons
    button: {
        primary: '#3794ff',
        primaryHover: '#006ab1',
        primaryActive: '#004f85',

        success: BASE_TOKENS.anysphere.success,
        successHover: '#a3d995',

        danger: BASE_TOKENS.anysphere.error,
        dangerHover: '#d93636',

        secondary: '#3c3c3c',
        secondaryHover: '#4d4d4d',
    },

    // Scrollbar
    scrollbar: {
        background: 'transparent',
        thumb: 'rgba(80, 80, 80, 0.5)',
        thumbHover: 'rgba(100, 100, 100, 0.8)',
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
