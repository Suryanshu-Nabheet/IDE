import React, { useEffect } from 'react'

import { useAppDispatch, useAppSelector } from '../app/hooks'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faFileCode,
    faFileLines,
    faFileCirclePlus,
    faFolderPlus,
    faPuzzlePiece,
    faStar,
    faComment,
    faPalette,
    faVial,
    faTools,
    faCogs,
    faImages,
    faCube,
} from '@fortawesome/pro-regular-svg-icons'
import {
    faChevronDown,
    faChevronRight,
    faFolder,
    faFolderOpen,
    faFile,
    faCode,
    faGear,
    faImage,
    faFilePdf,
    faFileCsv,
    faFileArchive,
    faTerminal as faTerminalIcon,
    faDatabase,
    faCircle as faCircleSolid,
} from '@fortawesome/free-solid-svg-icons'
import * as gs from '../features/globalSlice'

import {
    getDepth,
    getFile,
    getFolder,
    getFolderOpen,
    getNotDeletedFiles,
} from '../features/selectors'
import posthog from 'posthog-js'

const offset = (depth: number) => `${depth * 14 + 16}px`

export function getIconElement(fname: string) {
    const ext = fname.split('.').pop()?.toLowerCase() || ''

    // exact names
    if (fname.toLowerCase() === 'package.json')
        return <FontAwesomeIcon icon={faGear} className="file-icon--config" />
    if (fname.toLowerCase().includes('config'))
        return (
            <FontAwesomeIcon
                icon={faGear}
                className="file-icon--config opacity-80"
            />
        )
    if (fname.toLowerCase().startsWith('readme'))
        return (
            <FontAwesomeIcon icon={faFileLines} className="file-icon--readme" />
        )
    if (fname.toLowerCase().includes('license'))
        return (
            <FontAwesomeIcon icon={faFileCode} className="file-icon--license" />
        )

    // language mappings
    if (['js', 'cjs', 'mjs'].includes(ext))
        return <div className="file-icon-square js-bg">JS</div>
    if (ext === 'ts') return <div className="file-icon-square ts-bg">TS</div>
    if (ext === 'tsx' || ext === 'jsx')
        return <div className="file-icon-square react-bg">TSX</div>
    if (ext === 'py')
        return <FontAwesomeIcon icon={faCode} className="file-icon--python" />
    if (ext === 'html' || ext === 'htm')
        return <FontAwesomeIcon icon={faCode} className="file-icon--html" />
    if (['css', 'scss', 'sass', 'less'].includes(ext))
        return <div className="file-icon-square css-bg">CSS</div>
    if (ext === 'md' || ext === 'markdown')
        return (
            <FontAwesomeIcon
                icon={faFileLines}
                className="file-icon--markdown"
            />
        )
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(ext))
        return <FontAwesomeIcon icon={faImage} className="file-icon--image" />
    if (['sh', 'bash', 'zsh', 'bat', 'cmd', 'ps1'].includes(ext))
        return (
            <FontAwesomeIcon
                icon={faTerminalIcon}
                className="file-icon--terminal"
            />
        )
    if (ext === 'pdf')
        return <FontAwesomeIcon icon={faFilePdf} className="file-icon--pdf" />
    if (ext === 'csv')
        return <FontAwesomeIcon icon={faFileCsv} className="file-icon--csv" />
    if (['zip', 'tar', 'gz', 'rar', '7z'].includes(ext))
        return (
            <FontAwesomeIcon
                icon={faFileArchive}
                className="file-icon--archive"
            />
        )
    if (ext === 'sql' || ext === 'db')
        return (
            <FontAwesomeIcon
                icon={faDatabase}
                className="file-icon--database"
            />
        )

    return <FontAwesomeIcon icon={faFile} className="opacity-50" />
}

function getFolderIcon(name: string, isOpen: boolean) {
    const lname = name.toLowerCase()

    if (lname === '.github') return { icon: faFolderOpen, color: '#ffffff' }
    if (lname === '.webpack') return { icon: faCube, color: '#8dd6f9' }
    if (lname === 'assets') return { icon: faImages, color: '#eaba3a' }
    if (lname === 'node_modules') return { icon: faCube, color: '#8bc34a' }
    if (lname === 'src') return { icon: faFolderOpen, color: '#4caf50' }
    if (lname === 'components') return { icon: faPuzzlePiece, color: '#cddc39' }
    if (lname === 'features') return { icon: faStar, color: '#8bc34a' }
    if (lname === 'chat') return { icon: faComment, color: '#ff9800' }
    if (lname === 'extensions') return { icon: faPuzzlePiece, color: '#2196f3' }
    if (lname === 'settings') return { icon: faGear, color: '#00bcd4' }
    if (lname === 'tests') return { icon: faVial, color: '#009688' }
    if (lname === 'tools') return { icon: faTools, color: '#2196f3' }
    if (lname === 'theme') return { icon: faPalette, color: '#2196f3' }
    if (lname === 'utils') return { icon: faCogs, color: '#8bc34a' }

    return { icon: isOpen ? faFolderOpen : faFolder, color: 'var(--amber)' }
}

