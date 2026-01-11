import React from 'react'

export const ExtensionsPane = () => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--sidebar-bg)]">
            <div className="text-center px-8">
                <div className="text-6xl mb-4">🧩</div>
                <h2 className="text-xl font-semibold text-[var(--ui-fg)] mb-2">
                    Extensions
                </h2>
                <p className="text-sm text-[var(--ui-fg-muted)]">Coming Soon</p>
            </div>
        </div>
    )
}
