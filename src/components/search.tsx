import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FileTree, getIconElement } from './filetree'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faArrowRightLong,
    faChevronDown,
    faChevronRight,
} from '@fortawesome/sharp-solid-svg-icons'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { getLeftTab, getLeftTabActive } from '../features/tools/toolSelectors'
import { leftTabInactive } from '../features/tools/toolSlice'
import {
    sendFeedbackMessage,
    toggleFeedback,
    updateFeedbackMessage,
} from '../features/logging/loggingSlice'
import {
    getFeedbackMessage,
    getIsOpen,
} from '../features/logging/loggingSelectors'
import { openFile } from '../features/globalSlice'
import { getRootPath } from '../features/selectors'
import _ from 'lodash'
import Modal from 'react-modal'

export function FeedbackArea() {
    const dispatch = useAppDispatch()
    const feedbackMessage = useAppSelector(getFeedbackMessage)
    const isOpen = useAppSelector(getIsOpen)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const handleTextareaChange = (e: {
        target: { value: React.SetStateAction<string> }
    }) => {
        // Set the query state to the textarea value
        dispatch(updateFeedbackMessage(e.target.value.toString()))
        // Adjust the textarea height based on the scroll height
        textareaRef.current!.style.height = 'auto'
        textareaRef.current!.style.height =
            textareaRef.current!.scrollHeight + 'px'
    }
    const placeholders = [
        'Least favorite thing about CodeX...',
        'Favorite thing about CodeX is...',
        'What would you like to see in CodeX?',
        'What should we fix about CodeX?',
    ]
    const randomPlaceholder =
        placeholders[Math.floor(Math.random() * placeholders.length)]

    const customStyles = {
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
            zIndex: 10000,
        },
        content: {
            padding: '0',
            top: '40px',
            right: '40px',
            left: 'auto',
            bottom: 'auto',
            background: 'var(--black-elevated)',
            border: '1px solid var(--ui-border)',
            width: '400px',
            height: 'auto',
            maxHeight: '80vh',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
        },
    }

    return (
        <>
            <Modal
                isOpen={isOpen}
                onRequestClose={() => {
                    dispatch(toggleFeedback(null))
                }}
                style={customStyles}
            >
                <div className="feedbackarea">
                    <textarea
                        className="search-textarea w-full"
                        autoFocus={true}
                        value={feedbackMessage}
                        placeholder={
                            'Tell us anything! E.g. ' + randomPlaceholder
                        }
                        onChange={handleTextareaChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                dispatch(sendFeedbackMessage(null))
                                e.preventDefault()
                                return
                            }
                        }}
                        ref={textareaRef}
                    />
                    <div
                        className="feedbackarea_button"
                        onClick={() => {
                            dispatch(sendFeedbackMessage(null))
                        }}
                    >
                        <FontAwesomeIcon icon={faArrowRightLong} />
                    </div>
                </div>
            </Modal>
        </>
    )
}

import { GitPane } from './gitPane'
import { ExtensionsPane } from './extensionsPane'

// A simple functional react component that houses a number of different tabs
export const LeftSide = () => {
    // A state variable to keep track of the active tab
    const activeTab = useAppSelector(getLeftTab)

    // A function to render the content of the active tab
    const renderTabContent = () => {
        switch (activeTab) {
            case 'search':
                return <SearchComponent />
            case 'filetree':
                return <FileTree />
            case 'git':
                return <GitPane />
            case 'extensions':
                return <ExtensionsPane />
            default:
                return null
        }
    }
    return (
        <div
            className="w-full h-full leftside"
            style={{ display: 'flex', flexDirection: 'column' }}
        >
            <div className="flex-1 min-h-0 overflow-hidden relative">
                {renderTabContent()}
            </div>
        </div>
    )
}

interface FileLevelResult {
    filePath: string
    results: RawResult[]
}

const handleSearch = async (query: string, setResults: any, rootPath: any) => {
    if (query == '') {
        setResults([])
        return
    }

    // @ts-ignore
    connector
        .searchRipGrep({
            query: query,
            rootPath: rootPath,
            badPaths: [],
            caseSensitive: false,
        })
        .then((out: string[]) => {
            if (out.length == 0) {
                setResults([])
                return
            }
            const newResults: RawResult[] = [
                ...out.map((result: string) => JSON.parse(result)),
            ]

            const fileLevelResultsMap = new Map<string, FileLevelResult>()

            for (const result of newResults) {
                const filePath = result.data.path.text
                if (!fileLevelResultsMap.has(filePath)) {
                    fileLevelResultsMap.set(filePath, { filePath, results: [] })
                }

                const fileLevelResult = fileLevelResultsMap.get(filePath)
                fileLevelResult!.results.push(result)
            }
            const newestResults = [...fileLevelResultsMap.values()]
            setResults(newestResults)
        })
}

