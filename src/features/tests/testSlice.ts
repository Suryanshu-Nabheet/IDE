import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface TestData {
    functionName: string
    filePath: string
    startLine: number
}

export interface TestState {
    testsByFile: { [filePath: string]: TestData[] }
    hasTestsByFile: { [filePath: string]: boolean }
}

const initialState: TestState = {
    testsByFile: {},
    hasTestsByFile: {},
}

export const testSlice = createSlice({
    name: 'tests',
    initialState,
    reducers: {
        updateTestsForFile: (
            state,
            action: PayloadAction<{ filePath: string; tests: TestData[] }>
        ) => {
            state.testsByFile[action.payload.filePath] = action.payload.tests
            state.hasTestsByFile[action.payload.filePath] =
                action.payload.tests.length > 0
        },
        computeAndRenderTest: (
            _state,
            _action: PayloadAction<{
                fileName: string
                functionBody: string
                startLine: number
            }>
        ) => {
            // Placeholder
        },
        renderNewTest: (
            _state,
            _action: PayloadAction<{
                filePath: string
                functionName: string
                startLine: number
            }>
        ) => {
            // Placeholder
        },
    },
})

export const { updateTestsForFile, computeAndRenderTest, renderNewTest } =
    testSlice.actions
export default testSlice.reducer
