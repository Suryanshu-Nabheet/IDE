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
import { Codicon } from './codicon'

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
                </div>
                <div className="code-block-actions">
                    {onApply && (
                        <button
                            className="code-block-action-btn code-block-apply-btn"
                            onClick={onApply}
                            title="Apply to file"
                        >
                            <Codicon name="check" style={{ fontSize: '12px' }} />
                            Apply
                        </button>
                    )}
                    <button
                        className="code-block-action-btn"
                        onClick={handleCopy}
                        title="Copy code"
                    >
                        <Codicon name={copied ? 'check' : 'copy'} style={{ fontSize: '12px' }} />
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
        const icons: Record<string, string> = {
            read_file: 'book',
            write_file: 'edit',
            edit_file: 'pencil',
            list_files: 'list-tree',
            create_directory: 'new-folder',
            delete_file: 'trash',
            run_terminal_command: 'terminal',
            run_command: 'terminal',
            search_code: 'search',
            get_diagnostics: 'warning',
            open_file: 'file',
            get_file_outline: 'symbol-structure',
            list_dir: 'folder',
        }
        return <Codicon name={icons[name] || 'tools'} />
    }

    const getToolLabel = (name: string, args: Record<string, any>) => {
        if (name === 'read_file' || name === 'write_file' || name === 'edit_file') {
            const path = args.TargetPath || args.TargetFile || args.path || args.filename
            if (path) {
                const parts = path.split('/')
                const filename = parts[parts.length - 1]
                const action = name.includes('read') ? 'Read' : name.includes('write') ? 'Write' : 'Edit'
                return (
                    <span className="tool-call-label-container">
                        <span className="tool-call-action-name">{action}</span>
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
        if (name === 'run_command' || name === 'run_terminal_command') {
            return (
                <span className="tool-call-label-container">
                    <span className="tool-call-action-name">Run</span>
                    <span className="tool-call-filename" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', opacity: 0.8 }}>
                        {args.CommandLine?.slice(0, 40) || 'command'}
                    </span>
                </span>
            )
        }

        return (
            <span className="tool-call-label-container">
                <span className="tool-call-action-name">
                    {name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </span>
            </span>
        )
    }

    return (
        <div
            className={`tool-call-card ${needsApproval ? 'tool-call-waiting' : ''}`}
        >
            <div
                className="tool-call-header"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span className="tool-call-icon">
                    {getToolIcon(toolName)}
                </span>
                
                {getToolLabel(toolName, args)}

                <div className="tool-call-status-right">
                    {isExecuting && (
                        <div className="tool-call-executing">
                            <Codicon name="loading" className="codicon-modifier-spin" />
                        </div>
                    )}
                    {success === true && (
                        <div className="tool-call-success">
                            <Codicon name="check" />
                        </div>
                    )}
                    {success === false && (
                        <div className="tool-call-failed">
                            <Codicon name="error" />
                        </div>
                    )}
                    <button className="tool-call-expand-icon">
                        <Codicon name={isExpanded ? 'chevron-up' : 'chevron-down'} />
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="tool-call-body">
                    <div className="tool-call-section">
                        <div className="tool-call-section-title">Arguments</div>
                        <pre className="tool-call-json">
                            {JSON.stringify(args, null, 2)}
                        </pre>
                    </div>

                    {result && (
                        <div className="tool-call-section">
                            <div className="tool-call-section-title">Result</div>
                            <pre className="tool-call-result">{result}</pre>
                        </div>
                    )}

                    {needsApproval && !isExecuting && success === undefined && (
                        <div className="tool-call-actions">
                            <button
                                className="tool-call-btn tool-call-accept"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onAccept?.()
                                }}
                            >
                                <Codicon name="check" /> Approve
                            </button>
                            <button
                                className="tool-call-btn tool-call-reject"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onReject?.()
                                }}
                            >
                                <Codicon name="close" /> Reject
                            </button>
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
                <Codicon
                    name="list-ordered"
                    style={{ marginRight: '8px', fontSize: '12px' }}
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
