import React, { useEffect } from 'react'

import { useAppDispatch, useAppSelector } from '../app/hooks'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faFileCode,
    faFileLines,
    faFileCirclePlus,
    faFolderPlus,
    faPuzzlePiece,
    faPalette,
    faVial,
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
    faRotateRight,
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
        return (
            <FontAwesomeIcon icon={faGear} className="file-icon icon--json" />
        )
    if (fname.toLowerCase().includes('config'))
        return (
            <FontAwesomeIcon icon={faGear} className="file-icon icon--config" />
        )
    if (fname.toLowerCase().startsWith('readme'))
        return (
            <FontAwesomeIcon
                icon={faFileLines}
                className="file-icon icon--md"
            />
        )
    if (fname.toLowerCase().includes('license'))
        return (
            <FontAwesomeIcon
                icon={faFileCode}
                className="file-icon icon--config"
            />
        )

    // language mappings
    if (['js', 'cjs', 'mjs'].includes(ext))
        return <FontAwesomeIcon icon={faCode} className="file-icon icon--js" />
    if (ext === 'ts')
        return <FontAwesomeIcon icon={faCode} className="file-icon icon--ts" />
    if (ext === 'tsx' || ext === 'jsx')
        return (
            <FontAwesomeIcon icon={faCode} className="file-icon icon--react" />
        )
    if (ext === 'py')
        return <FontAwesomeIcon icon={faCode} className="file-icon icon--py" />
    if (ext === 'html' || ext === 'htm')
        return (
            <FontAwesomeIcon icon={faCode} className="file-icon icon--html" />
        )
    if (['css', 'scss', 'sass', 'less'].includes(ext))
        return <FontAwesomeIcon icon={faCode} className="file-icon icon--css" />
    if (ext === 'md' || ext === 'markdown')
        return (
            <FontAwesomeIcon
                icon={faFileLines}
                className="file-icon icon--md"
            />
        )
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(ext))
        return (
            <FontAwesomeIcon icon={faImage} className="file-icon icon--img" />
        )
    if (['sh', 'bash', 'zsh', 'bat', 'cmd', 'ps1'].includes(ext))
        return (
            <FontAwesomeIcon
                icon={faTerminalIcon}
                className="file-icon icon--config"
            />
        )
    if (ext === 'pdf')
        return (
            <FontAwesomeIcon
                icon={faFilePdf}
                className="file-icon icon--config"
            />
        )
    if (ext === 'csv')
        return (
            <FontAwesomeIcon
                icon={faFileCsv}
                className="file-icon icon--config"
            />
        )
    if (['zip', 'tar', 'gz', 'rar', '7z'].includes(ext))
        return (
            <FontAwesomeIcon
                icon={faFileArchive}
                className="file-icon icon--config"
            />
        )
    if (ext === 'sql' || ext === 'db')
        return (
            <FontAwesomeIcon
                icon={faDatabase}
                className="file-icon icon--config"
            />
        )

    return <FontAwesomeIcon icon={faFile} className="file-icon opacity-40" />
}

function getFolderIcon(name: string, isOpen: boolean) {
    const lname = name.toLowerCase()

    // Coordination colors for folders
    if (lname === '.github' || lname === '.git')
        return {
            icon: isOpen ? faFolderOpen : faFolder,
            className: 'icon--config',
        }
    if (lname === 'node_modules' || lname === 'dist' || lname === 'build')
        return { icon: faCube, className: 'icon--config' }
    if (lname === 'src')
        return { icon: isOpen ? faFolderOpen : faFolder, className: 'icon--ts' }
    if (lname === 'components')
        return { icon: faPuzzlePiece, className: 'icon--react' }
    if (lname === 'assets' || lname === 'public')
        return { icon: faImages, className: 'icon--img' }
    if (lname === 'tests' || lname === '__tests__')
        return { icon: faVial, className: 'icon--py' }
    if (lname === 'theme' || lname === 'styles')
        return { icon: faPalette, className: 'icon--css' }

    return { icon: isOpen ? faFolderOpen : faFolder, className: 'icon--folder' }
}

function File({ fid }: { fid: number }) {
    const dispatch = useAppDispatch()
    const file = useAppSelector(getFile(fid))
    const depth = useAppSelector(getDepth(fid, true))

    if (!file || file.name.startsWith('extension://')) return null

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
                    const { icon, className } = getFolderIcon(
                        folder.name,
                        isOpen
                    )
                    return (
                        <FontAwesomeIcon
                            icon={icon}
                            className={`file-icon ${className}`}
                            style={{
                                marginRight: '8px',
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
                className="filetree__project-header relative"
                style={{
                    height: '42px',
                    minHeight: '42px',
                    padding: '0 8px 0 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: 'var(--sidebar-bg)',
                    borderTop: '1px solid var(--pane-border)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    color: 'var(--ui-fg)',
                    flexShrink: 0,
                    zIndex: 20,
                }}
            >
                {/* Left: Project Name */}
                <div
                    className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
                    onClick={toggleOpen}
                >
                    <FontAwesomeIcon
                        icon={isOpen ? faChevronDown : faChevronRight}
                        style={{
                            fontSize: '9px',
                            opacity: 0.7,
                        }}
                    />
                    <div className="truncate font-bold text-[11px]">
                        {rootFolder.name}
                    </div>
                </div>

                {/* Right: Action Buttons */}
                <div className="flex items-center gap-0.5">
                    <button
                        className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--ui-hover)] text-[var(--ui-fg-muted)] hover:text-[var(--ui-fg)] transition-colors"
                        onClick={(e) => {
                            e.stopPropagation()
                            dispatch(
                                gs.newFile({ parentFolderId: rootFolderId })
                            )
                        }}
                        title="New File"
                        type="button"
                    >
                        <FontAwesomeIcon
                            icon={faFileCirclePlus}
                            className="text-xs"
                        />
                    </button>
                    <button
                        className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--ui-hover)] text-[var(--ui-fg-muted)] hover:text-[var(--ui-fg)] transition-colors"
                        onClick={(e) => {
                            e.stopPropagation()
                            dispatch(
                                gs.newFolder({ parentFolderId: rootFolderId })
                            )
                        }}
                        title="New Folder"
                        type="button"
                    >
                        <FontAwesomeIcon
                            icon={faFolderPlus}
                            className="text-xs"
                        />
                    </button>
                    <button
                        className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--ui-hover)] text-[var(--ui-fg-muted)] hover:text-[var(--ui-fg)] transition-colors"
                        onClick={(e) => {
                            e.stopPropagation()
                            dispatch(
                                gs.loadFolder({
                                    folderId: rootFolderId,
                                    goDeep: true,
                                })
                            )
                        }}
                        title="Refresh Explorer"
                        type="button"
                    >
                        <FontAwesomeIcon
                            icon={faRotateRight}
                            className="text-xs"
                        />
                    </button>
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