function File({ fid }: { fid: number }) {
    const dispatch = useAppDispatch()
    const file = useAppSelector(getFile(fid))
    const depth = useAppSelector(getDepth(fid, true))

    const iconElement = getIconElement(file.name)

    return (
        <div
            className={`file__line group ${
                file.isSelected ? 'file__line_selected' : ''
            }`}
            style={{ paddingLeft: offset(depth) }}
            onClick={() => {
                posthog.capture('Selected File From File Tree', {})
                dispatch(gs.selectFile(fid))
            }}
            onContextMenu={() => dispatch(gs.rightClickFile(fid))}
        >
            <div className="file__icon">{iconElement}</div>
            {file.renameName != null ? (
                <input
                    autoFocus
                    className="file__nameinput"
                    value={file.renameName}
                    onChange={(e) =>
                        dispatch(
                            gs.updateRenameName({
                                fid,
                                new_name: e.target.value,
                            })
                        )
                    }
                    onKeyDown={(e) => {
                        if (e.key == 'Enter') dispatch(gs.commitRename({ fid }))
                        if (e.key == 'Escape') dispatch(gs.cancelRename())
                    }}
                    onBlur={() => dispatch(gs.commitRename({ fid }))}
                    onClick={(e) => e.stopPropagation()}
                />
            ) : (
                <div className="file__name truncate" style={{ flexGrow: 1 }}>
                    {file.name}
                </div>
            )}
            {!file.saved && (
                <div className="file__status">
                    <FontAwesomeIcon
                        icon={faCircleSolid}
                        style={{ fontSize: '6px', color: 'var(--amber)' }}
                    />
                </div>
            )}
        </div>
    )
}

function Folder({ fid }: { fid: number }) {
    const isOpen = useAppSelector(getFolderOpen(fid))
    const dispatch = useAppDispatch()
    const folder = useAppSelector(getFolder(fid))
    const fileChildren = useAppSelector(getNotDeletedFiles(fid))
    const folderDepth = useAppSelector(getDepth(fid))

    const toggleOpen = () => {
        dispatch(gs.loadFolder({ folderId: fid, goDeep: false }))
        dispatch(gs.setFolderOpen({ folderId: fid, isOpen: !isOpen }))
    }

    useEffect(() => {
        if (folderDepth === 0) {
            dispatch(gs.setFolderOpen({ folderId: fid, isOpen: true }))
        }
    }, [folderDepth, dispatch, fid])

    return (
        <div className="folder" style={{ flexShrink: 0 }}>
            <div
                className="folder__line group"
                style={{ paddingLeft: offset(folderDepth) }}
                onClick={toggleOpen}
                onContextMenu={() => {
                    dispatch(gs.setFolderOpen({ folderId: fid, isOpen: true }))
                    dispatch(gs.rightClickFolder(fid))
                }}
            >
                <div className="folder__icon">
                    <FontAwesomeIcon
                        icon={isOpen ? faChevronDown : faChevronRight}
                        style={{ fontSize: '10px', opacity: 0.5 }}
                    />
                </div>
                {(() => {
                    const { icon, color } = getFolderIcon(folder.name, isOpen)
                    return (
                        <FontAwesomeIcon
                            icon={icon}
                            style={{
                                marginRight: '8px',
                                color,
                                opacity: 0.9,
                                fontSize: '14px',
                            }}
                        />
                    )
                })()}

                {folder.renameName != null ? (
                    <input
                        autoFocus
                        className="folder__nameinput"
                        value={folder.renameName}
                        onChange={(e) =>
                            dispatch(
                                gs.updateRenameName({
                                    fid,
                                    new_name: e.target.value,
                                    isFolder: true,
                                })
                            )
                        }
                        onKeyDown={(e) => {
                            if (e.key == 'Enter')
                                dispatch(
                                    gs.commitRename({ fid, isFolder: true })
                                )
                            if (e.key == 'Escape') dispatch(gs.cancelRename())
                        }}
                        onBlur={() =>
                            dispatch(gs.commitRename({ fid, isFolder: true }))
                        }
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <div
                        className="folder__name truncate"
                        style={{ flexGrow: 1 }}
                    >
                        {folder.name}
                    </div>
                )}

                <div className="folder__hoverbuttons">
                    <div
                        className="folder__hoverbutton"
                        onClick={(e) => {
                            e.stopPropagation()
                            dispatch(gs.newFile({ parentFolderId: fid }))
                        }}
                    >
                        <FontAwesomeIcon icon={faFileCirclePlus} />
                    </div>
                    <div
                        className="folder__hoverbutton"
                        onClick={(e) => {
                            e.stopPropagation()
                            dispatch(gs.newFolder({ parentFolderId: fid }))
                        }}
                    >
                        <FontAwesomeIcon icon={faFolderPlus} />
                    </div>
                </div>
            </div>
            {isOpen && (
                <div className="folder__below">
                    {folder.folderIds?.map((fid: number) => {
                        return <Folder key={`folder-${fid}`} fid={fid} />
                    })}
                    {fileChildren.map((fid: number) => {
                        return <File key={`file-${fid}`} fid={fid} />
                    })}
                </div>
            )}
        </div>
    )
}

