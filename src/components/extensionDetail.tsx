import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faDownload,
    faStar,
    faSpinner,
    faTag,
    faCheckCircle,
    faBoxOpen,
} from '@fortawesome/pro-regular-svg-icons'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import {
    installExtension,
    uninstallExtension,
    Extension,
} from '../features/extensions/extensionsSlice'
import * as exsel from '../features/extensions/extensionsSelectors'

interface ExtensionDetailProps {
    extension: Extension
}

export const ExtensionDetail: React.FC<ExtensionDetailProps> = ({
    extension: initialExtension,
}) => {
    const dispatch = useAppDispatch()
    const installed = useAppSelector(exsel.getInstalledExtensions)

    // We keep track of the extension data.
    // Since we use key={extId} in the parent, this component remounts on change.
    const [extension, setExtension] = useState(initialExtension)
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<
        'details' | 'changelog' | 'dependencies'
    >('details')
    const [readme, setReadme] = useState<string>('')
    const [changelog, setChangelog] = useState<string>('')
    const [dependencies, setDependencies] = useState<string[]>([])
    const [fetchingChangelog, setFetchingChangelog] = useState(false)

    const getExtId = (ext: Extension) => {
        return ext.extensionId || ext.namespace + '.' + ext.name || ext.id || ''
    }

    const extId = getExtId(extension)
    const isInstalled = !!installed[extId]

    // Fetch complete extension data from OpenVSX
    useEffect(() => {
        const fetchExtensionData = async () => {
            if (!extension.namespace || !extension.name) return

            setLoading(true)
            try {
                // Fetch full extension details
                const response = await fetch(
                    `https://open-vsx.org/api/${extension.namespace}/${extension.name}`
                )
                const data = await response.json()
                setExtension((prev) => ({ ...prev, ...data }))

                // Fetch README if available
                if (data.files?.readme) {
                    const readmeResponse = await fetch(data.files.readme)
                    const readmeText = await readmeResponse.text()
                    setReadme(readmeText)
                }

                // Fetch Changelog if available
                if (data.files?.changelog) {
                    setFetchingChangelog(true)
                    fetch(data.files.changelog)
                        .then((res) => res.text())
                        .then((text) => setChangelog(text))
                        .catch((err) =>
                            console.error('Failed to fetch changelog', err)
                        )
                        .finally(() => setFetchingChangelog(false))
                }

                // Fetch Dependencies from Manifest (package.json)
                if (data.files?.manifest) {
                    fetch(data.files.manifest)
                        .then((res) => res.json())
                        .then((manifest) => {
                            if (
                                manifest.extensionDependencies &&
                                Array.isArray(manifest.extensionDependencies)
                            ) {
                                setDependencies(manifest.extensionDependencies)
                            } else {
                                setDependencies([])
                            }
                        })
                        .catch((err) =>
                            console.error('Failed to fetch manifest', err)
                        )
                }
            } catch (error) {
                console.error('Failed to fetch extension details:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchExtensionData()
    }, [extension.namespace, extension.name])

    const handleInstall = () => {
        dispatch(installExtension(extension))
    }

    const handleUninstall = () => {
        dispatch(uninstallExtension(extId))
    }

    const formatNumber = (num: number | undefined) => {
        if (!num) return '0'
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
        return num.toString()
    }

    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return 'Unknown'
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    // Custom Markdown Components for Styling
    const MarkdownComponents = {
        h1: ({ ...props }: any) => (
            <h1
                className="text-2xl font-bold mb-4 mt-6 text-[var(--ui-fg)] border-b border-[var(--ui-border)] pb-2"
                {...props}
            />
        ),
        h2: ({ ...props }: any) => (
            <h2
                className="text-xl font-bold mb-3 mt-5 text-[var(--ui-fg)]"
                {...props}
            />
        ),
        h3: ({ ...props }: any) => (
            <h3
                className="text-lg font-bold mb-2 mt-4 text-[var(--ui-fg)]"
                {...props}
            />
        ),
        p: ({ ...props }: any) => (
            <p
                className="mb-4 leading-relaxed text-[var(--ui-fg-muted)]"
                {...props}
            />
        ),
        ul: ({ ...props }: any) => (
            <ul
                className="list-disc list-inside mb-4 ml-2 space-y-1 text-[var(--ui-fg-muted)]"
                {...props}
            />
        ),
        ol: ({ ...props }: any) => (
            <ol
                className="list-decimal list-inside mb-4 ml-2 space-y-1 text-[var(--ui-fg-muted)]"
                {...props}
            />
        ),
        li: ({ ...props }: any) => <li className="pl-1" {...props} />,
        a: ({ ...props }: any) => (
            <a
                className="text-[var(--accent)] hover:underline cursor-pointer"
                {...props}
            />
        ),
        blockquote: ({ ...props }: any) => (
            <blockquote
                className="border-l-4 border-[var(--accent)] pl-4 italic text-[var(--ui-fg-muted)] mb-4 bg-[var(--ui-bg)] py-2 pr-2 rounded-r"
                {...props}
            />
        ),
        code: ({ inline, className, children, ...props }: any) => {
            return !inline ? (
                <div className="relative mb-4">
                    <pre className="bg-[var(--ui-bg)] p-4 rounded-lg overflow-x-auto border border-[var(--ui-border)] text-sm font-mono text-[var(--ui-fg)]">
                        <code className={className} {...props}>
                            {children}
                        </code>
                    </pre>
                </div>
            ) : (
                <code
                    className="bg-[var(--ui-bg)] rounded px-1.5 py-0.5 font-mono text-xs text-[var(--ui-fg)]"
                    {...props}
                >
                    {children}
                </code>
            )
        },
        img: ({ ...props }: any) => (
            <img
                className="max-w-full rounded-lg border border-[var(--ui-border)] my-4 shadow-md"
                {...props}
            />
        ),
        table: ({ ...props }: any) => (
            <div className="overflow-x-auto mb-4 border border-[var(--ui-border)] rounded-lg">
                <table
                    className="min-w-full divide-y divide-[var(--ui-border)]"
                    {...props}
                />
            </div>
        ),
        thead: ({ ...props }: any) => (
            <thead className="bg-[var(--ui-bg)]" {...props} />
        ),
        th: ({ ...props }: any) => (
            <th
                className="px-3 py-2 text-left text-xs font-medium text-[var(--ui-fg-muted)] uppercase tracking-wider"
                {...props}
            />
        ),
        tbody: ({ ...props }: any) => (
            <tbody className="divide-y divide-[var(--ui-border)]" {...props} />
        ),
        tr: ({ ...props }: any) => (
            <tr
                className="hover:bg-[var(--ui-bg)] transition-colors"
                {...props}
            />
        ),
        td: ({ ...props }: any) => (
            <td
                className="px-3 py-2 text-sm text-[var(--ui-fg-muted)] whitespace-pre-wrap"
                {...props}
            />
        ),
    }

    return (
        <div className="w-full h-full bg-[var(--background)] text-[var(--ui-fg)] overflow-y-auto font-sans">
            {/* Header */}
            <div className="border-b border-[var(--ui-border)] p-8">
                <div className="flex items-start gap-6">
                    {/* Icon */}
                    <div className="w-32 h-32 rounded-lg bg-[var(--ui-bg)] border border-[var(--ui-border)] flex-shrink-0 flex items-center justify-center overflow-hidden shadow-lg">
                        {extension.files?.icon ? (
                            <img
                                src={extension.files.icon}
                                alt={extension.displayName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <FontAwesomeIcon
                                icon={faBoxOpen}
                                className="text-5xl text-[var(--ui-fg-muted)]"
                            />
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-semibold text-[var(--ui-fg)] mb-2">
                                    {extension.displayName || extension.name}
                                </h1>
                                <div className="text-sm text-[var(--ui-fg-muted)] mb-4 flex items-center gap-2">
                                    <FontAwesomeIcon
                                        icon={faCheckCircle}
                                        className="text-blue-500"
                                    />
                                    {extension.namespace}
                                </div>
                            </div>
                        </div>

                        <p className="text-base text-[var(--ui-fg-muted)] mb-6 leading-relaxed max-w-3xl">
                            {extension.description}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center gap-6 text-sm text-[var(--ui-fg-muted)] mb-6">
                            {extension.downloadCount !== undefined && (
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faDownload} />
                                    <span>
                                        {formatNumber(extension.downloadCount)}{' '}
                                        downloads
                                    </span>
                                </div>
                            )}
                            {extension.averageRating !== undefined && (
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon
                                        icon={faStar}
                                        className="text-yellow-500"
                                    />
                                    <span>
                                        {extension.averageRating.toFixed(1)}
                                    </span>
                                    {extension.reviewCount && (
                                        <span>
                                            ({extension.reviewCount} reviews)
                                        </span>
                                    )}
                                </div>
                            )}
                            {extension.version && (
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faTag} />
                                    <span>v{extension.version}</span>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            {isInstalled ? (
                                <button
                                    onClick={handleUninstall}
                                    className="px-6 py-2 text-sm font-medium bg-[var(--accent)] text-white rounded hover:brightness-110 transition-all shadow-sm"
                                >
                                    Uninstall
                                </button>
                            ) : (
                                <button
                                    onClick={handleInstall}
                                    className="px-6 py-2 text-sm font-medium bg-[var(--accent)] text-white rounded hover:brightness-110 transition-all shadow-sm"
                                >
                                    Install
                                </button>
                            )}
                            {extension.files?.download && (
                                <a
                                    href={extension.files.download}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-2 text-sm font-medium bg-[var(--ui-bg)] text-[var(--ui-fg)] border border-[var(--ui-border)] rounded hover:bg-[var(--sidebar-bg)] transition-colors inline-flex items-center gap-2"
                                >
                                    <FontAwesomeIcon icon={faDownload} />
                                    Download VSIX
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-[var(--ui-border)] px-8 sticky top-0 bg-[var(--background)]/95 backdrop-blur z-10">
                <div className="flex gap-8">
                    {['details', 'changelog', 'dependencies'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`py-4 text-sm font-medium capitalize border-b-2 transition-colors ${
                                activeTab === tab
                                    ? 'text-[var(--ui-fg)] border-[var(--accent)]'
                                    : 'text-[var(--ui-fg-muted)] border-transparent hover:text-[var(--ui-fg)]'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="p-8 max-w-4xl">
                {loading && !readme ? (
                    <div className="flex items-center justify-center py-12">
                        <FontAwesomeIcon
                            icon={faSpinner}
                            className="animate-spin text-2xl text-[var(--accent)]"
                        />
                    </div>
                ) : (
                    <>
                        {activeTab === 'details' && (
                            <div className="animate-in fade-in duration-300">
                                {/* README */}
                                {readme ? (
                                    <div className="mb-12">
                                        <div className="mb-12">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                rehypePlugins={[
                                                    rehypeRaw as any,
                                                ]}
                                                components={
                                                    MarkdownComponents as any
                                                }
                                            >
                                                {readme}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-[var(--ui-fg-muted)] italic mb-12">
                                        No README available.
                                    </div>
                                )}

                                {/* Metadata Sidebar Type Info */}
                                <div className="grid grid-cols-[200px_1fr] gap-4 text-sm border-t border-[var(--ui-border)] pt-8">
                                    {extension.categories &&
                                        extension.categories.length > 0 && (
                                            <>
                                                <div className="text-[var(--ui-fg-muted)]">
                                                    Categories
                                                </div>
                                                <div className="text-[var(--ui-fg)]">
                                                    {extension.categories.join(
                                                        ', '
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    {extension.tags &&
                                        extension.tags.length > 0 && (
                                            <>
                                                <div className="text-[var(--ui-fg-muted)]">
                                                    Tags
                                                </div>
                                                <div className="text-[var(--ui-fg)]">
                                                    {extension.tags.join(', ')}
                                                </div>
                                            </>
                                        )}
                                    {extension.publishedDate && (
                                        <>
                                            <div className="text-[var(--ui-fg-muted)]">
                                                Published
                                            </div>
                                            <div className="text-[var(--ui-fg)]">
                                                {formatDate(
                                                    extension.publishedDate
                                                )}
                                            </div>
                                        </>
                                    )}
                                    {extension.lastUpdated && (
                                        <>
                                            <div className="text-[var(--ui-fg-muted)]">
                                                Last Updated
                                            </div>
                                            <div className="text-[var(--ui-fg)]">
                                                {formatDate(
                                                    extension.lastUpdated
                                                )}
                                            </div>
                                        </>
                                    )}
                                    {extension.namespace && (
                                        <>
                                            <div className="text-[var(--ui-fg-muted)]">
                                                Publisher
                                            </div>
                                            <div className="text-[var(--ui-fg)] hover:text-[var(--accent)] cursor-pointer transition-colors">
                                                {extension.namespace}
                                            </div>
                                        </>
                                    )}
                                    <div className="text-[var(--ui-fg-muted)]">
                                        License
                                    </div>
                                    <div className="text-[var(--ui-fg)]">
                                        MIT
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'changelog' && (
                            <div className="animate-in fade-in duration-300">
                                {fetchingChangelog ? (
                                    <div className="flex items-center justify-center py-12">
                                        <FontAwesomeIcon
                                            icon={faSpinner}
                                            className="animate-spin text-2xl text-[var(--accent)]"
                                        />
                                    </div>
                                ) : changelog ? (
                                    <div className="mb-12">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={
                                                MarkdownComponents as any
                                            }
                                        >
                                            {changelog}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    <div className="text-[var(--ui-fg-muted)] italic mb-12">
                                        No changelog available.
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'dependencies' && (
                            <div className="animate-in fade-in duration-300">
                                {dependencies.length > 0 ? (
                                    <div className="space-y-4">
                                        <p className="text-[var(--ui-fg-muted)] mb-4">
                                            This extension depends on the
                                            following extensions:
                                        </p>
                                        <ul className="space-y-2">
                                            {dependencies.map((dep) => (
                                                <li
                                                    key={dep}
                                                    className="flex items-center gap-2 text-[var(--ui-fg)] bg-[var(--ui-bg)] p-3 rounded"
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faBoxOpen}
                                                        className="text-[var(--accent)]"
                                                    />
                                                    {dep}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-[var(--ui-fg-muted)]">
                                        <FontAwesomeIcon
                                            icon={faCheckCircle}
                                            className="text-4xl mb-4 opacity-50"
                                        />
                                        <div className="text-lg">
                                            No Dependencies
                                        </div>
                                        <div className="text-sm">
                                            This extension does not require any
                                            other extensions.
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
