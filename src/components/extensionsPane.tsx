import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faSpinner } from '@fortawesome/pro-regular-svg-icons'

interface Extension {
    namespace: string
    name: string
    displayName: string
    description: string
    version: string
}

export const ExtensionsPane = () => {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<Extension[]>([])
    const [loading, setLoading] = useState(false)
    const [installed, setInstalled] = useState<Set<string>>(new Set())

    const searchExtensions = async (q: string) => {
        if (!q) {
            setResults([])
            return
        }
        setLoading(true)
        try {
            // Using OpenVSX public API
            const response = await fetch(
                `https://open-vsx.org/api/-/search?query=${q}&size=20`
            )
            const data = await response.json()
            setResults(data.extensions || [])
        } catch (e) {
            console.error('Extension search failed', e)
        } finally {
            setLoading(false)
        }
    }

    const toggleInstall = (id: string) => {
        const newInstalled = new Set(installed)
        if (newInstalled.has(id)) {
            newInstalled.delete(id)
        } else {
            newInstalled.add(id)
        }
        setInstalled(newInstalled)
    }

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (query) searchExtensions(query)
            else {
                // Load some mocked "popular" extensions if empty?
                // For now just clear
                setResults([])
            }
        }, 500)
        return () => clearTimeout(timeout)
    }, [query])

    return (
        <div className="flex flex-col h-full bg-ui-bg">
            <div className="left-pane-header">Extensions</div>
            <div className="p-3 border-b border-ui-border">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search Extensions in Marketplace..."
                        className="w-full bg-black/20 border border-white/10 rounded-md py-1.5 pl-8 pr-3 text-sm focus:border-accent outline-none"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="absolute left-2.5 top-2 opacity-50 text-xs">
                        <FontAwesomeIcon icon={faSearch} />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {loading && (
                    <div className="flex justify-center py-8 opacity-50">
                        <FontAwesomeIcon
                            icon={faSpinner}
                            spin
                            className="text-xl"
                        />
                    </div>
                )}

                {!loading && results.length === 0 && query && (
                    <div className="text-center opacity-50 text-sm mt-8">
                        No extensions found.
                    </div>
                )}

                {!loading && results.length === 0 && !query && (
                    <div className="text-center opacity-50 text-sm mt-8">
                        Search for extensions to install.
                    </div>
                )}

                <div className="space-y-2">
                    {results.map((ext) => {
                        const id = `${ext.namespace}.${ext.name}`
                        const isInstalled = installed.has(id)
                        return (
                            <div
                                key={id}
                                className="flex gap-3 p-2 rounded hover:bg-white/5 group"
                            >
                                <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center text-lg font-bold text-ui-fg-muted uppercase shrink-0">
                                    {ext.name.substring(0, 1)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div
                                            className="font-semibold text-sm truncate pr-2"
                                            title={ext.displayName || ext.name}
                                        >
                                            {ext.displayName || ext.name}
                                        </div>
                                    </div>
                                    <div
                                        className="text-xs opacity-60 truncate mb-2"
                                        title={ext.description}
                                    >
                                        {ext.description}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="text-[10px] opacity-40">
                                            {ext.namespace}
                                        </div>
                                        <button
                                            onClick={() => toggleInstall(id)}
                                            className={`
                                                px-2 py-0.5 rounded text-[10px] font-medium transition-colors
                                                ${
                                                    isInstalled
                                                        ? 'bg-white/10 text-white/50'
                                                        : 'bg-accent text-white hover:bg-accent-hover'
                                                }
                                            `}
                                        >
                                            {isInstalled
                                                ? 'Installed'
                                                : 'Install'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
