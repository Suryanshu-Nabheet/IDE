import React from 'react'

export const GitPane = () => {
    return (
        <div className="flex flex-col h-full">
            <div className="left-pane-header">Source Control</div>
            <div className="p-4 text-ui-fg-muted text-sm text-center">
                <p>Git integration is active.</p>
                <p className="mt-2 opacity-50">No changes detected.</p>
            </div>
        </div>
    )
}
