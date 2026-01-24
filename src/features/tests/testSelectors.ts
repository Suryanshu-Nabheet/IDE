import { createSelector } from '@reduxjs/toolkit'

export const getTests = (filePath: string) =>
    createSelector(
        (state: any) => state.tests.testsByFile,
        (testsByFile) => testsByFile[filePath] || []
    )

export const selectHasTests = (filePath: string) =>
    createSelector(
        (state: any) => state.tests.hasTestsByFile,
        (hasTestsByFile) => hasTestsByFile[filePath] || false
    )
