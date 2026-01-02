import React, { useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faSpinner } from '@fortawesome/pro-regular-svg-icons'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import {
    searchExtensions,
    installExtension,
    uninstallExtension,
    setSearchQuery,
    Extension,
} from '../features/extensions/extensionsSlice'
import * as exsel from '../features/extensions/extensionsSelectors'
import { openFile } from '../features/globalSlice'

export const ExtensionsPane = () => {
    const dispatch = useAppDispatch()
    const installed = useAppSelector(exsel.getInstalledExtensions)
    const available = useAppSelector(exsel.getAvailableExtensions)
    const searchQuery = useAppSelector(exsel.getSearchQuery)
    const isSearching = useAppSelector(exsel.getIsSearching)

    const handleSearch = (query: string) => {
        dispatch(setSearchQuery(query))
        if (query.trim()) {
            dispatch(searchExtensions(query))
        } else {
            dispatch(searchExtensions('theme'))
        }
    }

    const handleInstall = (ext: Extension, e: React.MouseEvent) => {
        e.stopPropagation()
        dispatch(installExtension(ext))
    }

    const handleUninstall = (extensionId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        dispatch(uninstallExtension(extensionId))
    }

    const isInstalled = (extId: string | undefined) => {
        if (!extId) return false
        return !!installed[extId]
    }

    const getExtId = (ext: Extension) => {
        return ext.extensionId || ext.namespace + '.' + ext.name || ext.id || ''
    }

    const openExtensionDetails = (ext: Extension) => {
        const extId = getExtId(ext)

        // Store extension data in sessionStorage for the detail view
        sessionStorage.setItem(`extension:${extId}`, JSON.stringify(ext))

        // Open it as a virtual file in the editor
        dispatch(
            openFile({
                filePath: `extension://${extId}`,
            })
        )
    }

    useEffect(() => {
        if (available.length === 0 && !searchQuery) {
            dispatch(searchExtensions('theme'))
        }
    }, [])

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (searchQuery.trim()) {
                dispatch(searchExtensions(searchQuery))
            }
        }, 500)
        return () => clearTimeout(timeout)
    }, [searchQuery, dispatch])

    return (
        <div
            className="flex flex-col h-full"
            style={{ backgroundColor: 'var(--sidebar-bg)' }}
        >
            {/* Search Input */}
            <div style={{ padding: '12px 16px' }}>
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Search extensions..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '6px 10px 6px 28px',
                            backgroundColor: 'var(--ui-bg)',
                            border: '1px solid var(--ui-border)',
                            borderRadius: '4px',
                            fontSize: '13px',
                            color: 'var(--ui-fg)',
                            outline: 'none',
                        }}
                    />
                    <FontAwesomeIcon
                        icon={isSearching ? faSpinner : faSearch}
                        className={isSearching ? 'animate-spin' : ''}
                        style={{
                            position: 'absolute',
                            left: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '11px',
                            color: 'var(--ui-fg-muted)',
                        }}
                    />
                </div>
            </div>

            {/* Extensions List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {/* Installed Extensions */}
                {Object.values(installed).length > 0 && (
                    <div>
                        <div
                            style={{
                                padding: '8px 16px',
                                fontSize: '11px',
                                fontWeight: 600,
                                color: 'var(--ui-fg-muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                            }}
                        >
                            Installed
                        </div>
                        {Object.values(installed).map((ext: Extension) => {
                            const extId = getExtId(ext)
                            return (
                                <div
                                    key={extId}
                                    onClick={() => openExtensionDetails(ext)}
                                    className="sidebar-item"
                                    style={{
                                        padding: '12px 16px',
                                        cursor: 'pointer',
                                        borderBottom:
                                            '1px solid var(--ui-border-subtle)',
                                        transition: 'background-color 0.1s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            'var(--ui-hover)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            'transparent'
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '12px',
                                        }}
                                    >
                                        {/* Icon */}
                                        <div
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '4px',
                                                backgroundColor: 'var(--ui-bg)',
                                                flexShrink: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {ext.files?.icon ? (
                                                <img
                                                    src={ext.files.icon}
                                                    alt={ext.displayName}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    style={{ fontSize: '20px' }}
                                                >
                                                    📦
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    justifyContent:
                                                        'space-between',
                                                    gap: '8px',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        flex: 1,
                                                        minWidth: 0,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontSize: '13px',
                                                            fontWeight: 500,
                                                            color: 'var(--ui-fg)',
                                                            overflow: 'hidden',
                                                            textOverflow:
                                                                'ellipsis',
                                                            whiteSpace:
                                                                'nowrap',
                                                        }}
                                                    >
                                                        {ext.displayName ||
                                                            ext.name}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: '12px',
                                                            color: 'var(--ui-fg-muted)',
                                                            overflow: 'hidden',
                                                            textOverflow:
                                                                'ellipsis',
                                                            whiteSpace:
                                                                'nowrap',
                                                            marginTop: '2px',
                                                        }}
                                                    >
                                                        {ext.description}
                                                    </div>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            alignItems:
                                                                'center',
                                                            gap: '12px',
                                                            marginTop: '4px',
                                                            fontSize: '11px',
                                                            color: 'var(--ui-fg-muted)',
                                                        }}
                                                    >
                                                        <span>
                                                            {ext.namespace}
                                                        </span>
                                                        {ext.downloadCount && (
                                                            <span>
                                                                {ext.downloadCount.toLocaleString()}{' '}
                                                                downloads
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Install Button */}
                                                <button
                                                    onClick={(e) =>
                                                        handleUninstall(
                                                            extId,
                                                            e
                                                        )
                                                    }
                                                    style={{
                                                        padding: '4px 12px',
                                                        fontSize: '11px',
                                                        backgroundColor:
                                                            'var(--accent)',
                                                        color: '#ffffff',
                                                        border: 'none',
                                                        borderRadius: '2px',
                                                        cursor: 'pointer',
                                                        flexShrink: 0,
                                                        transition:
                                                            'background-color 0.1s',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.filter =
                                                            'brightness(1.1)'
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.filter =
                                                            'none'
                                                    }}
                                                >
                                                    Uninstall
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Available Extensions */}
                {available.length > 0 && (
                    <div>
                        <div
                            style={{
                                padding: '8px 16px',
                                fontSize: '11px',
                                fontWeight: 600,
                                color: 'var(--ui-fg-muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                            }}
                        >
                            {searchQuery
                                ? 'Search Results'
                                : 'Popular Extensions'}
                        </div>
                        {available
                            .filter(
                                (ext: Extension) => !isInstalled(getExtId(ext))
                            )
                            .map((ext: Extension) => {
                                const extId = getExtId(ext)
                                return (
                                    <div
                                        key={extId}
                                        onClick={() =>
                                            openExtensionDetails(ext)
                                        }
                                        style={{
                                            padding: '12px 16px',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.1s',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor =
                                                '#0a0a0a'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor =
                                                'transparent'
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '12px',
                                            }}
                                        >
                                            {/* Icon */}
                                            <div
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '4px',
                                                    backgroundColor:
                                                        'var(--ui-bg)',
                                                    flexShrink: 0,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {ext.files?.icon ? (
                                                    <img
                                                        src={ext.files.icon}
                                                        alt={ext.displayName}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                        }}
                                                    />
                                                ) : (
                                                    <div
                                                        style={{
                                                            fontSize: '20px',
                                                        }}
                                                    >
                                                        📦
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div
                                                style={{ flex: 1, minWidth: 0 }}
                                            >
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems:
                                                            'flex-start',
                                                        justifyContent:
                                                            'space-between',
                                                        gap: '8px',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            flex: 1,
                                                            minWidth: 0,
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                fontSize:
                                                                    '13px',
                                                                fontWeight: 500,
                                                                color: 'var(--ui-fg)',
                                                                overflow:
                                                                    'hidden',
                                                                textOverflow:
                                                                    'ellipsis',
                                                                whiteSpace:
                                                                    'nowrap',
                                                            }}
                                                        >
                                                            {ext.displayName ||
                                                                ext.name}
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize:
                                                                    '12px',
                                                                color: 'var(--ui-fg-muted)',
                                                                overflow:
                                                                    'hidden',
                                                                textOverflow:
                                                                    'ellipsis',
                                                                whiteSpace:
                                                                    'nowrap',
                                                                marginTop:
                                                                    '2px',
                                                            }}
                                                        >
                                                            {ext.description}
                                                        </div>
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                alignItems:
                                                                    'center',
                                                                gap: '12px',
                                                                marginTop:
                                                                    '4px',
                                                                fontSize:
                                                                    '11px',
                                                                color: 'var(--ui-fg-muted)',
                                                            }}
                                                        >
                                                            <span>
                                                                {ext.namespace}
                                                            </span>
                                                            {ext.downloadCount && (
                                                                <span>
                                                                    {ext.downloadCount.toLocaleString()}{' '}
                                                                    downloads
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Install Button */}
                                                    <button
                                                        onClick={(e) =>
                                                            handleInstall(
                                                                ext,
                                                                e
                                                            )
                                                        }
                                                        style={{
                                                            padding: '4px 12px',
                                                            fontSize: '11px',
                                                            backgroundColor:
                                                                'var(--accent)',
                                                            color: '#ffffff',
                                                            border: 'none',
                                                            borderRadius: '2px',
                                                            cursor: 'pointer',
                                                            flexShrink: 0,
                                                            transition:
                                                                'background-color 0.1s',
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.filter =
                                                                'brightness(1.1)'
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.filter =
                                                                'none'
                                                        }}
                                                    >
                                                        Install
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                    </div>
                )}

                {/* Empty State */}
                {!isSearching &&
                    available.length === 0 &&
                    Object.values(installed).length === 0 && (
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                textAlign: 'center',
                                padding: '24px',
                            }}
                        >
                            <FontAwesomeIcon
                                icon={faSearch}
                                style={{
                                    fontSize: '32px',
                                    color: 'var(--ui-fg-muted)',
                                    marginBottom: '12px',
                                }}
                            />
                            <p
                                style={{
                                    fontSize: '13px',
                                    color: 'var(--ui-fg-muted)',
                                }}
                            >
                                Search for extensions to get started
                            </p>
                        </div>
                    )}

                {/* Loading State */}
                {isSearching && (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '32px',
                        }}
                    >
                        <FontAwesomeIcon
                            icon={faSpinner}
                            className="animate-spin"
                            style={{ fontSize: '24px', color: 'var(--accent)' }}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
