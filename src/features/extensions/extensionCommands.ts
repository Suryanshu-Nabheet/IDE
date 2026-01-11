/**
 * Extension Commands Integration
 * Integrates extension commands into the IDE's command palette
 */

import { extensionActivationManager } from './extensionActivation'
import { AnyAction, Dispatch } from '@reduxjs/toolkit'

export interface ExtensionCommand {
    id: string
    type: 'extension'
    name: string
    description: string
    extensionId: string
    action: (dispatch: Dispatch<AnyAction>) => void
}

/**
 * Get all extension commands formatted for the command palette
 */
export function getExtensionCommands(): ExtensionCommand[] {
    const commandIds = extensionActivationManager.getCommands()

    return commandIds.map((commandId: string) => {
        const parts = commandId.split('.')
        const extensionId = parts.slice(0, -1).join('.')
        const commandName = parts[parts.length - 1]

        // Format command name (camelCase to Title Case)
        const formattedName = commandName
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .split(' ')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')

        return {
            id: commandId,
            type: 'extension' as const,
            name: formattedName,
            description: `Extension: ${extensionId}`,
            extensionId,
            action: async (_dispatch: Dispatch<AnyAction>) => {
                try {
                    await extensionActivationManager.executeCommand(commandId)
                } catch (error) {
                    console.error(
                        `Failed to execute extension command ${commandId}:`,
                        error
                    )
                }
            },
        }
    })
}

/**
 * Make extension commands globally available
 */
if (typeof window !== 'undefined') {
    ;(window as any).getExtensionCommands = getExtensionCommands
}
