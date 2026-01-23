import React, { useCallback, useEffect, useRef, useState } from 'react'
import { getIconElement } from './filetree'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faChevronDown,
    faChevronRight,
    faFontCase,
    faItalic,
    faAsterisk,
    faAngleRight,
    faAngleDown,
    faEllipsis,
    faTimes,
} from '@fortawesome/pro-regular-svg-icons'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { getLeftTab, getLeftTabActive } from '../features/tools/toolSelectors'
import { leftTabInactive } from '../features/tools/toolSlice'
import { openFile } from '../features/globalSlice'
import { getRootPath } from '../features/selectors'
import _ from 'lodash'

// Interfaces
interface FileLevelResult {
    filePath: string
    results: RawResult[]
}

interface RawResult {
    type: string
    data: {
        path: { text: string }
        lines: { text: string }
        line_number: number
        absolute_offset: number
        submatches: {
            match: { text: string }
            start: number
            end: number
        }[]
    }
}

// Helper to highlight text
const HighlightedText = ({
    text,
    start,
    end,
}: {
    text: string
    start: number
    end: number
}) => {
    return (
        <span>
            {text.slice(0, start)}
            <span className="bg-[var(--selection)] text-[var(--foreground)] rounded-[2px] border border-[var(--selection)]">
                {text.slice(start, end)}
            </span>
            {text.slice(end)}
        </span>
    )
}

export function FeedbackArea() {
    return null
}

export const LeftSide = () => {
    const activeTab = useAppSelector(getLeftTab)
    const renderTabContent = () => {
        switch (activeTab) {
            case 'search':
                return <SearchComponent />
            case 'filetree': {
                const { FileTree } = require('./filetree')
                return <FileTree />
            }
            case 'git': {
                const { GitPane } = require('./gitPane')
                return <GitPane />
            }
            case 'extensions': {
                const { ExtensionsPane } = require('./extensionsPane')
                return <ExtensionsPane />
            }
            default:
                return null
        }
    }
    return (
        <div className="w-full h-full flex flex-col bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)]">
            <div className="flex-1 min-h-0 overflow-hidden relative">
                {renderTabContent()}
            </div>
        </div>
    )
}

