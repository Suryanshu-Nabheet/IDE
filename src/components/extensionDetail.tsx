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
import {
    installExtension,
    uninstallExtension,
    Extension,
} from '../features/extensions/extensionsSlice'
import * as exsel from '../features/extensions/extensionsSelectors'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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
                className="text-2xl font-bold mb-4 mt-6 text-white border-b border-white/10 pb-2"
                {...props}
            />
        ),
        h2: ({ ...props }: any) => (
            <h2 className="text-xl font-bold mb-3 mt-5 text-white" {...props} />
        ),
        h3: ({ ...props }: any) => (
            <h3 className="text-lg font-bold mb-2 mt-4 text-white" {...props} />
        ),
        p: ({ ...props }: any) => (
            <p className="mb-4 leading-relaxed text-gray-300" {...props} />
        ),
        ul: ({ ...props }: any) => (
            <ul
                className="list-disc list-inside mb-4 ml-2 space-y-1 text-gray-300"
                {...props}
            />
        ),
        ol: ({ ...props }: any) => (
            <ol
                className="list-decimal list-inside mb-4 ml-2 space-y-1 text-gray-300"
                {...props}
            />
        ),
        li: ({ ...props }: any) => <li className="pl-1" {...props} />,
        a: ({ ...props }: any) => (
            <a
                className="text-[#0e639c] hover:underline cursor-pointer"
                {...props}
            />
        ),
        blockquote: ({ ...props }: any) => (
            <blockquote
                className="border-l-4 border-[#0e639c] pl-4 italic text-gray-400 mb-4 bg-white/5 py-2 pr-2 rounded-r"
                {...props}
            />
        ),
        code: ({ inline, className, children, ...props }: any) => {
            return !inline ? (
                <div className="relative mb-4">
                    <pre className="bg-[#1a1a1a] p-4 rounded-lg overflow-x-auto border border-white/5 text-sm font-mono text-gray-200">
                        <code className={className} {...props}>
                            {children}
                        </code>
                    </pre>
                </div>
            ) : (
                <code
                    className="bg-white/10 rounded px-1.5 py-0.5 font-mono text-xs text-gray-200"
                    {...props}
                >
                    {children}
                </code>
            )
        },
        img: ({ ...props }: any) => (
            <img
                className="max-w-full rounded-lg border border-white/5 my-4 shadow-md"
                {...props}
            />
        ),
        table: ({ ...props }: any) => (
            <div className="overflow-x-auto mb-4 border border-white/10 rounded-lg">
                <table
                    className="min-w-full divide-y divide-white/10"
                    {...props}
                />
            </div>
        ),
        thead: ({ ...props }: any) => (
            <thead className="bg-white/5" {...props} />
        ),
        th: ({ ...props }: any) => (
            <th
                className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                {...props}
            />
        ),
        tbody: ({ ...props }: any) => (
            <tbody className="divide-y divide-white/5" {...props} />
        ),
        tr: ({ ...props }: any) => (
            <tr className="hover:bg-white/5 transition-colors" {...props} />
        ),
        td: ({ ...props }: any) => (
            <td
                className="px-3 py-2 text-sm text-gray-300 whitespace-pre-wrap"
                {...props}
            />
        ),
    }

    return (
        <div className="w-full h-full bg-[#000000] text-[#cccccc] overflow-y-auto font-sans">
            {/* Header */}
            <div className="border-b border-white/5 p-8">
                <div className="flex items-start gap-6">
                    {/* Icon */}
                    <div className="w-32 h-32 rounded-lg bg-[#1a1a1a] border border-white/5 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-lg">
                        {extension.files?.icon ? (
                            <img
                                src={extension.files.icon}
                                alt={extension.displayName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <FontAwesomeIcon
                                icon={faBoxOpen}
                                className="text-5xl text-gray-600"
                            />
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-semibold text-white mb-2">
                                    {extension.displayName || extension.name}
                                </h1>
                                <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                                    <FontAwesomeIcon
                                        icon={faCheckCircle}
                                        className="text-blue-500"
                                    />
                                    {extension.namespace}
                                </div>
                            </div>
                        </div>

                        <p className="text-base text-gray-300 mb-6 leading-relaxed max-w-3xl">
                            {extension.description}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
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
                                    className="px-6 py-2 text-sm font-medium bg-[#0e639c] text-white rounded hover:bg-[#1177bb] transition-colors shadow-sm"
                                >
                                    Uninstall
                                </button>
                            ) : (
                                <button
                                    onClick={handleInstall}
                                    className="px-6 py-2 text-sm font-medium bg-[#0e639c] text-white rounded hover:bg-[#1177bb] transition-colors shadow-sm"
                                >
                                    Install
                                </button>
                            )}
                            {extension.files?.download && (
                                <a
                                    href={extension.files.download}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-2 text-sm font-medium bg-white/5 text-gray-300 border border-white/5 rounded hover:bg-white/10 transition-colors inline-flex items-center gap-2"
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
            <div className="border-b border-white/5 px-8 sticky top-0 bg-[#000000]/95 backdrop-blur z-10">
                <div className="flex gap-8">
                    {['details', 'changelog', 'dependencies'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`py-4 text-sm font-medium capitalize border-b-2 transition-colors ${
                                activeTab === tab
                                    ? 'text-white border-[#0e639c]'
                                    : 'text-gray-500 border-transparent hover:text-gray-300'
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
                            className="animate-spin text-2xl text-[#0e639c]"
                        />
                    </div>
                ) : (
                    <>
                        {activeTab === 'details' && (
                            <div className="animate-in fade-in duration-300">
                                {/* README */}
                                {readme ? (
                                    <div className="mb-12">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={
                                                MarkdownComponents as any
                                            }
                                        >
                                            {readme}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    <div className="text-gray-500 italic mb-12">
                                        No README available.
                                    </div>
                                )}

                                {/* Metadata Sidebar Type Info */}
                                <div className="grid grid-cols-[200px_1fr] gap-4 text-sm border-t border-white/5 pt-8">
                                    {extension.categories &&
                                        extension.categories.length > 0 && (
                                            <>
                                                <div className="text-gray-500">
                                                    Categories
                                                </div>
                                                <div className="text-gray-300">
                                                    {extension.categories.join(
                                                        ', '
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    {extension.tags &&
                                        extension.tags.length > 0 && (
                                            <>
                                                <div className="text-gray-500">
                                                    Tags
                                                </div>
                                                <div className="text-gray-300">
                                                    {extension.tags.join(', ')}
                                                </div>
                                            </>
                                        )}
                                    {extension.publishedDate && (
                                        <>
                                            <div className="text-gray-500">
                                                Published
                                            </div>
                                            <div className="text-gray-300">
                                                {formatDate(
                                                    extension.publishedDate
                                                )}
                                            </div>
                                        </>
                                    )}
                                    {extension.lastUpdated && (
                                        <>
                                            <div className="text-gray-500">
                                                Last Updated
                                            </div>
                                            <div className="text-gray-300">
                                                {formatDate(
                                                    extension.lastUpdated
                                                )}
                                            </div>
                                        </>
                                    )}
                                    {extension.namespace && (
                                        <>
                                            <div className="text-gray-500">
                                                Publisher
                                            </div>
                                            <div className="text-gray-300 hover:text-[#0e639c] cursor-pointer transition-colors">
                                                {extension.namespace}
                                            </div>
                                        </>
                                    )}
                                    <div className="text-gray-500">License</div>
                                    <div className="text-gray-300">MIT</div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'changelog' && (
                            <div className="animate-in fade-in duration-300">
                                {fetchingChangelog ? (
                                    <div className="flex items-center justify-center py-12">
                                        <FontAwesomeIcon
                                            icon={faSpinner}
                                            className="animate-spin text-2xl text-[#0e639c]"
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
                                    <div className="text-gray-500 italic mb-12">
                                        No changelog available.
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'dependencies' && (
                            <div className="animate-in fade-in duration-300">
                                {dependencies.length > 0 ? (
                                    <div className="space-y-4">
                                        <p className="text-gray-400 mb-4">
                                            This extension depends on the
                                            following extensions:
                                        </p>
                                        <ul className="space-y-2">
                                            {dependencies.map((dep) => (
                                                <li
                                                    key={dep}
                                                    className="flex items-center gap-2 text-gray-300 bg-white/5 p-3 rounded"
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faBoxOpen}
                                                        className="text-[#0e639c]"
                                                    />
                                                    {dep}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
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
