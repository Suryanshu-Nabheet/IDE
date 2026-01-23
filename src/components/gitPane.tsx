import React, { useEffect, useState, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faRotateRight,
    faCheck,
    faCodeBranch,
    faPlus,
    faMinus,
    faCloudArrowUp,
    faCloudArrowDown,
    faEllipsis,
    faChevronDown,
    faChevronRight,
} from '@fortawesome/pro-regular-svg-icons'
import { useAppSelector } from '../app/hooks'
import { getRootPath } from '../features/selectors'
import { getIconElement } from './filetree'

interface GitStatusFile {
    status: string
    file: string
}

export const GitPane = () => {
    const rootPath = useAppSelector(getRootPath)

    // State
    const [loading, setLoading] = useState(false)
    const [isRepo, setIsRepo] = useState(false)
    const [commitMessage, setCommitMessage] = useState('')
    const [currentBranch, setCurrentBranch] = useState('')
    const [stagedFiles, setStagedFiles] = useState<GitStatusFile[]>([])
    const [changesFiles, setChangesFiles] = useState<GitStatusFile[]>([])

    // UI State
    const [stagedOpen, setStagedOpen] = useState(true)
    const [changesOpen, setChangesOpen] = useState(true)

    // Initial Check
    const checkIfRepo = useCallback(async () => {
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
    }, [rootPath])

    const fetchGitInfo = async () => {
        if (!rootPath) return
        setLoading(true)
        try {
            // @ts-ignore
            const branchRes = await connector.gitCurrentBranch(rootPath)
            if (branchRes.success) setCurrentBranch(branchRes.branch)

            // @ts-ignore
            const status: GitStatusFile[] = await connector.gitStatus(rootPath)

            if (Array.isArray(status)) {
                const staged: GitStatusFile[] = []
                const changes: GitStatusFile[] = []

                status.forEach((file) => {
                    const s = file.status
                    // Logic for Staged vs Changes
                    // 'M ' -> Staged Modified
                    // 'A ' -> Staged Added
                    // 'D ' -> Staged Deleted
                    // ' M' -> Unstaged Modified
                    // '??' -> Untracked (Changes)

                    // Simple heuristic: First char is index, second is work tree
                    const indexStatus = s[0]
                    const workTreeStatus = s[1]

                    if (indexStatus !== ' ' && indexStatus !== '?') {
                        staged.push({ status: indexStatus, file: file.file })
                    }
                    if (workTreeStatus !== ' ') {
                        changes.push({
                            status:
                                workTreeStatus === '?' ? 'U' : workTreeStatus,
                            file: file.file,
                        })
                    }
                })

                setStagedFiles(staged)
                setChangesFiles(changes)
            }
        } catch (e) {
            console.error(e)
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
            alert('Commit failed.')
        } finally {
            setLoading(false)
        }
    }

    const handleStage = async (file: string) => {
        if (!rootPath) return
        try {
            // @ts-ignore
            await connector.gitAdd(rootPath, file)
            fetchGitInfo()
        } catch (e) {
            console.error(e)
        }
    }

    const handlePush = async () => {
        // @ts-ignore
        if (rootPath) await connector.gitPush(rootPath)
    }

    const handlePull = async () => {
        // @ts-ignore
        if (rootPath) await connector.gitPull(rootPath)
    }

    useEffect(() => {
        checkIfRepo()
        const interval = setInterval(fetchGitInfo, 10000)
        return () => clearInterval(interval)
    }, [checkIfRepo])

    if (!rootPath)
        return (
            <div className="p-5 text-[var(--ui-fg-muted)] text-[13px] text-center">
                No folder opened.
            </div>
        )
    if (!isRepo)
        return (
            <div className="flex flex-col items-center justify-center p-5 text-center h-full text-[var(--foreground)]">
                <p className="text-[var(--ui-fg-muted)] text-[13px] mb-4">
                    No git repository found.
                </p>
                <button
                    className="bg-[var(--button-primary)] text-[var(--white)] px-3 py-1.5 rounded-[2px] text-[13px] hover:bg-[var(--button-primary-hover)]"
                    // @ts-ignore
                    onClick={() =>
                        connector.gitInit(rootPath).then(checkIfRepo)
                    }
                >
                    Initialize Repository
                </button>
            </div>
        )

    return (
        <div className="flex flex-col h-full bg-[var(--sidebar-bg)] text-[var(--sidebar-fg)]">
            {/* Header */}
            <div className="px-4 py-3 pb-2 flex justify-between items-center text-[11px] font-bold uppercase tracking-wider text-[var(--ui-fg-muted)] select-none border-b border-[var(--pane-border)]">
                <span>Source Control</span>
                <div className="flex gap-3 text-[14px]">
                    <button
                        title="View as Tree/List"
                        className="hover:text-[var(--foreground)]"
                    >
                        <FontAwesomeIcon icon={faEllipsis} />
                    </button>
                    <button
                        title="Refresh"
                        onClick={fetchGitInfo}
                        className={`hover:text-[var(--foreground)] ${
                            loading ? 'animate-spin' : ''
                        }`}
                    >
                        <FontAwesomeIcon icon={faRotateRight} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
                {/* Commit Section */}
                <div className="p-4 pb-2">
                    <div className="flex flex-col gap-2">
                        <textarea
                            className="bg-[var(--input-bg)] border border-[var(--input-border)] focus:border-[var(--input-border-focus)] rounded-[2px] p-2 text-[13px] text-[var(--input-fg)] outline-none resize-none placeholder:text-[var(--input-placeholder)] min-h-[32px]"
                            placeholder="Message (Cmd+Enter to commit)"
                            rows={1}
                            style={{ height: 'auto' }}
                            value={commitMessage}
                            onChange={(e) => setCommitMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (
                                    e.key === 'Enter' &&
                                    (e.metaKey || e.ctrlKey)
                                ) {
                                    handleCommit()
                                }
                            }}
                        />
                        <button
                            className="bg-[var(--button-primary)] text-[var(--white)] text-[13px] font-medium py-[5px] rounded-[2px] hover:bg-[var(--button-primary-hover)] flex justify-center items-center gap-2"
                            onClick={handleCommit}
                            disabled={loading || !commitMessage}
                        >
                            <FontAwesomeIcon icon={faCheck} /> Commit
                        </button>
                    </div>
                </div>

                {/* Branch Indicator */}
                <div className="px-4 py-2 flex items-center justify-between text-[13px] border-b border-[var(--pane-border)] hover:bg-[var(--ui-hover)] cursor-pointer">
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon
                            icon={faCodeBranch}
                            className="text-[12px]"
                        />
                        <span>{currentBranch}</span>
                    </div>
                    <div className="flex gap-3 text-[12px] opacity-0 group-hover:opacity-100 hover:opacity-100">
                        <button title="Pull" onClick={handlePull}>
                            <FontAwesomeIcon icon={faCloudArrowDown} />
                        </button>
                        <button title="Push" onClick={handlePush}>
                            <FontAwesomeIcon icon={faCloudArrowUp} />
                        </button>
                    </div>
                </div>

                {/* Staged Changes */}
                {stagedFiles.length > 0 && (
                    <div className="flex flex-col mt-2">
                        <div
                            className="flex items-center px-2 py-1 cursor-pointer hover:bg-[var(--ui-hover)] group select-none"
                            onClick={() => setStagedOpen(!stagedOpen)}
                        >
                            <div className="w-5 text-center text-[var(--ui-fg-muted)] text-[10px]">
                                <FontAwesomeIcon
                                    icon={
                                        stagedOpen
                                            ? faChevronDown
                                            : faChevronRight
                                    }
                                />
                            </div>
                            <span className="text-[11px] font-bold uppercase text-[var(--ui-fg-muted)] tracking-wider">
                                Staged Changes
                            </span>
                            <span className="ml-2 text-[11px] bg-[var(--ui-bg-elevated)] text-[var(--ui-fg)] px-1.5 rounded-full">
                                {stagedFiles.length}
                            </span>
                        </div>
                        {stagedOpen && (
                            <div>
                                {stagedFiles.map((file, idx) => (
                                    <FileItem
                                        key={idx}
                                        file={file}
                                        type="staged"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Changes */}
                <div className="flex flex-col mt-2">
                    <div
                        className="flex items-center px-2 py-1 cursor-pointer hover:bg-[var(--ui-hover)] group select-none"
                        onClick={() => setChangesOpen(!changesOpen)}
                    >
                        <div className="w-5 text-center text-[var(--ui-fg-muted)] text-[10px]">
                            <FontAwesomeIcon
                                icon={
                                    changesOpen ? faChevronDown : faChevronRight
                                }
                            />
                        </div>
                        <span className="text-[11px] font-bold uppercase text-[var(--ui-fg-muted)] tracking-wider">
                            Changes
                        </span>
                        <span className="ml-2 text-[11px] bg-[var(--ui-bg-elevated)] text-[var(--ui-fg)] px-1.5 rounded-full">
                            {changesFiles.length}
                        </span>
                    </div>
                    {changesOpen && (
                        <div>
                            {changesFiles.map((file, idx) => (
                                <FileItem
                                    key={idx}
                                    file={file}
                                    type="changes"
                                    onStage={() => handleStage(file.file)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function FileItem({
    file,
    type,
    onStage,
}: {
    file: GitStatusFile
    type: 'staged' | 'changes'
    onStage?: () => void
}) {
    const icon = getIconElement(file.file)
    const fileName = file.file.split('/').pop() || file.file
    const dirPath = file.file.substring(0, file.file.length - fileName.length)

    // Status Color - Using variables where possible, else keeping standard semantic colors
    let statusColor = 'text-[#e2c08d]' // Modified (M) - Yellowish
    if (file.status === 'A' || file.status === '?')
        statusColor = 'text-[var(--diff-bright-add)]'
    if (file.status === 'D') statusColor = 'text-[var(--diff-bright-delete)]'
    if (file.status === 'U') statusColor = 'text-[#e2c08d]' // Untracked/Modified proxy

    return (
        <div className="flex items-center px-2 py-[3px] hover:bg-[var(--ui-hover)] cursor-pointer group select-none pl-6">
            <div className="flex items-center gap-1.5 overflow-hidden flex-1">
                <div className="shrink-0 w-4 text-center">{icon}</div>
                <span
                    className={`text-[13px] ${
                        file.status === 'D'
                            ? 'line-through opacity-70'
                            : 'text-[var(--foreground)]'
                    } truncate`}
                >
                    {fileName}
                </span>
                <span className="text-[11px] text-[var(--ui-fg-muted)] truncate shrink-0 ml-1">
                    {dirPath}
                </span>
                <span className={`text-[12px] font-bold ${statusColor} ml-2`}>
                    {file.status === '?' ? 'U' : file.status}
                </span>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 mr-2">
                {type === 'changes' && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onStage && onStage()
                        }}
                        className="hover:text-[var(--foreground)] text-[var(--ui-fg-muted)]"
                        title="Stage Changes"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                    </button>
                )}
                {type === 'staged' && (
                    <button
                        className="hover:text-[var(--foreground)] text-[var(--ui-fg-muted)]"
                        title="Unstage Changes (Not Implemented)"
                    >
                        <FontAwesomeIcon icon={faMinus} />
                    </button> // Placeholder since Unstage API missing
                )}
                {/* Open File or Discard could go here */}
            </div>
        </div>
    )
}
