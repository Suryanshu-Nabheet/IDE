import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRotateRight, faCheck } from '@fortawesome/pro-regular-svg-icons'
import { useAppSelector } from '../app/hooks'
import { getRootPath } from '../features/selectors'

interface GitStatusFile {
    status: string
    file: string
}

export const GitPane = () => {
    const rootPath = useAppSelector(getRootPath)
    const [statusFiles, setStatusFiles] = useState<GitStatusFile[]>([])
    const [commitMessage, setCommitMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const fetchStatus = async () => {
        if (!rootPath) return
        setLoading(true)
        try {
            // @ts-ignore
            const status = await connector.gitStatus(rootPath)
            if (Array.isArray(status)) setStatusFiles(status)
        } catch (e) {
            console.error('Failed to get git status', e)
        } finally {
            setLoading(false)
        }
    }

    const handleCommit = async () => {
        if (!rootPath || !commitMessage) return
        setLoading(true)
        try {
            // @ts-ignore
            await connector.gitCommit(rootPath, commitMessage)
            setCommitMessage('')
            await fetchStatus()
        } catch (e) {
            console.error('Commit failed', e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStatus()
        // Poll every 5 seconds
        const interval = setInterval(fetchStatus, 5000)
        return () => clearInterval(interval)
    }, [rootPath])

    if (!rootPath)
        return (
            <div className="p-4 text-center opacity-50">
                Open a folder to use Source Control
            </div>
        )

    return (
        <div className="flex flex-col h-full bg-ui-bg">
            <div className="left-pane-header flex justify-between items-center px-4 py-2 border-b border-ui-border">
                <span className="font-semibold uppercase text-xs tracking-wider opacity-70">
                    Source Control
                </span>
                <button
                    onClick={fetchStatus}
                    className={`hover:text-accent transition-colors ${
                        loading ? 'animate-spin' : ''
                    }`}
                    title="Refresh Status"
                >
                    <FontAwesomeIcon icon={faRotateRight} />
                </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
                {statusFiles.length === 0 ? (
                    <div className="text-center opacity-50 text-sm mt-10">
                        No changes detected.
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-black/20 rounded p-3 border border-white/5">
                            <input
                                type="text"
                                className="w-full bg-transparent outline-none text-sm placeholder:text-ui-fg-muted/50"
                                placeholder="Message (Enter to commit)"
                                value={commitMessage}
                                onChange={(e) =>
                                    setCommitMessage(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (
                                        e.key === 'Enter' &&
                                        (e.metaKey || e.ctrlKey)
                                    )
                                        handleCommit()
                                }}
                            />
                            <div className="flex justify-end mt-2">
                                <button
                                    className="primary-button text-xs px-3 py-1 flex items-center gap-2"
                                    onClick={handleCommit}
                                    disabled={!commitMessage || loading}
                                >
                                    <FontAwesomeIcon icon={faCheck} />
                                    Commit
                                </button>
                            </div>
                        </div>

                        <div>
                            <div className="text-xs font-semibold uppercase opacity-50 mb-2">
                                Changes ({statusFiles.length})
                            </div>
                            <div className="space-y-1">
                                {statusFiles.map((file, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-2 text-sm p-1 hover:bg-white/5 rounded cursor-default group"
                                    >
                                        <span
                                            className={`
                                            w-4 h-4 flex items-center justify-center rounded-sm text-[10px] font-bold
                                            ${
                                                file.status.includes('M')
                                                    ? 'text-yellow-400'
                                                    : ''
                                            }
                                            ${
                                                file.status.includes('A') ||
                                                file.status.includes('?')
                                                    ? 'text-green-400'
                                                    : ''
                                            }
                                            ${
                                                file.status.includes('D')
                                                    ? 'text-red-400'
                                                    : ''
                                            }
                                        `}
                                        >
                                            {file.status
                                                .trim()
                                                .substring(0, 1) || 'M'}
                                        </span>
                                        <span className="truncate opacity-80 group-hover:opacity-100">
                                            {file.file}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
