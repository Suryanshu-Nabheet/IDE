import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faCodeBranch,
    faCircleCheck,
    faCircleExclamation,
    faBell,
    faTowerBroadcast,
} from '@fortawesome/pro-regular-svg-icons'
import { useAppSelector } from '../app/hooks'
import { getRootPath, getCurrentFileId } from '../features/selectors'

export const StatusBar = () => {
    const rootPath = useAppSelector(getRootPath)
    const activeFileId = useAppSelector(getCurrentFileId)
    const state = useAppSelector((state) => state.global)

    const [gitBranch, setGitBranch] = useState<string | null>(null)
    const [gitChanges, setGitChanges] = useState(0)
    const [isRepo, setIsRepo] = useState(false)
    const [diagnosticsCount, setDiagnosticsCount] = useState({
        errors: 0,
        warnings: 0,
    })
    const [fileInfo, setFileInfo] = useState({
        language: 'Plain Text',
        encoding: 'UTF-8',
        lineEnding: 'LF',
        indentation: 'Spaces: 4',
    })

    // Fetch Git information
    const fetchGitInfo = async () => {
        if (!rootPath) {
            setIsRepo(false)
            return
        }

        try {
            // @ts-ignore
            const repoCheck = await connector.gitIsRepo(rootPath)
            if (!repoCheck.isRepo) {
                setIsRepo(false)
                return
            }

            setIsRepo(true)

            // @ts-ignore
            const branchResult = await connector.gitCurrentBranch(rootPath)
            if (branchResult.success) {
                setGitBranch(branchResult.branch)
            }

            // @ts-ignore
            const status = await connector.gitStatus(rootPath)
            if (Array.isArray(status)) {
                setGitChanges(status.length)
            }
        } catch (e) {
            setIsRepo(false)
        }
    }

    // Get diagnostics from language server
    const fetchDiagnostics = () => {
        if (!activeFileId || !state.files || !state.files[activeFileId]) return

        const filePath = getFilePathFromId(activeFileId)

        // Count errors and warnings from diagnostics
        let errors = 0
        let warnings = 0

        // Check if we have diagnostics for this file
        const diagnostics = (state as any).fileDiagnostics?.[filePath] || []
        diagnostics.forEach((diag: any) => {
            if (diag.severity === 1) errors++ // Error
            else if (diag.severity === 2) warnings++ // Warning
        })

        setDiagnosticsCount({ errors, warnings })
    }

    // Get file path from ID
    const getFilePathFromId = (fileId: number): string => {
        if (!state.files || !state.files[fileId]) return ''

        const file = state.files[fileId]
        if (!file) return ''

        const parts: string[] = [file.name]
        let currentFolderId = file.parentFolderId

        while (currentFolderId != null && state.folders) {
            const folder = state.folders[currentFolderId]
            if (!folder) break
            parts.unshift(folder.name)
            currentFolderId = folder.parentFolderId
        }

        return parts.join('/')
    }

    // Detect file language
    const detectLanguage = (fileName: string): string => {
        const ext = fileName.split('.').pop()?.toLowerCase()
        const languageMap: { [key: string]: string } = {
            ts: 'TypeScript',
            tsx: 'TypeScript JSX',
            js: 'JavaScript',
            jsx: 'JavaScript JSX',
            py: 'Python',
            java: 'Java',
            cpp: 'C++',
            c: 'C',
            rs: 'Rust',
            go: 'Go',
            rb: 'Ruby',
            php: 'PHP',
            html: 'HTML',
            css: 'CSS',
            scss: 'SCSS',
            json: 'JSON',
            md: 'Markdown',
            yaml: 'YAML',
            yml: 'YAML',
            xml: 'XML',
            sh: 'Shell',
            sql: 'SQL',
        }
        return languageMap[ext || ''] || 'Plain Text'
    }

    // Update file info when active file changes
    useEffect(() => {
        if (activeFileId && state.files[activeFileId]) {
            const file = state.files[activeFileId]
            const language = detectLanguage(file.name)
            setFileInfo({
                language,
                encoding: 'UTF-8',
                lineEnding: 'LF',
                indentation: 'Spaces: 4',
            })
        }
    }, [activeFileId])

    // Poll Git info
    useEffect(() => {
        fetchGitInfo()
        const interval = setInterval(fetchGitInfo, 3000)
        return () => clearInterval(interval)
    }, [rootPath])

    // Update diagnostics
    useEffect(() => {
        fetchDiagnostics()
    }, [activeFileId, state.fileDiagnostics])

    const totalProblems = diagnosticsCount.errors + diagnosticsCount.warnings

    return (
        <div className="status-bar">
            <div className="status-bar__left">
                <div
                    className="status-bar__item status-bar__item--main"
                    title="Language Server Status"
                >
                    <FontAwesomeIcon icon={faTowerBroadcast} className="mr-2" />
                    <span>Connected</span>
                </div>
                {isRepo && gitBranch && (
                    <div className="status-bar__item" title="Git Branch">
                        <FontAwesomeIcon icon={faCodeBranch} className="mr-2" />
                        <span>
                            {gitBranch}
                            {gitChanges > 0 && `*`}
                        </span>
                    </div>
                )}
                <div
                    className="status-bar__item"
                    title={`${diagnosticsCount.errors} errors, ${diagnosticsCount.warnings} warnings`}
                >
                    <FontAwesomeIcon
                        icon={
                            diagnosticsCount.errors > 0
                                ? faCircleExclamation
                                : faCircleCheck
                        }
                        className={`mr-2 ${
                            diagnosticsCount.errors > 0
                                ? 'text-red-400'
                                : diagnosticsCount.warnings > 0
                                ? 'text-yellow-400'
                                : 'text-green-400'
                        }`}
                    />
                    <span>{totalProblems}</span>
                </div>
            </div>

            <div className="status-bar__center">
                <span style={{ fontSize: '10px', opacity: 0.5 }}>
                    © 2026 CodeX IDE - Built By Suryanshu Nabheet
                </span>
            </div>

            <div className="status-bar__right">
                <div className="status-bar__item" title="Indentation">
                    <span>{fileInfo.indentation}</span>
                </div>
                <div className="status-bar__item" title="Encoding">
                    <span>{fileInfo.encoding}</span>
                </div>
                <div className="status-bar__item" title="Line Ending">
                    <span>{fileInfo.lineEnding}</span>
                </div>
                <div className="status-bar__item" title="Language Mode">
                    <span>{fileInfo.language}</span>
                </div>
                <div className="status-bar__item" title="Notifications">
                    <FontAwesomeIcon icon={faBell} />
                </div>
            </div>
        </div>
    )
}
