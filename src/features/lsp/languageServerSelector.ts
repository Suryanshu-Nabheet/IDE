import { createSelector } from 'reselect'
import type { LanguageServerState } from '../window/state'

export const getLanguages = createSelector(
    (state: { languageServerState: LanguageServerState }) =>
        state.languageServerState,
    (languageServerState) => Object.keys(languageServerState.languageServers)
)

export const languageServerStatus = (languageName: string) =>
    createSelector(
        (state: { languageServerState: LanguageServerState }) =>
            state.languageServerState,
        (languageServerState) =>
            languageServerState.languageServers[languageName]
    )
