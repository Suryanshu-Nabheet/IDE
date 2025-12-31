export const BASE_TOKENS = {
    // Pure Black Backgrounds (Progressive Depth)
    black: '#000000', // Absolute zero — terminal, deepest panels
    blackSoft: '#0a0a0a', // Editor background — slightly lifted
    blackElevated: '#121212', // Elevated surfaces — modals, popups
    blackSubtle: '#1a1a1a', // Hover states, subtle elevation

    // Grays (Semantic Hierarchy)
    gray900: '#1e1e1e', // Active line, selections
    gray800: '#262626', // Borders, dividers
    gray700: '#3a3a3a', // Disabled states
    gray600: '#525252', // Muted text, line numbers
    gray500: '#6e6e6e', // Secondary text
    gray400: '#8a8a8a', // Tertiary text
    gray300: '#a6a6a6', // Placeholder text
    gray200: '#c2c2c2', // Primary text (muted)
    gray100: '#dedede', // Primary text (standard)

    // Whites (Hierarchy)
    white: '#ffffff', // Maximum contrast — keywords, focus
    whiteSoft: '#f5f5f5', // Bright text

    // Syntax Colors (Anysphere-Inspired, Scientifically Tuned)
    purple: '#c586c0', // Keywords (if, const, return)
    purpleBright: '#d19ad8', // Bright variant

    blue: '#569cd6', // Types, tags, primitives
    blueBright: '#75beff', // Info, links, bright variant
    blueLight: '#9cdcfe', // Properties, variables, attributes

    yellow: '#dcdcaa', // Functions, methods
    yellowBright: '#f0e6b8', // Bright variant

    green: '#6a9955', // Comments (italic)
    greenBright: '#89d185', // Success, strings (alternate)
    greenNumber: '#b5cea8', // Numbers, constants

    orange: '#ce9178', // Strings, template literals
    orangeBright: '#d7a583', // Bright variant

    cyan: '#4ec9b0', // Classes, interfaces, namespaces
    cyanBright: '#5dd4bb', // Bright variant

    gold: '#d7ba7d', // CSS selectors, special identifiers

    // Semantic Colors (Diagnostics, States)
    red: '#f48771', // Errors, delete
    redBright: '#ff6b6b', // Critical errors

    amber: '#cca700', // Warnings
    amberBright: '#e6b800', // Critical warnings

    // Accent (Single Primary)
    accent: '#569cd6', // Primary accent — links, focus rings
    accentHover: '#75beff', // Hover state
    accentActive: '#4a8bc2', // Active/pressed state
} as const

// ═══════════════════════════════════════════════════════════════════════════
// SEMANTIC TOKENS — Meaningful Abstractions
// ═══════════════════════════════════════════════════════════════════════════

export const SEMANTIC_TOKENS = {
    // Editor Core
    editor: {
        background: BASE_TOKENS.blackSoft,
        foreground: BASE_TOKENS.gray100,
        lineHighlight: BASE_TOKENS.gray900,
        selection: '#264f78', // Anysphere selection
        selectionMatch: 'rgba(156, 220, 254, 0.25)',
        cursor: '#aeafad',
        cursorAccent: BASE_TOKENS.blackSoft,
    },

    // Gutter (Line Numbers)
    gutter: {
        background: BASE_TOKENS.blackSoft,
        foreground: BASE_TOKENS.gray600,
        foregroundActive: BASE_TOKENS.gray100,
        border: 'transparent',
    },

    // Syntax Highlighting
    syntax: {
        keyword: BASE_TOKENS.purple,
        type: BASE_TOKENS.cyan,
        class: BASE_TOKENS.cyan,
        interface: BASE_TOKENS.cyan,
        function: BASE_TOKENS.yellow,
        method: BASE_TOKENS.yellow,
        variable: BASE_TOKENS.blueLight,
        property: BASE_TOKENS.blueLight,
        parameter: BASE_TOKENS.blueLight,
        constant: BASE_TOKENS.blueLight,
        string: BASE_TOKENS.orange,
        number: BASE_TOKENS.greenNumber,
        boolean: BASE_TOKENS.blue,
        null: BASE_TOKENS.blue,
        comment: BASE_TOKENS.green,
        operator: BASE_TOKENS.gray100,
        punctuation: BASE_TOKENS.gray100,
        tag: BASE_TOKENS.blue,
        attribute: BASE_TOKENS.blueLight,
        selector: BASE_TOKENS.gold,
        regex: BASE_TOKENS.orange,
        escape: BASE_TOKENS.yellowBright,
    },

    // Diagnostics
    diagnostic: {
        error: BASE_TOKENS.red,
        errorBackground: 'rgba(244, 135, 113, 0.1)',
        warning: BASE_TOKENS.amber,
        warningBackground: 'rgba(204, 167, 0, 0.1)',
        info: BASE_TOKENS.blueBright,
        infoBackground: 'rgba(117, 190, 255, 0.1)',
        hint: BASE_TOKENS.gray400,
        hintBackground: 'rgba(138, 138, 138, 0.05)',
    },

    // UI Elements
    ui: {
        background: BASE_TOKENS.black,
        backgroundElevated: BASE_TOKENS.blackElevated,
        backgroundSubtle: BASE_TOKENS.blackSubtle,
        foreground: BASE_TOKENS.gray100,
        foregroundMuted: BASE_TOKENS.gray400,
        border: BASE_TOKENS.gray800,
        borderSubtle: BASE_TOKENS.gray900,
    },

    // Terminal
    terminal: {
        background: BASE_TOKENS.black, // True black for terminal
        foreground: BASE_TOKENS.gray100,
        cursor: BASE_TOKENS.accent,
        selection: '#264f78',

        // ANSI Colors (Semantically Justified)
        black: BASE_TOKENS.black,
        red: BASE_TOKENS.red, // Errors, failures
        green: BASE_TOKENS.greenBright, // Success, pass
        yellow: BASE_TOKENS.yellow, // Warnings, modified
        blue: BASE_TOKENS.blue, // Info, directories
        magenta: BASE_TOKENS.purple, // Special, archives
        cyan: BASE_TOKENS.blueLight, // Links, executables
        white: BASE_TOKENS.gray100,

        // Bright Variants
        brightBlack: BASE_TOKENS.gray600,
        brightRed: BASE_TOKENS.redBright,
        brightGreen: BASE_TOKENS.greenBright,
        brightYellow: BASE_TOKENS.yellowBright,
        brightBlue: BASE_TOKENS.blueBright,
        brightMagenta: BASE_TOKENS.purpleBright,
        brightCyan: BASE_TOKENS.blueLight,
        brightWhite: BASE_TOKENS.white,
    },
} as const

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT TOKENS — UI-Specific Mappings
// ═══════════════════════════════════════════════════════════════════════════

