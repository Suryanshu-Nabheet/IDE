/**
 * Code Block Component with Syntax Highlighting
 * Professional code rendering for AI chat
 */

import React, { useState } from 'react'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css' // Dark theme
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-markdown'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faCopy,
    faCheck,
    faFileCode,
    faXmark,
    faBook,
    faPenToSquare,
    faPencil,
    faFolder,
    faFolderPlus,
    faTrashCan,
    faBolt,
    faMagnifyingGlass,
    faWrench,
    faFile,
    faListTree,
} from '@fortawesome/pro-regular-svg-icons'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import '../styles/aiCodeBlock.css'

interface CodeBlockProps {
    code: string
    language?: string
    filename?: string
    showLineNumbers?: boolean
    onApply?: () => void
}

export function CodeBlock({
    code,
    language = 'typescript',
    filename,
    showLineNumbers = false,
    onApply,
}: CodeBlockProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // Highlight code
    const highlighted = React.useMemo(() => {
        try {
            const grammar =
                Prism.languages[language] || Prism.languages.typescript
            return Prism.highlight(code, grammar, language)
        } catch (e) {
            return code
        }
    }, [code, language])

    const lines = code.split('\n')

    return (
        <div className="code-block-container">
            {/* Header */}
            <div className="code-block-header">
                <div className="code-block-info">
                    {filename && (
                        <span className="code-block-filename">
                            {filename}
                        </span>
                    )}
                    <span className="code-block-language-tag">{language}</span>
                </div>
                <div className="code-block-actions">
                    {onApply && (
                        <button
                            className="code-block-action-btn code-block-apply-btn"
                            onClick={onApply}
                            title="Apply to file"
                        >
                            Apply
                        </button>
                    )}
                    <button
                        className="code-block-action-btn"
                        onClick={handleCopy}
                        title="Copy code"
                    >
                        <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </div>

            {/* Code */}
            <div className="code-block-content">
                {showLineNumbers ? (
                    <div className="code-block-with-lines">
                        <div className="code-block-line-numbers">
                            {lines.map((_, i) => (
                                <div key={i} className="code-block-line-number">
                                    {i + 1}
                                </div>
                            ))}
                        </div>
                        <pre className="code-block-pre">
                            <code
                                className={`language-${language}`}
                                dangerouslySetInnerHTML={{
                                    __html: highlighted,
                                }}
                            />
                        </pre>
                    </div>
                ) : (
                    <pre className="code-block-pre">
                        <code
                            className={`language-${language}`}
                            dangerouslySetInnerHTML={{ __html: highlighted }}
                        />
                    </pre>
                )}
            </div>
        </div>
    )
}

/**
 * Tool Call Display Component
 */
interface ToolCallCardProps {
    toolName: string
    arguments: Record<string, any>
    result?: string
    success?: boolean
    isExecuting?: boolean
    needsApproval?: boolean
    onAccept?: () => void
    onReject?: () => void
}

