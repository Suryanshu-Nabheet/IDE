# Changelog

All notable changes to CodeX will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-22

### Added

-   **Complete Rebranding**: Transformed from Cursor to CodeX with comprehensive branding updates
    -   Updated window title, menu labels, and all user-facing text
    -   Renamed IPC handlers (loginCodeX, payCodeX, etc.)
    -   Updated error messages and feedback placeholders
-   **UI Polish**: Billion-dollar quality interface improvements
    -   Reduced titlebar height by 20% (35px → 28px)
    -   Reduced tab bar height by 33% (48px → 32px)
    -   Added smooth micro-animations and transitions
    -   Implemented professional hover effects throughout
    -   Enhanced file tree with compact spacing
    -   Polished scrollbar styling
-   **Clean Startup**: Removed tutor folder for empty workspace on first launch
-   **Code Quality**: Fixed all linting warnings and improved code organization
    -   Prefixed unused variables with underscore
    -   Consolidated duplicate imports
    -   Organized CSS with clear section comments
-   **Documentation**: Comprehensive project documentation
    -   Professional README with features and installation guide
    -   CHANGELOG for version tracking
    -   CONTRIBUTING guide for developers

### Changed

-   **Compact Design**: More screen space for code editing
    -   Titlebar: 35px → 28px
    -   Tab bar: 48px → 32px
    -   File tree line height: 2rem → 1.75rem
-   **Transition System**: Standardized animation timings
    -   `--transition-fast`: 0.15s ease
    -   `--transition-normal`: 0.2s ease
    -   `--transition-slow`: 0.3s ease
-   **Color Palette**: Enhanced Oxocarbon theme with deeper blacks and richer tones

### Fixed

-   LSP connection error messages during normal shutdown
-   Tab close button visibility and interaction
-   File tree hover states and animations
-   Menu dropdown styling and shadows
-   Scrollbar hover effects

### Removed

-   Tutor folder and tutorial files
-   Cursor branding references throughout codebase
-   Empty CSS rulesets
-   Unused variables and imports

## [Unreleased]

### Planned

-   LSP error suppression for cleaner console output
-   Copilot graceful error handling
-   Enhanced command palette with fuzzy search
-   Settings search functionality
-   Loading spinner improvements
-   Modal animation enhancements
-   Accessibility focus indicators

---

**Made with ❤️ by Suryanshu Nabheet**