export const COMPONENT_TOKENS = {
    // Title Bar
    titleBar: {
        background: BASE_TOKENS.black,
        foreground: BASE_TOKENS.gray400,
        border: BASE_TOKENS.gray800,
        buttonHover: BASE_TOKENS.blackSubtle,
        aiButton: BASE_TOKENS.purple,
        aiButtonHover: BASE_TOKENS.purpleBright,
    },

    // Sidebar / File Tree
    sidebar: {
        background: BASE_TOKENS.black,
        foreground: BASE_TOKENS.gray100,
        foregroundMuted: BASE_TOKENS.gray400,
        hover: BASE_TOKENS.blackSubtle,
        selected: BASE_TOKENS.gray900,
        selectedAccent: BASE_TOKENS.accent,
        border: BASE_TOKENS.gray800,
    },

    // Tabs
    tabs: {
        background: BASE_TOKENS.black,
        backgroundActive: BASE_TOKENS.blackSoft,
        foreground: BASE_TOKENS.gray400,
        foregroundActive: BASE_TOKENS.gray100,
        border: BASE_TOKENS.gray800,
        hover: BASE_TOKENS.blackSubtle,
        dirty: BASE_TOKENS.accent,
    },

    // Panels
    panel: {
        background: BASE_TOKENS.blackSoft,
        backgroundElevated: BASE_TOKENS.blackElevated,
        foreground: BASE_TOKENS.gray100,
        border: BASE_TOKENS.gray800,
    },

    // Inputs
    input: {
        background: BASE_TOKENS.gray900,
        foreground: BASE_TOKENS.gray100,
        border: BASE_TOKENS.gray800,
        borderFocus: BASE_TOKENS.accent,
        placeholder: BASE_TOKENS.gray400,
    },

    // Buttons
    button: {
        primary: BASE_TOKENS.accent,
        primaryHover: BASE_TOKENS.accentHover,
        primaryActive: BASE_TOKENS.accentActive,

        success: BASE_TOKENS.greenBright,
        successHover: '#9ae09a',

        danger: BASE_TOKENS.red,
        dangerHover: BASE_TOKENS.redBright,

        secondary: BASE_TOKENS.blackSubtle,
        secondaryHover: BASE_TOKENS.gray900,
    },

    // Scrollbar
    scrollbar: {
        background: 'transparent',
        thumb: BASE_TOKENS.gray600,
        thumbHover: BASE_TOKENS.gray500,
    },

    // Tooltips
    tooltip: {
        background: BASE_TOKENS.blackElevated,
        foreground: BASE_TOKENS.gray100,
        border: BASE_TOKENS.gray800,
    },

    // Modals
    modal: {
        background: BASE_TOKENS.blackElevated,
        foreground: BASE_TOKENS.gray100,
        border: BASE_TOKENS.gray800,
        overlay: 'rgba(0, 0, 0, 0.8)',
    },
} as const

// ═══════════════════════════════════════════════════════════════════════════
// TYPOGRAPHY SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

export const TYPOGRAPHY = {
    // Monospace (Editor, Terminal)
    fontFamilyMono:
        "'JetBrains Mono', 'Fira Code', 'SF Mono', 'Cascadia Code', 'Consolas', 'Monaco', monospace",

    // Sans-serif (UI)
    fontFamilySans:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",

    // Font Sizes
    fontSize: {
        xs: '11px',
        sm: '12px',
        base: '14px',
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
    md: '4px',
    lg: '6px',
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
