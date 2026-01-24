import { createSelector } from '@reduxjs/toolkit'

export const selectFixesByFileId = (fileId: number | undefined) =>
    createSelector(
        (state: any) => state.fixLSP.fixes,
        (fixes) => {
            if (fileId === undefined) return null
            return fixes[fileId] || null
        }
    )