export function FileTree() {
    const rootFolderId = 1
    const dispatch = useAppDispatch()
    const rootFolder = useAppSelector(getFolder(rootFolderId))
    const isOpen = useAppSelector(getFolderOpen(rootFolderId))
    const fileChildren = useAppSelector(getNotDeletedFiles(rootFolderId))

    useEffect(() => {
        if (rootFolderId) {
            dispatch(gs.setFolderOpen({ folderId: rootFolderId, isOpen: true }))
        }
    }, [dispatch])

    if (!rootFolder) {
        return <div className="p-4 text-gray-400">No folder opened</div>
    }

    const toggleOpen = () => {
        dispatch(gs.loadFolder({ folderId: rootFolderId, goDeep: false }))
        dispatch(gs.setFolderOpen({ folderId: rootFolderId, isOpen: !isOpen }))
    }

    return (
        <div
            className="w-full h-full"
            style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'var(--sidebar-bg)',
                minHeight: 0,
            }}
        >
            {/* Sticky project header */}
            <div
                className="filetree__project-header"
                style={{
                    height: '35px',
                    minHeight: '35px',
                    padding: '0 12px',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: 'var(--sidebar-bg)',
                    borderBottom: '1px solid var(--pane-border)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    color: 'var(--ui-fg)',
                    flexShrink: 0,
                    zIndex: 5,
                }}
                onClick={toggleOpen}
                onContextMenu={() => {
                    dispatch(
                        gs.setFolderOpen({
                            folderId: rootFolderId,
                            isOpen: true,
                        })
                    )
                    dispatch(gs.rightClickFolder(rootFolderId))
                }}
            >
                <FontAwesomeIcon
                    icon={isOpen ? faChevronDown : faChevronRight}
                    style={{
                        fontSize: '9px',
                        opacity: 0.7,
                        marginRight: '8px',
                    }}
                />
                <div className="folder__name truncate" style={{ flexGrow: 1 }}>
                    {rootFolder.name}
                </div>
                <div className="folder__hoverbuttons">
                    <div
                        className="folder__hoverbutton"
                        onClick={(e) => {
                            e.stopPropagation()
                            dispatch(
                                gs.newFile({ parentFolderId: rootFolderId })
                            )
                        }}
                    >
                        <FontAwesomeIcon icon={faFileCirclePlus} />
                    </div>
                    <div
                        className="folder__hoverbutton"
                        onClick={(e) => {
                            e.stopPropagation()
                            dispatch(
                                gs.newFolder({ parentFolderId: rootFolderId })
                            )
                        }}
                    >
                        <FontAwesomeIcon icon={faFolderPlus} />
                    </div>
                </div>
            </div>

            {/* Scrollable content */}
            <div
                className="filetree__content"
                style={{ flexGrow: 1, overflowY: 'auto', minHeight: 0 }}
            >
                {isOpen && (
                    <>
                        {rootFolder.folderIds?.map((fid: number) => {
                            return <Folder key={`folder-${fid}`} fid={fid} />
                        })}
                        {fileChildren.map((fid: number) => {
                            return <File key={`file-${fid}`} fid={fid} />
                        })}
                    </>
                )}
            </div>
        </div>
    )
}
