export const BASE_TOKENS = {
    // Pure Black Backgrounds (Progressive Depth)
    black: '#000000', // Absolute zero — terminal, deepest panels
    blackSoft: '#0a0a0a', // Editor background — slightly lifted
    blackElevated: '#121212', // Elevated surfaces — modals, popups
    blackSubtle: '#1a1a1a', // Hover states, subtle elevation

    // Grays (Semantic Hierarchy)
    gray900: '#1e1e1e', // Active line, selections
    gray800: '#2b2b2b', // Borders, dividers
    gray700: '#3a3a3a', // Disabled states
    gray600: '#858585', // Muted text, line numbers
    gray500: '#a6a6a6', // Secondary text
    gray400: '#c5c5c5', // Tertiary text
    gray300: '#d4d4d4', // Placeholder text
    gray200: '#e5e5e5', // Primary text (muted)
    gray100: '#ffffff', // Primary text (standard)

    // Anysphere Dark Palette (High-Fidelity Match)
    anysphere: {
        bg: '#000000',
        fg: '#d4d4d4',

        selection: '#264f78',
        lineHighlight: '#2b2b2b66',

        // Syntax
        keyword: '#569cd6', // Blue
        control: '#569cd6', // Blue
        type: '#4ec9b0', // Teal
        property: '#9cdcfe', // Light Blue
        function: '#dcdcaa', // Yellow
        variable: '#d4d4d4', // Off-white
        number: '#b5cea8', // Pale Green
        string: '#ce9178', // Peach/Orange
        comment: '#6a9955', // Forest Green
        operator: '#d4d4d4', // Off-white
        tag: '#569cd6', // Blue
        constant: '#4fc1ff', // Cyan

        // Accents
        blue: '#3794ff',
        focusBorder: '#4fc1ff',

        // Diagnostics
        error: '#f14c4c',
        warning: '#cca700',
        info: '#3794ff',

        // Terminal
        ansiBlack: '#000000',
        ansiRed: '#cd3131',
        ansiGreen: '#0dbc79',
        ansiYellow: '#e5b95c',
        ansiBlue: '#2472c8',
        ansiMagenta: '#bc3fbc',
        ansiCyan: '#11a8cd',
        ansiWhite: '#e5e5e5',

        ansiBrightBlack: '#666666',
        ansiBrightRed: '#f14c4c',
        ansiBrightGreen: '#23d18b',
        ansiBrightYellow: '#f5f543',
        ansiBrightBlue: '#3b8eea',
        ansiBrightMagenta: '#d670d6',
        ansiBrightCyan: '#29b8db',
        ansiBrightWhite: '#ffffff',
    },
} as const

// ═══════════════════════════════════════════════════════════════════════════
// SEMANTIC TOKENS — Meaningful Abstractions
// ═══════════════════════════════════════════════════════════════════════════

