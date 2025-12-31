import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { FullState, ToolState } from '../window/state'
import { log } from '../../utils/logger'

const initialState: ToolState = {
    openLeftTab: 'filetree',
    leftTabActive: false,
    fileSearchTriggered: false,
    commandPaletteTriggered: false,
    aiCommandPaletteTriggered: false,
    leftSideExpanded: true,
    authLogin: {},
    welcomeDismissed: false,
}
const untriggerAll = (state: ToolState) => {
    state.fileSearchTriggered = false
    state.commandPaletteTriggered = false
    // leftSideExpanded: true
    state.aiCommandPaletteTriggered = false
}

export const refreshLoginDetails = createAsyncThunk(
    'tool/refreshLoginDetails',
    async (arg: null, { dispatch }) => {
        const newUserCreds = await connector.getUserCreds()
        dispatch(login(newUserCreds))
        log.debug(
            'Finished refreshing login details',
            newUserCreds,
            'toolSlice'
        )
    }
)

export const signIn = createAsyncThunk(
    'tool/signIn',
    async (payload: null, { dispatch, getState }) => {
        await dispatch(refreshLoginDetails(null))
        const state = (getState() as FullState).toolState

        log.info('Initiating sign in', undefined, 'toolSlice')
        if (state.authLogin.accessToken && state.authLogin.profile) {
            log.debug('User already logged in', undefined, 'toolSlice')
            return
        } else {
            log.info('Proceeding to login', undefined, 'toolSlice')
            await connector.loginCodeX()
        }
    }
)

export const signOut = createAsyncThunk(
    'tool/signOut',
    async (payload: null, { dispatch, getState }) => {
        await dispatch(refreshLoginDetails(null))
        const state = (getState() as FullState).toolState

        log.info('Initiating sign out', undefined, 'toolSlice')
        if (state.authLogin.accessToken && state.authLogin.profile) {
            log.info('Proceeding to logout', undefined, 'toolSlice')
            await connector.logoutCodeX()
        } else {
            log.debug(
                'User not logged in, skipping logout',
                undefined,
                'toolSlice'
            )
            return
        }
    }
)

export const upgrade = createAsyncThunk(
    'tool/upgrade',
    async (payload: null, { dispatch, getState }) => {
        await dispatch(refreshLoginDetails(null))
        const state = (getState() as FullState).toolState
        log.debug(
            'Finished refreshing login for upgrade',
            undefined,
            'toolSlice'
        )
        log.info('Initiating upgrade', undefined, 'toolSlice')
        if (
            state.authLogin.accessToken &&
            state.authLogin.profile &&
            state.authLogin.stripeId
        ) {
            log.debug('User already has subscription', undefined, 'toolSlice')
            return
        } else if (!(state.authLogin.accessToken && state.authLogin.profile)) {
            log.info(
                'User not logged in, proceeding to login',
                undefined,
                'toolSlice'
            )
            await connector.loginCodeX()
        } else {
            log.info('Proceeding to payment', undefined, 'toolSlice')
            await connector.payCodeX()
        }
    }
)

export const toolSlice = createSlice({
    name: 'toolState',
    initialState: initialState as ToolState,
    reducers: {
        openSearch: (state: ToolState) => {
            untriggerAll(state)
            state.openLeftTab = 'search'
            state.leftTabActive = true
        },
        openFileTree: (state: ToolState) => {
            untriggerAll(state)
            state.openLeftTab = 'filetree'
            state.leftTabActive = true
        },
        leftTabInactive: (state: ToolState) => {
            state.leftTabActive = false
        },
        triggerFileSearch: (state: ToolState) => {
            untriggerAll(state)
            state.fileSearchTriggered = true
        },
        untriggerFileSearch: (state: ToolState) => {
            untriggerAll(state)
        },

        triggerCommandPalette: (state: ToolState) => {
            untriggerAll(state)
            state.commandPaletteTriggered = true
        },
        triggerAICommandPalette: (state: ToolState) => {
            const newAICommandPaletteTriggered =
                !state.aiCommandPaletteTriggered
            untriggerAll(state)
            state.aiCommandPaletteTriggered = newAICommandPaletteTriggered
        },
        untriggerAICommandPalette: (state: ToolState) => {
            untriggerAll(state)
        },
        untriggerCommandPalette: (state: ToolState) => {
            untriggerAll(state)
        },
        collapseLeftSide: (state: ToolState) => {
            state.leftSideExpanded = false
        },
        expandLeftSide: (state: ToolState) => {
            state.leftSideExpanded = true
        },
        toggleLeftSide: (state: ToolState) => {
            state.leftSideExpanded = !state.leftSideExpanded
        },

        login(
            state: ToolState,
            action: PayloadAction<{
                accessToken?: string | null
                profile?: any | null
                stripeProfile?: string | null
            }>
        ) {
            log.debug('Login action triggered', action.payload, 'toolSlice')
            if (action.payload.accessToken) {
                state.authLogin.accessToken = action.payload.accessToken
            } else if (action.payload.accessToken === null) {
                state.authLogin.accessToken = undefined
            }

            if (action.payload.profile) {
                state.authLogin.profile = action.payload.profile
            } else if (action.payload.profile === null) {
                state.authLogin.profile = undefined
            }

            // Should name these the same thing
            if (action.payload.stripeProfile) {
                state.authLogin.stripeId = action.payload.stripeProfile
            } else if (action.payload.stripeProfile === null) {
                state.authLogin.stripeId = undefined
            }
        },
        dismissWelcome: (state: ToolState) => {
            state.welcomeDismissed = true
        },
    },
})

export const {
    openSearch,
    openFileTree,
    leftTabInactive,
    triggerFileSearch,
    untriggerFileSearch,
    triggerCommandPalette,
    untriggerCommandPalette,
    triggerAICommandPalette,
    untriggerAICommandPalette,
    collapseLeftSide,
    expandLeftSide,
    toggleLeftSide,
    login,
    dismissWelcome,
} = toolSlice.actions
