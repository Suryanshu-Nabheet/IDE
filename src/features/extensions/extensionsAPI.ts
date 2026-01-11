/**
 * Extensions API Service
 * Handles all interactions with the Open VSX Registry API
 */

import { Extension } from './extensionsSlice'

const OPENVSX_API_BASE = 'https://open-vsx.org/api'

export interface ExtensionSearchOptions {
    query?: string
    category?: string
    size?: number
    offset?: number
    sortBy?: 'relevance' | 'downloadCount' | 'averageRating' | 'timestamp'
    sortOrder?: 'asc' | 'desc'
}

export interface ExtensionDetails extends Extension {
    readme?: string
    changelog?: string
    license?: string
    repository?: string
    bugs?: string
    homepage?: string
    dependencies?: string[]
}

/**
 * Search for extensions in the Open VSX Registry
 */
export async function searchExtensions(
    options: ExtensionSearchOptions
): Promise<Extension[]> {
    const params = new URLSearchParams()

    if (options.query) params.append('query', options.query)
    if (options.category) params.append('category', options.category)
    if (options.size) params.append('size', options.size.toString())
    if (options.offset) params.append('offset', options.offset.toString())
    if (options.sortBy) params.append('sortBy', options.sortBy)
    if (options.sortOrder) params.append('sortOrder', options.sortOrder)

    const url = `${OPENVSX_API_BASE}/-/search?${params.toString()}`

    try {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        return normalizeExtensions(data.extensions || [])
    } catch (error) {
        console.error('Failed to search extensions:', error)
        return []
    }
}

/**
 * Get detailed information about a specific extension
 */
export async function getExtensionDetails(
    namespace: string,
    name: string,
    version?: string
): Promise<ExtensionDetails | null> {
    const versionPath = version ? `/${version}` : ''
    const url = `${OPENVSX_API_BASE}/${namespace}/${name}${versionPath}`

    try {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        const extension = normalizeExtension(data)

        // Fetch additional content if available
        const details: ExtensionDetails = { ...extension }

        if (data.files?.readme) {
            details.readme = await fetchTextFile(data.files.readme)
        }

        if (data.files?.changelog) {
            details.changelog = await fetchTextFile(data.files.changelog)
        }

        if (data.files?.license) {
            details.license = await fetchTextFile(data.files.license)
        }

        // Get dependencies from manifest
        if (data.files?.manifest) {
            const manifest = await fetchJsonFile(data.files.manifest)
            if (manifest?.extensionDependencies) {
                details.dependencies = manifest.extensionDependencies
            }
        }

        return details
    } catch (error) {
        console.error('Failed to get extension details:', error)
        return null
    }
}

/**
 * Get popular/featured extensions
 */
export async function getPopularExtensions(limit = 50): Promise<Extension[]> {
    const categories = [
        'Programming Languages',
        'Themes',
        'Snippets',
        'Formatters',
        'Linters',
        'Debuggers',
        'Extension Packs',
    ]

    const allExtensions: Extension[] = []

    // Fetch top extensions from each category
    for (const category of categories) {
        try {
            const extensions = await searchExtensions({
                category,
                size: 10,
                sortBy: 'downloadCount',
                sortOrder: 'desc',
            })
            allExtensions.push(...extensions)
        } catch (error) {
            console.error(`Failed to fetch category ${category}:`, error)
        }
    }

    // Remove duplicates based on namespace.name
    const uniqueExtensions = Array.from(
        new Map(
            allExtensions.map((ext) => [`${ext.namespace}.${ext.name}`, ext])
        ).values()
    )

    // Sort by download count and limit
    return uniqueExtensions
        .sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0))
        .slice(0, limit)
}

/**
 * Get extensions by category
 */
export async function getExtensionsByCategory(
    category: string,
    limit = 20
): Promise<Extension[]> {
    return searchExtensions({
        category,
        size: limit,
        sortBy: 'downloadCount',
        sortOrder: 'desc',
    })
}

/**
 * Get trending extensions (recently updated with high download counts)
 */
export async function getTrendingExtensions(limit = 20): Promise<Extension[]> {
    return searchExtensions({
        size: limit,
        sortBy: 'timestamp',
        sortOrder: 'desc',
    })
}

/**
 * Normalize extension data from API
 */
function normalizeExtension(ext: any): Extension {
    const extensionId =
        ext.namespace && ext.name
            ? `${ext.namespace}.${ext.name}`
            : ext.extensionId

    // Ensure files object exists with download URL
    const files = ext.files || {}

    // If no download URL, construct it from namespace/name/version
    if (!files.download && ext.namespace && ext.name) {
        const versionPath = ext.version ? `/${ext.version}` : ''
        files.download = `${OPENVSX_API_BASE}/${ext.namespace}/${ext.name}${versionPath}/file/download`
    }

    // Ensure icon URL is present
    if (!files.icon && ext.namespace && ext.name) {
        const versionPath = ext.version ? `/${ext.version}` : ''
        files.icon = `${OPENVSX_API_BASE}/${ext.namespace}/${ext.name}${versionPath}/file/icon`
    }

    return {
        ...ext,
        extensionId,
        downloadCount: ext.downloadCount || 0,
        averageRating: ext.averageRating || 0,
        reviewCount: ext.reviewCount || 0,
        categories: ext.categories || [],
        tags: ext.tags || [],
        files,
    }
}

/**
 * Normalize array of extensions
 */
function normalizeExtensions(extensions: any[]): Extension[] {
    return extensions.map(normalizeExtension)
}

/**
 * Fetch a text file from a URL
 */
async function fetchTextFile(url: string): Promise<string> {
    try {
        const response = await fetch(url)
        if (!response.ok) return ''
        return await response.text()
    } catch (error) {
        console.error('Failed to fetch text file:', error)
        return ''
    }
}

/**
 * Fetch a JSON file from a URL
 */
async function fetchJsonFile(url: string): Promise<any> {
    try {
        const response = await fetch(url)
        if (!response.ok) return null
        return await response.json()
    } catch (error) {
        console.error('Failed to fetch JSON file:', error)
        return null
    }
}

/**
 * Get extension icon URL
 */
export function getExtensionIconUrl(
    namespace: string,
    name: string,
    version?: string
): string {
    const versionPath = version ? `/${version}` : ''
    return `${OPENVSX_API_BASE}/${namespace}/${name}${versionPath}/file/icon`
}

/**
 * Get extension download URL
 */
export function getExtensionDownloadUrl(
    namespace: string,
    name: string,
    version?: string
): string {
    const versionPath = version ? `/${version}` : ''
    return `${OPENVSX_API_BASE}/${namespace}/${name}${versionPath}/file/download`
}
