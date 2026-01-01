import React from 'react'

export const ExtensionsPane = () => {
    return (
        <div className="flex flex-col h-full">
            <div className="left-pane-header">Extensions</div>
            <div className="p-4 text-ui-fg-muted text-sm text-center">
                <p>No extensions installed.</p>
                <div className="mt-4">
                    <input
                        type="text"
                        placeholder="Search Extensions..."
                        className="search-input !bg-white/5 !border-white/10"
                    />
                </div>
            </div>
        </div>
    )
}
