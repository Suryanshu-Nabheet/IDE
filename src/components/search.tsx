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
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            zIndex: 10000,
        },
        content: {
            padding: 'none',
            bottom: 'none',
            background: 'none',
            border: 'none',
            marginLeft: 'auto',
            marginRight: 'auto',
            right: '40px',
            left: 'none',
            width: '300px',
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
            default:
                return null
        }
    }
    return (
        <div
            className="w-full h-full leftside"
            style={{ display: 'flex', flexDirection: 'column' }}
        >
            <div
                className="leftside__header"
                style={{
                    height: '35px',
                    minHeight: '35px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 12px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--ui-fg)',
                    letterSpacing: '0.4px',
                    textTransform: 'uppercase',
                    borderBottom: '1px solid var(--pane-border)',
                    userSelect: 'none',
                    backgroundColor: 'var(--sidebar-bg)',
                    flexShrink: 0,
                    zIndex: 10,
                }}
            >
                {activeTab === 'filetree' ? 'Explorer' : activeTab}
            </div>
            {/* A div to display the content of the active tab */}
            <div
                className="leftside__filetree_container"
                style={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                    overflow: 'hidden',
                }}
            >
                {renderTabContent()}
                <div className="cover-bar"></div>
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
        <div
            className="search-container"
            style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'var(--left-pane-background)',
            }}
        >
            <div className="search-bar" style={{ padding: '12px 16px' }}>
                <textarea
                    className="search-textarea w-full"
                    placeholder="Search"
                    style={{
                        backgroundColor: 'var(--input-bg)',
                        color: 'var(--input-fg)',
                        border: '1px solid var(--input-border)',
                        borderRadius: '2px',
                        padding: '4px 8px',
                        fontSize: '13px',
                        outline: 'none',
                        resize: 'none',
                        minHeight: '28px',
                    }}
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
                {/* A button for the search icon, that triggers the search */}
                {/* <button className="search-button" onClick={() => throttledSearch(query)}>
          <i className="fa fa-search"></i>
        </button> */}
            </div>
            {/* A div to display the search results */}
            <div
                className="search-results"
                style={{ flexGrow: 1, overflowY: 'auto', minHeight: 0 }}
            >
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

// Now write the transformResults function.
// This is an example of the input
// {"type":"match","data":{"path":{"text":"/Users/amansanger/portal/src/features/globalSlice.ts"},"lines":{"text":"import { EditorView, ViewUpdate } from '@codemirror/view';\\n"},"line_number":1,"absolute_offset":0,"submatches":[{"match":{"text":"codemirror"},"start":41,"end":51}]}}

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
        <div className="search-result text-white">
            {/* Tailwind arrange children to be horizontally adjacent*/}
            <div className="folder__line" onClick={toggleLineResults}>
                <div className="folder__icon">
                    {showLineResults ? (
                        <FontAwesomeIcon icon={faChevronDown} />
                    ) : (
                        <FontAwesomeIcon icon={faChevronRight} />
                    )}
                </div>
                <div className="file__icon">{iconElement}</div>
                <div className="folder__name truncate shrink-0">{fileName}</div>
                <div className="smallPath truncate text-gray-500">
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
            className="folder__line"
            style={{
                paddingLeft: '40px',
                height: 'auto',
                minHeight: '22px',
                alignItems: 'flex-start',
                paddingRight: '12px',
            }}
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
            <div className="line-number">{result.data.line_number}</div>
            <div
                className="filename"
                style={{
                    whiteSpace: 'pre',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}
            >
                {line.slice(0, start)}
                <span className="highlight-search">
                    {line.slice(start, end)}
                </span>
                {line.slice(end)}
            </div>
        </div>
    )
}
