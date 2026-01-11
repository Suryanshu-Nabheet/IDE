import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as extensionsAPI from './extensionsAPI'

export interface Extension {
    id?: string
    extensionId?: string
    path?: string
    namespace?: string
    name?: string
    displayName?: string
    description?: string
    version?: string
    publisher?: string
    publishedDate?: string
    lastUpdated?: string
    icon?: string
    downloads?: number
    downloadCount?: number
    rating?: number
    averageRating?: number
    reviewCount?: number
    categories?: string[]
    tags?: string[]
    files?: {
        download?: string
        manifest?: string
        icon?: string
        readme?: string
        license?: string
        changelog?: string
    }
    contributes?: {
        themes?: Array<{
            id?: string
            label?: string
            path: string
            uiTheme?: string
        }>
        iconThemes?: Array<{
            id?: string
            label?: string
            path: string
        }>
        commands?: Array<{
            command: string
            title: string
            category?: string
        }>
        [key: string]: any
    }
    isTheme?: boolean
    themeData?: ThemeData
}

export interface ThemeData {
    type: 'dark' | 'light'
    colors: {
        background: string
        foreground: string
        cursor: string
        selection: string
        lineHighlight: string
        // Syntax colors
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
}

export interface ExtensionsState {
    installed: { [key: string]: Extension }
    available: Extension[]
    searchQuery: string
    isSearching: boolean
    activeTheme: string
    availableThemes: { [key: string]: ThemeData }
}

const defaultThemes: { [key: string]: ThemeData } = {
    'codex-dark': {
        type: 'dark',
        colors: {
            background: '#000000', // Pure Black - Premium Dark
            foreground: '#e5e5e5', // Bright text for contrast
            cursor: '#3b82f6', // Blue accent cursor
            selection: '#1e3a5f', // Darker blue selection
            lineHighlight: '#0a0a0a', // Subtle line highlight
            keyword: '#3b82f6', // Blue keywords
            string: '#ce9178', // Warm string color
            number: '#b5cea8', // Green numbers
            function: '#dcdcaa', // Yellow functions
            variable: '#9cdcfe', // Light blue variables
            type: '#4ec9b0', // Teal types
            comment: '#6a9955', // Green comments
            tag: '#569cd6', // Blue tags
            attribute: '#92c5f7', // Light blue attributes
        },
    },
    monokai: {
        type: 'dark',
        colors: {
            background: '#272822',
            foreground: '#F8F8F2',
            cursor: '#F8F8F0',
            selection: '#49483E',
            lineHighlight: '#3E3D32',
            keyword: '#F92672',
            string: '#E6DB74',
            number: '#AE81FF',
            function: '#A6E22E',
            variable: '#F8F8F2',
            type: '#66D9EF',
            comment: '#75715E',
            tag: '#F92672',
            attribute: '#A6E22E',
        },
    },
    dracula: {
        type: 'dark',
        colors: {
            background: '#282A36',
            foreground: '#F8F8F2',
            cursor: '#F8F8F0',
            selection: '#44475A',
            lineHighlight: '#44475A',
            keyword: '#FF79C6',
            string: '#F1FA8C',
            number: '#BD93F9',
            function: '#50FA7B',
            variable: '#F8F8F2',
            type: '#8BE9FD',
            comment: '#6272A4',
            tag: '#FF79C6',
            attribute: '#50FA7B',
        },
    },
    'github-dark': {
        type: 'dark',
        colors: {
            background: '#0d1117',
            foreground: '#c9d1d9',
            cursor: '#c9d1d9',
            selection: '#264F78',
            lineHighlight: '#161b22',
            keyword: '#FF7B72',
            string: '#A5D6FF',
            number: '#79C0FF',
            function: '#D2A8FF',
            variable: '#FFA657',
            type: '#7EE787',
            comment: '#8B949E',
            tag: '#7EE787',
            attribute: '#79C0FF',
        },
    },
    'solarized-dark': {
        type: 'dark',
        colors: {
            background: '#002B36',
            foreground: '#839496',
            cursor: '#839496',
            selection: '#073642',
            lineHighlight: '#073642',
            keyword: '#859900',
            string: '#2AA198',
            number: '#D33682',
            function: '#268BD2',
            variable: '#839496',
            type: '#B58900',
            comment: '#586E75',
            tag: '#268BD2',
            attribute: '#93A1A1',
        },
    },
    nord: {
        type: 'dark',
        colors: {
            background: '#2E3440',
            foreground: '#D8DEE9',
            cursor: '#D8DEE9',
            selection: '#434C5E',
            lineHighlight: '#3B4252',
            keyword: '#81A1C1',
            string: '#A3BE8C',
            number: '#B48EAD',
            function: '#88C0D0',
            variable: '#D8DEE9',
            type: '#8FBCBB',
            comment: '#616E88',
            tag: '#81A1C1',
            attribute: '#8FBCBB',
        },
    },
    'one-dark': {
        type: 'dark',
        colors: {
            background: '#282C34',
            foreground: '#ABB2BF',
            cursor: '#528BFF',
            selection: '#3E4451',
            lineHighlight: '#2C323C',
            keyword: '#C678DD',
            string: '#98C379',
            number: '#D19A66',
            function: '#61AFEF',
            variable: '#E06C75',
            type: '#E5C07B',
            comment: '#5C6370',
            tag: '#E06C75',
            attribute: '#D19A66',
        },
    },
}

export const initialExtensionsState: ExtensionsState = {
    installed: {},
    available: [],
    searchQuery: '',
    isSearching: false,
    activeTheme: 'codex-dark',
    availableThemes: defaultThemes,
}

// Fetch popular/featured extensions
export const fetchPopularExtensions = createAsyncThunk(
    'extensions/fetchPopular',
    async () => {
        return await extensionsAPI.getPopularExtensions(50)
    }
)

export const searchExtensions = createAsyncThunk(
    'extensions/search',
    async (query: string) => {
        if (!query) return []
        return await extensionsAPI.searchExtensions({
            query,
            size: 50,
            sortBy: 'relevance',
        })
    }
)

export const installExtension = createAsyncThunk(
    'extensions/install',
    async (extension: Extension, { dispatch, rejectWithValue }) => {
        try {
            console.log(
                'Installing extension:',
                extension.displayName || extension.name
            )
            // @ts-ignore
            await connector.installExtension(extension)
            console.log(
                'Extension installed successfully:',
                extension.displayName || extension.name
            )

            // Reload installed extensions to pick up the new one
            dispatch(initializeExtensions())

            return extension
        } catch (error: any) {
            console.error('Failed to install extension:', error)
            return rejectWithValue(
                error.message || 'Failed to install extension'
            )
        }
    }
)

export const uninstallExtension = createAsyncThunk(
    'extensions/uninstall',
    async (extensionId: string, { dispatch, rejectWithValue }) => {
        try {
            console.log('Uninstalling extension:', extensionId)
            // @ts-ignore
            await connector.uninstallExtension(extensionId)
            console.log('Extension uninstalled successfully:', extensionId)

            // Reload installed extensions
            dispatch(initializeExtensions())

            return extensionId
        } catch (error: any) {
            console.error('Failed to uninstall extension:', error)
            return rejectWithValue(
                error.message || 'Failed to uninstall extension'
            )
        }
    }
)

export const initializeExtensions = createAsyncThunk(
    'extensions/initialize',
    async (_, { dispatch }) => {
        console.log('🔄 Initializing extensions...')
        // @ts-ignore
        const extensions: Extension[] = await connector.getInstalledExtensions()
        console.log(
            `📦 Found ${extensions.length} installed extensions:`,
            extensions.map((e) => e.name)
        )
        dispatch(loadInstalledExtensions(extensions))

        const delimiter = (window as any).connector?.PLATFORM_DELIMITER || '/'

        // Import activation manager
        const { extensionActivationManager } = await import(
            './extensionActivation'
        )

        // Check for themes and add them
        let themesFound = 0
        let extensionsActivated = 0

        for (const ext of extensions) {
            // Activate the extension
            try {
                const activated =
                    await extensionActivationManager.activateExtension(ext)
                if (activated) {
                    extensionsActivated++
                }
            } catch (error) {
                console.error(
                    `Failed to activate extension ${ext.name}:`,
                    error
                )
            }

            // Load themes
            // @ts-ignore
            if (ext.contributes && ext.contributes.themes && ext.path) {
                console.log(
                    `🎨 Extension "${ext.name}" has themes:`,
                    ext.contributes.themes
                )
                // @ts-ignore
                for (const theme of ext.contributes.themes) {
                    try {
                        const themePath = [ext.path, theme.path].join(delimiter)
                        console.log(`  Loading theme from: ${themePath}`)
                        // @ts-ignore
                        const content = await connector.getFile(themePath)
                        if (content) {
                            const themeJson = JSON.parse(content)
                            const themeData = mapThemeToThemeData(themeJson)
                            const themeName =
                                theme.id ||
                                theme.label ||
                                ext.name ||
                                'unknown-theme'
                            console.log(
                                `  ✅ Successfully loaded theme: ${themeName}`
                            )
                            dispatch(
                                addCustomTheme({
                                    name: themeName,
                                    theme: themeData,
                                })
                            )
                            themesFound++
                        } else {
                            console.warn(
                                `  ⚠️ No content found for theme at ${themePath}`
                            )
                        }
                    } catch (e) {
                        console.error(
                            `  ❌ Failed to load theme from ${ext.name}:`,
                            e
                        )
                    }
                }
            }

            // Detect icon themes
            // @ts-ignore
            if (ext.contributes && ext.contributes.iconThemes) {
                console.log(
                    `🎨 Extension "${ext.name}" has icon themes:`,
                    ext.contributes.iconThemes
                )
            }
        }
        console.log(`✨ Loaded ${themesFound} themes from extensions`)
        console.log(
            `🔌 Activated ${extensionsActivated}/${extensions.length} extensions`
        )

        return extensions
    }
)

function mapThemeToThemeData(theme: any): ThemeData {
    const colors = theme.colors || {}

    return {
        type: theme.type === 'light' ? 'light' : 'dark',
        colors: {
            background: colors['editor.background'] || '#181818',
            foreground: colors['editor.foreground'] || '#d6d6dd',
            cursor: colors['editorCursor.foreground'] || '#d6d6dd',
            selection: colors['editor.selectionBackground'] || '#163761',
            lineHighlight:
                colors['editor.lineHighlightBackground'] || '#212121',
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
    }
}

export const extensionsSlice = createSlice({
    name: 'extensions',
    initialState: initialExtensionsState,
    reducers: {
        setSearchQuery(state, action: PayloadAction<string>) {
            state.searchQuery = action.payload
        },
        setActiveTheme(state, action: PayloadAction<string>) {
            state.activeTheme = action.payload
        },
        addCustomTheme(
            state,
            action: PayloadAction<{ name: string; theme: ThemeData }>
        ) {
            state.availableThemes[action.payload.name] = action.payload.theme
        },
        loadInstalledExtensions(state, action: PayloadAction<Extension[]>) {
            state.installed = {}
            action.payload.forEach((ext) => {
                const id = ext.extensionId || ext.id
                if (id) {
                    state.installed[id] = ext
                }
            })
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPopularExtensions.pending, (state) => {
                state.isSearching = true
            })
            .addCase(fetchPopularExtensions.fulfilled, (state, action) => {
                state.available = action.payload
                state.isSearching = false
            })
            .addCase(fetchPopularExtensions.rejected, (state) => {
                state.isSearching = false
            })
            .addCase(searchExtensions.pending, (state) => {
                state.isSearching = true
            })
            .addCase(searchExtensions.fulfilled, (state, action) => {
                state.available = action.payload
                state.isSearching = false
            })
            .addCase(searchExtensions.rejected, (state) => {
                state.isSearching = false
            })
            .addCase(installExtension.fulfilled, (state, action) => {
                const id = action.payload.extensionId || action.payload.id
                if (id) {
                    state.installed[id] = action.payload
                }
            })
            .addCase(uninstallExtension.fulfilled, (state, action) => {
                if (action.payload) {
                    delete state.installed[action.payload]
                }
            })
    },
})

export const {
    setSearchQuery,
    setActiveTheme,
    addCustomTheme,
    loadInstalledExtensions,
} = extensionsSlice.actions

export default extensionsSlice.reducer