export const SEMANTIC_TOKENS = {
    // Editor Core
    editor: {
        background: BASE_TOKENS.anysphere.bg,
        foreground: BASE_TOKENS.anysphere.fg,
        lineHighlight: BASE_TOKENS.anysphere.lineHighlight,
        selection: BASE_TOKENS.anysphere.selection,
        selectionMatch: '#29435c', // Subtle match
        cursor: '#aeafad',
        cursorAccent: '#000000',
    },

    // Gutter (Line Numbers)
    gutter: {
        background: BASE_TOKENS.anysphere.bg,
        foreground: '#858585',
        foregroundActive: '#c6c6c6',
        border: 'transparent',
    },

    // Syntax Highlighting
    syntax: {
        keyword: BASE_TOKENS.anysphere.keyword,
        type: BASE_TOKENS.anysphere.type,
        class: BASE_TOKENS.anysphere.type,
        interface: BASE_TOKENS.anysphere.type,
        function: BASE_TOKENS.anysphere.function,
        method: BASE_TOKENS.anysphere.function,
        variable: BASE_TOKENS.anysphere.variable,
        property: BASE_TOKENS.anysphere.property,
        parameter: '#9cdcfe',
        constant: BASE_TOKENS.anysphere.constant,
        string: BASE_TOKENS.anysphere.string,
        number: BASE_TOKENS.anysphere.number,
        boolean: '#569cd6',
        null: '#569cd6',
        comment: BASE_TOKENS.anysphere.comment,
        operator: BASE_TOKENS.anysphere.operator,
        punctuation: BASE_TOKENS.anysphere.operator,
        tag: BASE_TOKENS.anysphere.tag,
        attribute: '#9cdcfe',
        selector: '#569cd6',
        regex: '#d16969',
        escape: '#d7ba7d',
    },

    // Diagnostics
    diagnostic: {
        error: BASE_TOKENS.anysphere.error,
        errorBackground: 'rgba(244, 135, 113, 0.2)',
        warning: BASE_TOKENS.anysphere.warning,
        warningBackground: 'rgba(204, 167, 0, 0.2)',
        info: BASE_TOKENS.anysphere.info,
        infoBackground: 'rgba(117, 190, 255, 0.2)',
        hint: '#6c6c6c',
        hintBackground: 'transparent',
    },

    // UI Elements
    ui: {
        background: BASE_TOKENS.black,
        backgroundElevated: BASE_TOKENS.blackElevated,
        backgroundSubtle: BASE_TOKENS.blackSubtle,
        foreground: BASE_TOKENS.anysphere.fg,
        foregroundMuted: '#969696',
        border: '#2b2b2b',
        borderSubtle: '#1e1e1e',
    },

    // Terminal
    terminal: {
        background: BASE_TOKENS.black,
        foreground: '#cccccc',
        cursor: '#ffffff',
        selection: '#264f78',

        // ANSI
        black: BASE_TOKENS.anysphere.ansiBlack,
        red: BASE_TOKENS.anysphere.ansiRed,
        green: BASE_TOKENS.anysphere.ansiGreen,
        yellow: BASE_TOKENS.anysphere.ansiYellow,
        blue: BASE_TOKENS.anysphere.ansiBlue,
        magenta: BASE_TOKENS.anysphere.ansiMagenta,
        cyan: BASE_TOKENS.anysphere.ansiCyan,
        white: BASE_TOKENS.anysphere.ansiWhite,

        brightBlack: BASE_TOKENS.anysphere.ansiBrightBlack,
        brightRed: BASE_TOKENS.anysphere.ansiBrightRed,
        brightGreen: BASE_TOKENS.anysphere.ansiBrightGreen,
        brightYellow: BASE_TOKENS.anysphere.ansiBrightYellow,
        brightBlue: BASE_TOKENS.anysphere.ansiBrightBlue,
        brightMagenta: BASE_TOKENS.anysphere.ansiBrightMagenta,
        brightCyan: BASE_TOKENS.anysphere.ansiBrightCyan,
        brightWhite: BASE_TOKENS.anysphere.ansiBrightWhite,
    },
} as const

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT TOKENS — UI-Specific Mappings
// ═══════════════════════════════════════════════════════════════════════════

export const COMPONENT_TOKENS = {
    // Title Bar
    titleBar: {
        background: BASE_TOKENS.black,
        foreground: '#cccccc',
        border: '#2b2b2b',
        buttonHover: '#333333',
        aiButton: BASE_TOKENS.anysphere.blue,
        aiButtonHover: '#66b2ff',
    },

    // Sidebar / File Tree
    sidebar: {
        background: BASE_TOKENS.black, // Pure Black
        foreground: '#cccccc',
        foregroundMuted: '#969696',
        hover: '#2a2d2e',
        selected: '#094771', // Standard Box selection
        selectedAccent: BASE_TOKENS.anysphere.focusBorder,
        border: '#252526',
    },

    // Tabs
    tabs: {
        background: BASE_TOKENS.black,
        backgroundActive: BASE_TOKENS.black,
        foreground: '#969696',
        foregroundActive: '#ffffff',
        border: '#252526',
        hover: '#2d2d2d',
        dirty: '#ffffff',
    },

    // Panels
    panel: {
        background: BASE_TOKENS.black,
        backgroundElevated: '#1e1e1e',
        foreground: '#cccccc',
        border: '#2b2b2b',
    },

    // Inputs
    input: {
        background: '#3c3c3c',
        foreground: '#cccccc',
        border: '#3c3c3c',
        borderFocus: BASE_TOKENS.anysphere.focusBorder,
        placeholder: '#a6a6a6',
    },

    // Buttons
    button: {
        primary: BASE_TOKENS.anysphere.blue,
        primaryHover: '#006ab1',
        primaryActive: '#004f85',

        success: '#89d185',
        successHover: '#6a9955',

        danger: '#f14c4c',
        dangerHover: '#c13939',

        secondary: '#3c3c3c',
        secondaryHover: '#4d4d4d',
    },

    // Scrollbar
    scrollbar: {
        background: 'transparent',
        thumb: '#79797966',
        thumbHover: '#646464bb',
    },

    // Tooltips
    tooltip: {
        background: '#252526',
        foreground: '#cccccc',
        border: '#454545',
    },

    // Modals
    modal: {
        background: '#252526',
        foreground: '#cccccc',
        border: '#454545',
        overlay: 'rgba(0, 0, 0, 0.65)',
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
