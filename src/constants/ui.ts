/**
 * Consistent UI dimensions across the entire application
 * Use these constants to ensure uniform sizing and prevent layout shifts
 */

export const UI_CONSTANTS = {
    // Top-level bars
    ACTIVITY_BAR_HEIGHT: 42,
    TITLE_BAR_HEIGHT: 28,

    // Sidebar headers - NOW UNIFIED AT 42px FOR PREMIUM ALIGNMENT
    SIDEBAR_HEADER_HEIGHT: 42,

    // Sidebar widths
    SIDEBAR_WIDTH: 224, // w-56 in Tailwind

    // Icon sizes
    ICON_BUTTON_SIZE: 24, // 6 * 4px = 24px (w-6 h-6)
    EXTENSION_ICON_SIZE: 42, // Matches header height

    // Spacing
    HEADER_PADDING_X: 12,
    HEADER_PADDING_Y: 8,
    BUTTON_GAP: 2, // gap-0.5 in Tailwind
} as const

export type UIConstants = typeof UI_CONSTANTS
