import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface FixLSPFile {
    fileId: number
    doDiagnosticsExist: boolean
}

export interface FixLSPState {
    fixes: { [fileId: number]: FixLSPFile }
}

const initialState: FixLSPState = {
    fixes: {},
}

export const fixLSPSlice = createSlice({
    name: 'fixLSP',
    initialState,
    reducers: {
        updateFixes: (state, action: PayloadAction<FixLSPFile>) => {
            state.fixes[action.payload.fileId] = action.payload
        },
        fixErrors: (state, action: PayloadAction<{ tabId: number }>) => {
            // Placeholder for fixing errors logic
            console.log('Fixing errors for tab:', action.payload.tabId)
        },
    },
})

export const { updateFixes, fixErrors } = fixLSPSlice.actions
export default fixLSPSlice.reducer