export function ToolCallCard({
    toolName,
    arguments: args,
    result,
    success,
    isExecuting,
    needsApproval,
    onAccept,
    onReject,
}: ToolCallCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    // Force expansion if waiting for approval
    React.useEffect(() => {
        if (needsApproval) setIsExpanded(true)
    }, [needsApproval])

    const getToolIcon = (name: string) => {
        const icons: Record<string, any> = {
            read_file: faBook,
            write_file: faPenToSquare,
            edit_file: faPencil,
            list_files: faListTree,
            create_directory: faFolderPlus,
            delete_file: faTrashCan,
            run_terminal_command: faBolt,
            search_code: faMagnifyingGlass,
            get_diagnostics: faWrench,
            open_file: faFile,
            get_file_outline: faListTree,
        }
        return (
            <FontAwesomeIcon
                icon={icons[name] || faWrench}
                className="tool-call-icon-svg"
            />
        )
    }

    const getToolLabel = (name: string, args: Record<string, any>) => {
        if (name === 'read_file' || name === 'write_file' || name === 'edit_file') {
            const path = args.TargetPath || args.TargetFile || args.path || args.filename
            if (path) {
                const parts = path.split('/')
                const filename = parts[parts.length - 1]
                return (
                    <span className="tool-call-label-container">
                        <span className="tool-call-action-name">
                            {name.split('_')[0].charAt(0).toUpperCase() + name.split('_')[0].slice(1)}
                        </span>
                        <span className="tool-call-filename">{filename}</span>
                    </span>
                )
            }
        }
        if (name === 'list_dir' || name === 'list_files') {
            const path = args.DirectoryPath || args.path || './'
            return (
                <span className="tool-call-label-container">
                    <span className="tool-call-action-name">List</span>
                    <span className="tool-call-filename">{path}</span>
                </span>
            )
        }
        if (name === 'run_command') {
            return (
                <span className="tool-call-label-container">
                    <span className="tool-call-action-name">Run</span>
                    <span className="tool-call-filename" style={{ fontFamily: 'monospace' }}>
                        {args.CommandLine?.slice(0, 30) || 'Command'}...
                    </span>
                </span>
            )
        }

        return name
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    return (
        <div
            className={`tool-call-card ${
                success === false ? 'tool-call-error' : ''
            } ${needsApproval ? 'tool-call-waiting' : ''}`}
        >
            <div
                className="tool-call-header"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="tool-call-title">
                    <span className="tool-call-icon">
                        {getToolIcon(toolName)}
                    </span>
                    <span className="tool-call-name">
                        {getToolLabel(toolName, args)}
                    </span>

                    {/* Status Indicators */}
                    <div className="tool-call-status-right">
                        {needsApproval && !isExecuting && success === undefined && (
                            <span className="tool-call-status tool-call-waiting-badge">
                                Pending
                            </span>
                        )}

                        {isExecuting && (
                            <span className="tool-call-status tool-call-executing">
                                <span className="loader-mini" />
                            </span>
                        )}
                        {success === true && (
                            <span className="tool-call-status tool-call-success">
                                <FontAwesomeIcon icon={faCheck} />
                            </span>
                        )}
                        {success === false && (
                            <span className="tool-call-status tool-call-failed">
                                <FontAwesomeIcon icon={faXmark} />
                            </span>
                        )}
                    </div>
                </div>
                <button className="tool-call-expand-icon">
                    <FontAwesomeIcon icon={isExpanded ? faXmark : faListTree} style={{ opacity: 0.4 }} />
                </button>
            </div>

            {(isExpanded || needsApproval) && (
                <div className="tool-call-body">
                    <div className="tool-call-section">
                        <div className="tool-call-section-title">
                            Arguments:
                        </div>
                        <pre className="tool-call-json">
                            {JSON.stringify(args, null, 2)}
                        </pre>
                    </div>

                    {result && (
                        <div className="tool-call-section">
                            <div className="tool-call-section-title">
                                Result:
                            </div>
                            <pre className="tool-call-result">{result}</pre>
                        </div>
                    )}

                    {/* Waiting for Approval UI */}
                    {needsApproval && !isExecuting && success === undefined && (
                        <div className="tool-call-actions">
                            <div className="flex items-center gap-3 w-full p-2 bg-[var(--ui-bg-elevated)] rounded border border-yellow-500/20 mb-2">
                                <FontAwesomeIcon
                                    icon={faCheck}
                                    className="text-yellow-500"
                                />
                                <span className="text-xs text-[var(--ui-fg)] flex-1">
                                    This action requires your confirmation.
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    className="tool-call-btn tool-call-accept w-full justify-center"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onAccept?.()
                                    }}
                                >
                                    <FontAwesomeIcon icon={faCheck} /> Approve &
                                    Run
                                </button>
                                <button
                                    className="tool-call-btn tool-call-reject w-full justify-center"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onReject?.()
                                    }}
                                >
                                    <FontAwesomeIcon icon={faXmark} /> Reject
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

/**
 * Diff View Component (for showing before/after)
 */
interface DiffViewProps {
    before: string
    after: string
    language?: string
}

export function DiffView({
    before,
    after,
    language = 'typescript',
}: DiffViewProps) {
    return (
        <div className="diff-view">
            <div className="diff-pane diff-before">
                <div className="diff-header">Before</div>
                <CodeBlock code={before} language={language} />
            </div>
            <div className="diff-pane diff-after">
                <div className="diff-header">After</div>
                <CodeBlock code={after} language={language} />
            </div>
        </div>
    )
}

/**
 * Plan Card Component
 * Renders the execution plan
 */
export function PlanCard({ planMarkdown }: { planMarkdown: string }) {
    if (!planMarkdown) return null
    return (
        <div className="plan-card">
            <div className="plan-header">
                <FontAwesomeIcon
                    icon={faFileCode}
                    style={{ marginRight: '8px' }}
                />
                EXECUTION PLAN
            </div>
            <div className="plan-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {planMarkdown}
                </ReactMarkdown>
            </div>
        </div>
    )
}
