import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faRotateRight,
    faCheck,
    faCodeBranch,
    faArrowUp,
    faArrowDown,
    faPlus,
    faCodePullRequest,
    faCloudArrowUp,
    faCloudArrowDown,
} from '@fortawesome/pro-regular-svg-icons'
import { useAppSelector } from '../app/hooks'
import { getRootPath } from '../features/selectors'

interface GitStatusFile {
    status: string
    file: string
}

interface GitBranch {
    name: string
    current: boolean
}

interface GitRemote {
    name: string
    url: string
    type: string
}

export const GitPane = () => {
    const rootPath = useAppSelector(getRootPath)
    const [statusFiles, setStatusFiles] = useState<GitStatusFile[]>([])
    const [commitMessage, setCommitMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [isRepo, setIsRepo] = useState(false)
    const [currentBranch, setCurrentBranch] = useState<string>('')
    const [branches, setBranches] = useState<GitBranch[]>([])
    const [remotes, setRemotes] = useState<GitRemote[]>([])
    const [showBranchMenu, setShowBranchMenu] = useState(false)
    const [newBranchName, setNewBranchName] = useState('')
    const [showRemoteMenu, setShowRemoteMenu] = useState(false)
    const [remoteName, setRemoteName] = useState('')
    const [remoteUrl, setRemoteUrl] = useState('')

    const checkIfRepo = async () => {
        if (!rootPath) return
        try {
            // @ts-ignore
            const result = await connector.gitIsRepo(rootPath)
            setIsRepo(result.isRepo)
            if (result.isRepo) {
                fetchGitInfo()
            }
        } catch (e) {
            setIsRepo(false)
        }
    }

    const fetchGitInfo = async () => {
        if (!rootPath) return
        setLoading(true)
        try {
            // @ts-ignore
            const branchResult = await connector.gitCurrentBranch(rootPath)
            if (branchResult.success) {
                setCurrentBranch(branchResult.branch)
            }

            // @ts-ignore
            const branchesResult = await connector.gitBranches(rootPath)
            if (branchesResult.success) {
                setBranches(branchesResult.branches)
            }

            // @ts-ignore
            const remotesResult = await connector.gitRemotes(rootPath)
            if (remotesResult.success) {
                setRemotes(remotesResult.remotes)
            }

            // @ts-ignore
            const status = await connector.gitStatus(rootPath)
            if (Array.isArray(status)) setStatusFiles(status)
        } catch (e) {
            console.error('Failed to get git info', e)
        } finally {
            setLoading(false)
        }
    }

    const handleInitRepo = async () => {
        if (!rootPath) return
        setLoading(true)
        try {
            // @ts-ignore
            const result = await connector.gitInit(rootPath)
            if (result.success) {
                setIsRepo(true)
                await fetchGitInfo()
            }
        } catch (e) {
            console.error('Failed to init repo', e)
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
            await fetchGitInfo()
        } catch (e) {
            console.error('Commit failed', e)
        } finally {
            setLoading(false)
        }
    }

    const handlePush = async () => {
        if (!rootPath) return
        setLoading(true)
        try {
            // @ts-ignore
            const result = await connector.gitPush(rootPath)
            if (result.success) {
                console.log('Push successful:', result.output)
            } else {
                console.error('Push failed:', result.error)
            }
            await fetchGitInfo()
        } catch (e) {
            console.error('Push failed', e)
        } finally {
            setLoading(false)
        }
    }

    const handlePull = async () => {
        if (!rootPath) return
        setLoading(true)
        try {
            // @ts-ignore
            const result = await connector.gitPull(rootPath)
            if (result.success) {
                console.log('Pull successful:', result.output)
            } else {
                console.error('Pull failed:', result.error)
            }
            await fetchGitInfo()
        } catch (e) {
            console.error('Pull failed', e)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateBranch = async () => {
        if (!rootPath || !newBranchName) return
        setLoading(true)
        try {
            // @ts-ignore
            await connector.gitCreateBranch(rootPath, newBranchName)
            setNewBranchName('')
            setShowBranchMenu(false)
            await fetchGitInfo()
        } catch (e) {
            console.error('Create branch failed', e)
        } finally {
            setLoading(false)
        }
    }

    const handleCheckout = async (branch: string) => {
        if (!rootPath) return
        setLoading(true)
        try {
            // @ts-ignore
            await connector.gitCheckout(rootPath, branch)
            setShowBranchMenu(false)
            await fetchGitInfo()
        } catch (e) {
            console.error('Checkout failed', e)
        } finally {
            setLoading(false)
        }
    }

    const handleAddRemote = async () => {
        if (!rootPath || !remoteName || !remoteUrl) return
        setLoading(true)
        try {
            // @ts-ignore
            await connector.gitAddRemote(rootPath, remoteName, remoteUrl)
            setRemoteName('')
            setRemoteUrl('')
            setShowRemoteMenu(false)
            await fetchGitInfo()
        } catch (e) {
            console.error('Add remote failed', e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        checkIfRepo()
        const interval = setInterval(checkIfRepo, 5000)
        return () => clearInterval(interval)
    }, [rootPath])

    if (!rootPath)
        return (
            <div className="p-4 text-center opacity-50">
                Open a folder to use Source Control
            </div>
        )

    if (!isRepo) {
        return (
            <div className="flex flex-col h-full bg-ui-bg p-4">
                <div className="text-center opacity-70 mb-4">
                    This folder is not a Git repository
                </div>
                <button
                    onClick={handleInitRepo}
                    className="primary-button px-4 py-2"
                    disabled={loading}
                >
                    <FontAwesomeIcon icon={faCodeBranch} className="mr-2" />
                    Initialize Repository
                </button>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-ui-bg">
            <div className="left-pane-header flex justify-between items-center px-4 py-2 border-b border-ui-border">
                <span className="font-semibold uppercase text-xs tracking-wider opacity-70">
                    Source Control
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={handlePull}
                        className="hover:text-accent transition-colors"
                        title="Pull"
                        disabled={loading}
                    >
                        <FontAwesomeIcon icon={faCloudArrowDown} />
                    </button>
                    <button
                        onClick={handlePush}
                        className="hover:text-accent transition-colors"
                        title="Push"
                        disabled={loading}
                    >
                        <FontAwesomeIcon icon={faCloudArrowUp} />
                    </button>
                    <button
                        onClick={fetchGitInfo}
                        className={`hover:text-accent transition-colors ${
                            loading ? 'animate-spin' : ''
                        }`}
                        title="Refresh Status"
                    >
                        <FontAwesomeIcon icon={faRotateRight} />
                    </button>
                </div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
                {/* Branch Info */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm">
                            <FontAwesomeIcon
                                icon={faCodeBranch}
                                className="text-accent"
                            />
                            <span className="font-semibold">
                                {currentBranch}
                            </span>
                        </div>
                        <button
                            onClick={() => setShowBranchMenu(!showBranchMenu)}
                            className="text-xs hover:text-accent transition-colors"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                        </button>
                    </div>

                    {showBranchMenu && (
                        <div className="bg-black/20 rounded p-3 border border-white/5 mb-2 space-y-2">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 bg-transparent outline-none text-xs placeholder:text-ui-fg-muted/50 border border-white/10 rounded px-2 py-1"
                                    placeholder="New branch name"
                                    value={newBranchName}
                                    onChange={(e) =>
                                        setNewBranchName(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter')
                                            handleCreateBranch()
                                    }}
                                />
                                <button
                                    className="primary-button text-xs px-2 py-1"
                                    onClick={handleCreateBranch}
                                    disabled={!newBranchName || loading}
                                >
                                    Create
                                </button>
                            </div>
                            <div className="text-xs opacity-50 mb-1">
                                Switch to:
                            </div>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                                {branches.map((branch, i) => (
                                    <div
                                        key={i}
                                        className={`text-xs p-1 rounded cursor-pointer hover:bg-white/5 ${
                                            branch.current
                                                ? 'text-accent font-semibold'
                                                : ''
                                        }`}
                                        onClick={() =>
                                            !branch.current &&
                                            handleCheckout(branch.name)
                                        }
                                    >
                                        {branch.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Remotes */}
                {remotes.length > 0 && (
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-xs font-semibold uppercase opacity-50">
                                Remotes
                            </div>
                            <button
                                onClick={() =>
                                    setShowRemoteMenu(!showRemoteMenu)
                                }
                                className="text-xs hover:text-accent transition-colors"
                            >
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                        <div className="space-y-1">
                            {remotes
                                .filter((r) => r.type === 'fetch')
                                .map((remote, i) => (
                                    <div
                                        key={i}
                                        className="text-xs p-1 rounded hover:bg-white/5"
                                    >
                                        <div className="font-semibold">
                                            {remote.name}
                                        </div>
                                        <div className="opacity-50 truncate">
                                            {remote.url}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {showRemoteMenu && (
                    <div className="bg-black/20 rounded p-3 border border-white/5 mb-4 space-y-2">
                        <input
                            type="text"
                            className="w-full bg-transparent outline-none text-xs placeholder:text-ui-fg-muted/50 border border-white/10 rounded px-2 py-1"
                            placeholder="Remote name (e.g., origin)"
                            value={remoteName}
                            onChange={(e) => setRemoteName(e.target.value)}
                        />
                        <input
                            type="text"
                            className="w-full bg-transparent outline-none text-xs placeholder:text-ui-fg-muted/50 border border-white/10 rounded px-2 py-1"
                            placeholder="Remote URL"
                            value={remoteUrl}
                            onChange={(e) => setRemoteUrl(e.target.value)}
                        />
                        <button
                            className="primary-button text-xs px-3 py-1 w-full"
                            onClick={handleAddRemote}
                            disabled={!remoteName || !remoteUrl || loading}
                        >
                            Add Remote
                        </button>
                    </div>
                )}

                {/* Changes */}
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
                                placeholder="Message (Cmd/Ctrl+Enter to commit)"
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
