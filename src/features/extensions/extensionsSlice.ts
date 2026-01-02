import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export interface Extension {
    id?: string
    extensionId?: string
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
            background: '#000000',
            foreground: '#CCCCCC',
            cursor: '#FFFFFF',
            selection: '#264F78',
            lineHighlight: '#FFFFFF0B',
            keyword: '#569CD6',
            string: '#CE9178',
            number: '#B5CEA8',
            function: '#DCDCAA',
            variable: '#9CDCFE',
            type: '#4EC9B0',
            comment: '#6A9955',
            tag: '#569CD6',
            attribute: '#9CDCFE',
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

export const searchExtensions = createAsyncThunk(
    'extensions/search',
    async (query: string) => {
        if (!query) return []
        try {
            const response = await fetch(
                `https://open-vsx.org/api/-/search?query=${query}&size=50`
            )
            const data = await response.json()
            return (data.extensions || []) as Extension[]
        } catch (error) {
            console.error('Extension search failed:', error)
            return []
        }
    }
)

export const installExtension = createAsyncThunk(
    'extensions/install',
    async (extension: Extension) => {
        // @ts-ignore
        await connector.installExtension(extension)
        return extension
    }
)

export const uninstallExtension = createAsyncThunk(
    'extensions/uninstall',
    async (extensionId: string) => {
        // @ts-ignore
        await connector.uninstallExtension(extensionId)
        return extensionId
    }
)

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
