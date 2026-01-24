import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import {
    fetchPopularExtensions,
    searchExtensions,
    setSearchQuery,
} from '../features/extensions/extensionsSlice'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faCube, faSpinner } from '@fortawesome/pro-regular-svg-icons'

export const ExtensionsPane: React.FC = () => {
    const dispatch = useAppDispatch()
    const { available, installed, isSearching, searchQuery } = useAppSelector(
        (state: any) => state.extensionsState
    )

    useEffect(() => {
        dispatch(fetchPopularExtensions())
    }, [dispatch])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        dispatch(searchExtensions(searchQuery))
    }

    return (
        <div className="flex flex-col h-full bg-[var(--sidebar-bg)] text-[var(--sidebar-fg)]">
            <div className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--ui-fg-muted)]">
                Extensions
            </div>
            <div className="px-4 pb-2">
                <form
                    onSubmit={handleSearch}
                    className="relative flex items-center bg-[var(--input-bg)] border border-[var(--input-border)] focus-within:border-[var(--accent)] rounded-[3px] overflow-hidden"
                >
                    <div className="pl-2 pr-1 opacity-70">
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="text-[10px]"
                        />
                    </div>
                    <input
                        className="w-full bg-transparent border-none outline-none text-[13px] text-[var(--input-fg)] px-1 py-[6px] placeholder:text-[var(--input-placeholder)]"
                        placeholder="Search Extensions"
                        value={searchQuery}
                        onChange={(e) =>
                            dispatch(setSearchQuery(e.target.value))
                        }
                    />
                </form>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar">
                {isSearching ? (
                    <div className="p-10 flex flex-col items-center gap-2 opacity-50">
                        <FontAwesomeIcon icon={faSpinner} spin size="lg" />
                        <span className="text-[11px]">Searching...</span>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {available.map((ext: any) => (
                            <div
                                key={ext.extensionId || ext.id}
                                className="px-4 py-2 hover:bg-[var(--sidebar-hover)] cursor-pointer flex gap-3 group transition-colors border-b border-[var(--sidebar-border)] last:border-none"
                            >
                                <div className="w-10 h-10 rounded bg-[var(--ui-bg-elevated)] flex items-center justify-center shrink-0">
                                    {ext.files?.icon ? (
                                        <img
                                            src={ext.files.icon}
                                            alt=""
                                            className="w-8 h-8 object-contain"
                                        />
                                    ) : (
                                        <FontAwesomeIcon
                                            icon={faCube}
                                            className="text-[18px] opacity-30"
                                        />
                                    )}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[13px] font-bold truncate group-hover:text-[var(--accent)] transition-colors">
                                            {ext.displayName || ext.name}
                                        </span>
                                        {installed[
                                            ext.extensionId || ext.id
                                        ] && (
                                            <span className="text-[9px] px-1 bg-[var(--accent)] text-[var(--white)] rounded-sm uppercase font-bold">
                                                Installed
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[11px] text-[var(--ui-fg-muted)] truncate">
                                        {ext.publisher}
                                    </span>
                                    <span className="text-[12px] opacity-70 line-clamp-2 mt-0.5">
                                        {ext.description}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