// A simple functional react component that performs a search and displays the results
function SearchComponent() {
    // A state variable to store the search query
    const [query, setQuery] = useState('')
    const leftTabActive = useAppSelector(getLeftTabActive)
    const dispatch = useAppDispatch()

    const rootPath = useAppSelector(getRootPath)

    // A state variable to store the search results
    const [results, setResults] = useState<FileLevelResult[]>([])

    const throttledSearch = useCallback(
        _.debounce((q, sr) => {
            handleSearch(q, sr, rootPath)
        }, 250),
        [setResults]
    )

    // A ref variable to access the textarea element
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (leftTabActive && textareaRef.current) {
            textareaRef.current.focus()
            // select all the text
            textareaRef.current.setSelectionRange(
                0,
                textareaRef.current.value.length
            )
            dispatch(leftTabInactive())
        }
    }, [leftTabActive, textareaRef.current])

    useEffect(() => {
        throttledSearch(query, setResults)
    }, [query])

    // A function to handle the change of the textarea value
    const handleTextareaChange = (e: {
        target: { value: React.SetStateAction<string> }
    }) => {
        // Set the query state to the textarea value
        setQuery(e.target.value)

        // Adjust the textarea height based on the scroll height
        textareaRef.current!.style.height = 'auto'
        textareaRef.current!.style.height =
            textareaRef.current!.scrollHeight + 'px'
    }

    return (
        <div className="search-container flex flex-col h-full bg-transparent">
            <div className="left-pane-header">Search</div>
            <div className="search-input-wrapper border-b border-ui-border-subtle/50">
                <textarea
                    className="search-input"
                    placeholder="Search in files..."
                    value={query}
                    onChange={handleTextareaChange}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            throttledSearch(query, setResults)
                            e.preventDefault()
                            return
                        }
                    }}
                    ref={textareaRef}
                />
            </div>
            {/* A div to display the search results */}

            <div className="search-results-container no-scrollbar">
                {/* A conditional rendering to show a message if there are no results */}
                {results.length === 0 && query !== '' && (
                    <div
                        style={{
                            padding: '20px',
                            color: 'var(--ui-fg-muted)',
                            fontSize: '13px',
                            textAlign: 'center',
                        }}
                    >
                        No results found for "{query}"
                    </div>
                )}
                {/* A map function to render a list of the search result components */}
                {results.map((result) => (
                    <FileResultComponent
                        key={result.filePath}
                        result={result}
                    />
                ))}
            </div>
        </div>
    )
}

// Now write an interface for the input
interface RawResult {
    type: string
    data: {
        path: {
            text: string
        }
        lines: {
            text: string
        }
        line_number: number
        absolute_offset: number
        submatches: {
            match: {
                text: string
            }
            start: number
            end: number
        }[]
    }
}

function FileResultComponent({ result }: { result: FileLevelResult }) {
    // Use a state variable to track the visibility of the line results
    const [showLineResults, setShowLineResults] = useState(true)
    const iconElement = getIconElement(result.filePath)

    const rootPath = useAppSelector((state) => state.global.rootPath)

    const splitFilePath = result.filePath.split(connector.PLATFORM_DELIMITER)
    const fileName = splitFilePath.pop()!
    const precedingPath = splitFilePath
        .join(connector.PLATFORM_DELIMITER)
        .slice(rootPath.length + 1)

    // Use a function to toggle the visibility of the line results
    function toggleLineResults() {
        setShowLineResults(!showLineResults)
    }

    return (
        <div className="search-result-item last:border-0 overflow-hidden">
            {/* Tailwind arrange children to be horizontally adjacent*/}
            <div
                className="folder__line hover:bg-white/[0.03] transition-all cursor-pointer py-1.5 px-4 flex items-center gap-2"
                onClick={toggleLineResults}
            >
                <div className="folder__icon w-4 flex justify-center text-[10px] opacity-40">
                    {showLineResults ? (
                        <FontAwesomeIcon icon={faChevronDown} />
                    ) : (
                        <FontAwesomeIcon icon={faChevronRight} />
                    )}
                </div>
                <div className="file__icon flex items-center">
                    {iconElement}
                </div>
                <div className="folder__name text-[13px] font-medium text-ui-fg opacity-90 truncate shrink-0">
                    {fileName}
                </div>
                <div className="smallPath text-[11px] opacity-30 truncate">
                    {precedingPath}
                </div>
            </div>
            {/* Use a conditional rendering to show or hide the line results */}
            {showLineResults && (
                <div className="folder__below">
                    {[...result.results.entries()].map(([idx, result]) => (
                        <LineResultComponent key={idx} result={result} />
                    ))}
                </div>
            )}
        </div>
    )
}

function LineResultComponent({ result }: { result: RawResult }) {
    const line = result.data.lines.text
    const firstMatch = result.data.submatches[0]
    const start = firstMatch.start
    const end = firstMatch.end

    const dispatch = useAppDispatch()

    return (
        <div
            className="search-line-result"
            onClick={() =>
                dispatch(
                    openFile({
                        filePath: result.data.path.text,
                        selectionRegions: [
                            {
                                start: {
                                    line: result.data.line_number - 1,
                                    character: start,
                                },
                                end: {
                                    line: result.data.line_number - 1,
                                    character: end,
                                },
                            },
                        ],
                    })
                )
            }
        >
            <div className="search-line-number">{result.data.line_number}</div>
            <div className="search-line-text">
                {line.slice(0, start)}
                <span className="highlight-search">
                    {line.slice(start, end)}
                </span>
                {line.slice(end)}
            </div>
        </div>
    )
}
