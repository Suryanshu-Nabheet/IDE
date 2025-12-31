import {
    findFileIdFromPath,
    getContentsIfNeeded,
    getPathForFolderId,
} from '../window/fileUtils'
import { FullState } from '../window/state'
import { joinAdvanced } from '../../utils'

export async function getIntellisenseSymbols(
    state: FullState,
    fileId: number
): Promise<string[]> {
    // TODO loop through current file and get all top level function statements
    // Find all imported file paths
    // Try to locate them on disk
    // for each find their exported function statementsA
    // pass back a string array

    const fileContents = await getContentsIfNeeded(state.global, fileId)
    const lines = fileContents.split('\n')
    const symbols: string[] = []
    const currentFolderPath = getPathForFolderId(
        state.global,
        state.global.files[fileId].parentFolderId
    )
    for (const line of lines) {
        // find function name in any line that begins with function
        const match = line.match(/^\s*(export )?function ([a-zA-Z0-9_]+)/)
        if (match) {
            symbols.push(match[2])
        }
    }

    // find the paths of all local imported files
    const importRegex = /import .* from ['"](.*)['"]/g
    const importMatches = fileContents.matchAll(importRegex)
    const moduleRegex = /import \* as ([a-zA-Z0-9_]+) from/
    for (const match of importMatches) {
        const importPath = match[1]
        const moduleMatch = match[0].match(moduleRegex)
        const moduleName =
            moduleMatch && moduleMatch.length > 1 ? moduleMatch[1] : null
        // maerge current folder path with import path
        const fullPath = joinAdvanced(currentFolderPath, importPath)
        for (const ext of ['ts', 'tsx', 'js', 'jsx']) {
            const fileId = findFileIdFromPath(
                state.global,
                fullPath + '.' + ext
            )
            if (fileId) {
                const fileContents = await getContentsIfNeeded(
                    state.global,
                    fileId
                )
                const lines = fileContents.split('\n')
                for (const line of lines) {
                    // match exported function statem
                    const match = line.match(
                        /^\s*export (type )?(enum )?(interface )?(const )?(async )?(function )?([a-zA-Z0-9_]+)/
                    )
                    if (match) {
                        // regex to get import * as ___ from
                        let found = match[7]
                        if (moduleName) {
                            found = moduleName + '.' + found
                        }
                        symbols.push(found)
                    }
                }
                break
            }
        }
    }
    return symbols
}

export async function getAllExportedFunctionSymbols(
    state: FullState,
    fileId: number
): Promise<string[]> {
    const fileContents = await getContentsIfNeeded(state.global, fileId)
    const lines = fileContents.split('\n')
    const symbols: string[] = []
    for (const line of lines) {
        // find function name in any line that begins with function
        const match = line.match(/^\s*(export )?function ([a-zA-Z0-9_]+)/)
        if (match) {
            symbols.push(match[2])
        }
    }

    return symbols
}