function SearchComponent() {
    const dispatch = useAppDispatch()
    const leftTabActive = useAppSelector(getLeftTabActive)
    const rootPath = useAppSelector(getRootPath)

    // Search State
    const [query, setQuery] = useState('')
    const [replaceText, setReplaceText] = useState('')
    const [results, setResults] = useState<FileLevelResult[]>([])

    // Toggles
    const [isReplaceOpen, setIsReplaceOpen] = useState(false)
    const [matchCase, setMatchCase] = useState(false)
    const [matchWholeWord, setMatchWholeWord] = useState(false)
    const [useRegex, setUseRegex] = useState(false)
    const [showDetails, setShowDetails] = useState(false) // For Include/Exclude

    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Focus handling
    useEffect(() => {
        if (leftTabActive && textareaRef.current) {
            textareaRef.current.focus()
            textareaRef.current.select()
            dispatch(leftTabInactive())
        }
    }, [leftTabActive])

    // Search Logic
    const handleSearch = async (
        q: string,
        mCase: boolean
        // mWord: boolean,
        // reg: boolean
    ) => {
        if (!q) {
            setResults([])
            return
        }

        try {
            // @ts-ignore
            const out: string[] = await connector.searchRipGrep({
                query: q,
                rootPath: rootPath,
                badPaths: [], // TODO: Add exclude logic
                caseSensitive: mCase,
            })

            if (!out || out.length === 0) {
                setResults([])
                return
            }

            const parsedResults: RawResult[] = out.map((r) => JSON.parse(r))
            const fileMap = new Map<string, FileLevelResult>()

            for (const res of parsedResults) {
                const path = res.data.path.text
                if (!fileMap.has(path)) {
                    fileMap.set(path, { filePath: path, results: [] })
                }
                fileMap.get(path)!.results.push(res)
            }
            setResults([...fileMap.values()])
        } catch (e) {
            console.error(e)
            setResults([])
        }
    }

    const throttledSearch = useCallback(
        _.debounce((q, mCase) => {
            handleSearch(q, mCase)
        }, 300),
        [rootPath]
    )

    useEffect(() => {
        throttledSearch(query, matchCase)
    }, [query, matchCase, matchWholeWord, useRegex])

    const toggleReplace = () => setIsReplaceOpen(!isReplaceOpen)

    return (
        <div className="flex flex-col h-full bg-[var(--sidebar-bg)] text-[var(--sidebar-fg)]">
            {/* Header */}
            <div className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--ui-fg-muted)] flex justify-between items-center select-none">
                <span>Search</span>
                <button
                    onClick={() => setResults([])}
                    className="hover:text-[var(--foreground)] transition-colors"
                    title="Clear Search"
                >
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            </div>

            {/* Inputs Container */}
            <div className="px-4 pb-2 border-b border-[var(--sidebar-border)] shadow-sm relative z-10">
                <div className="relative group">
                    <div className="flex flex-col gap-[6px]">
                        {/* Search Input Box */}
                        <div className="relative flex items-center bg-[var(--input-bg)] border border-[var(--input-border)] focus-within:border-[var(--accent)] rounded-[3px] overflow-hidden">
                            <div
                                className="pl-2 pr-1 cursor-pointer opacity-70 hover:opacity-100"
                                onClick={toggleReplace}
                            >
                                <FontAwesomeIcon
                                    icon={
                                        isReplaceOpen
                                            ? faAngleDown
                                            : faAngleRight
                                    }
                                    className="text-[10px] w-3"
                                />
                            </div>
                            <textarea
                                ref={textareaRef}
                                className="w-full bg-transparent border-none outline-none text-[13px] text-[var(--input-fg)] px-1 py-[6px] resize-none h-[30px] leading-[18px] placeholder:text-[var(--input-placeholder)]"
                                placeholder="Search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                rows={1}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault()
                                        throttledSearch(query, matchCase)
                                    }
                                }}
                            />
                            {/* Toggles */}
                            <div className="flex items-center gap-[2px] pr-1">
                                <SearchToggle
                                    active={matchCase}
                                    onClick={() => setMatchCase(!matchCase)}
                                    icon={faFontCase}
                                    title="Match Case (Alt+C)"
                                />
                                <SearchToggle
                                    active={matchWholeWord}
                                    onClick={() =>
                                        setMatchWholeWord(!matchWholeWord)
                                    }
                                    icon={faItalic} // Visual proxy
                                    title="Match Whole Word (Alt+W)"
                                />
                                <SearchToggle
                                    active={useRegex}
                                    onClick={() => setUseRegex(!useRegex)}
                                    icon={faAsterisk}
                                    title="Use Regular Expression (Alt+R)"
                                />
                            </div>
                        </div>

                        {/* Replace Input Box */}
                        {isReplaceOpen && (
                            <div className="relative flex items-center bg-[var(--input-bg)] border border-[var(--input-border)] focus-within:border-[var(--accent)] rounded-[3px] overflow-hidden">
                                <div className="pl-2 pr-1 w-4" />{' '}
                                {/* Spacer alignment */}
                                <input
                                    className="w-full bg-transparent border-none outline-none text-[13px] text-[var(--input-fg)] px-1 py-[5px] h-[30px] placeholder:text-[var(--input-placeholder)]"
                                    placeholder="Replace"
                                    value={replaceText}
                                    onChange={(e) =>
                                        setReplaceText(e.target.value)
                                    }
                                />
                                {/* Replace Actions could go here */}
                            </div>
                        )}

                        {/* Include/Exclude Toggle */}
                        <div className="flex justify-end pt-1">
                            <button
                                onClick={() => setShowDetails(!showDetails)}
                                className={`text-[10px] px-1 rounded ${
                                    showDetails
                                        ? 'text-[var(--foreground)]'
                                        : 'text-[var(--ui-fg-muted)] hover:text-[var(--ui-fg-muted)]'
                                }`}
                                title="Toggle Search Details"
                            >
                                <FontAwesomeIcon icon={faEllipsis} />
                            </button>
                        </div>

                        {/* Include/Exclude Fields */}
                        {showDetails && (
                            <div className="flex flex-col gap-2 mt-1 mb-2">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[11px] text-[var(--ui-fg-muted)]">
                                        files to include
                                    </label>
                                    <input className="bg-[var(--input-bg)] border border-[var(--input-border)] focus:border-[var(--accent)] rounded-[3px] px-2 py-1 text-[12px] text-[var(--input-fg)] outline-none" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[11px] text-[var(--ui-fg-muted)]">
                                        files to exclude
                                    </label>
                                    <input className="bg-[var(--input-bg)] border border-[var(--input-border)] focus:border-[var(--accent)] rounded-[3px] px-2 py-1 text-[12px] text-[var(--input-fg)] outline-none" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
                {results.length === 0 && query && (
                    <div className="p-5 text-center text-[var(--ui-fg-muted)] text-[13px]">
                        No results found.
                    </div>
                )}
                {results.length > 0 && (
                    <div className="flex flex-col">
                        <div className="px-4 py-2 text-[11px] text-[var(--accent)] opacity-80">
                            {results.reduce(
                                (acc, curr) => acc + curr.results.length,
                                0
                            )}{' '}
                            results in {results.length} files
                        </div>
                        {results.map((result) => (
                            <FileResultComponent
                                key={result.filePath}
                                result={result}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function SearchToggle({ active, onClick, icon, title }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-5 h-5 flex items-center justify-center rounded-[3px] transition-colors ${
                active
                    ? 'bg-[var(--ui-bg-elevated)] text-[var(--foreground)]'
                    : 'text-[var(--ui-fg-muted)] hover:bg-[var(--ui-hover)]'
            }`}
            title={title}
        >
            <FontAwesomeIcon icon={icon} className="text-[10px]" />
        </button>
    )
}

function FileResultComponent({ result }: { result: FileLevelResult }) {
    const [expanded, setExpanded] = useState(true)
    const iconElement = getIconElement(result.filePath)
    const rootPath = useAppSelector(getRootPath)

    // Compute relative path
    // @ts-ignore
    const delim = connector?.PLATFORM_DELIMITER || '/'
    const relativePath = result.filePath.startsWith(rootPath)
        ? result.filePath.slice(rootPath.length + 1)
        : result.filePath

    const fileName = relativePath.split(delim).pop() || relativePath
    const dirPath = relativePath.substring(
        0,
        relativePath.length - fileName.length
    )

    return (
        <div className="flex flex-col">
            <div
                className="flex items-center px-2 py-1 cursor-pointer hover:bg-[var(--ui-hover)] select-none group"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="w-5 text-center text-[var(--ui-fg-muted)] text-[10px]">
                    <FontAwesomeIcon
                        icon={expanded ? faChevronDown : faChevronRight}
                    />
                </div>
                <div className="flex items-center gap-1.5 overflow-hidden">
                    <div className="text-[14px] shrink-0">{iconElement}</div>
                    <span className="text-[13px] font-medium text-[var(--foreground)] truncate">
                        {fileName}
                    </span>
                    <span className="text-[11px] text-[var(--ui-fg-muted)] truncate ml-1">
                        {dirPath}
                    </span>
                </div>
                <div className="ml-auto bg-[var(--ui-bg-elevated)] text-[var(--foreground)] text-[10px] px-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    {result.results.length}
                </div>
            </div>

            {expanded && (
                <div className="flex flex-col">
                    {result.results.map((res, idx) => (
                        <LineResultComponent key={idx} result={res} />
                    ))}
                </div>
            )}
        </div>
    )
}

function LineResultComponent({ result }: { result: RawResult }) {
    const dispatch = useAppDispatch()
    const line = result.data.lines.text
    const firstMatch = result.data.submatches[0]

    // Safety check
    if (!firstMatch) return null

    return (
        <div
            className="flex items-start cursor-pointer hover:bg-[var(--ui-hover)] pl-8 pr-2 py-[2px] font-mono text-[12px] group"
            onClick={() =>
                dispatch(
                    openFile({
                        filePath: result.data.path.text,
                        selectionRegions: [
                            {
                                start: {
                                    line: result.data.line_number - 1,
                                    character: firstMatch.start,
                                },
                                end: {
                                    line: result.data.line_number - 1,
                                    character: firstMatch.end,
                                },
                            },
                        ],
                    })
                )
            }
        >
            <span className="text-[var(--ui-fg-muted)] mr-4 w-6 text-right shrink-0 select-none group-hover:underline">
                {result.data.line_number}
            </span>
            <span className="text-[var(--foreground)] whitespace-pre truncate">
                <HighlightedText
                    text={line}
                    start={firstMatch.start}
                    end={firstMatch.end}
                />
            </span>
        </div>
    )
}
