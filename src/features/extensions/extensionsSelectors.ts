import { FullState } from '../window/state'

export const getInstalledExtensions = (state: FullState) =>
    state.extensionsState.installed

export const getAvailableExtensions = (state: FullState) =>
    state.extensionsState.available

export const getSearchQuery = (state: FullState) =>
    state.extensionsState.searchQuery

export const getIsSearching = (state: FullState) =>
    state.extensionsState.isSearching

export const getActiveTheme = (state: FullState) =>
    state.extensionsState.activeTheme

export const getAvailableThemes = (state: FullState) =>
    state.extensionsState.availableThemes

export const getActiveThemeData = (state: FullState) => {
    const themeName = state.extensionsState.activeTheme
    return state.extensionsState.availableThemes[themeName]
}

export const isExtensionInstalled =
    (extensionId: string) => (state: FullState) =>
        !!state.extensionsState.installed[extensionId]
