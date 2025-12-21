import React, { useEffect } from 'react'

import { useAppDispatch, useAppSelector } from '../app/hooks'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faChevronDown,
    faChevronRight,
} from '@fortawesome/sharp-solid-svg-icons'
import * as gs from '../features/globalSlice'

import {
    getDepth,
    getFile,
    getFolder,
    getFolderOpen,
    getNotDeletedFiles,
} from '../features/selectors'
import {
    faFileCirclePlus,
    faFolderPlus,
} from '@fortawesome/pro-regular-svg-icons'
import posthog from 'posthog-js'

function offset(depth: number) {
    return `${depth * 1 + 1}rem`
}

    'bz2',
    'xz',
import { FileIcon } from './fileIcons'

export function getIconElement(fname: string) {
    return <FileIcon fileName={fname} />
}

function File({ fid }: { fid: number }) {
    const dispatch = useAppDispatch()
    const file = useAppSelector(getFile(fid))
    const depth = useAppSelector(getDepth(fid, true))

    const iconElement = getIconElement(file.name)

    //const ext = file.name.split('.').pop()!;
    return (
        <div
            className={`file__line ${
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
                    }}
                    onClick={(e) => e.stopPropagation()}
                />
            ) : (
                <div className="file__name truncate">{file.name}</div>
            )}
        </div>
    )
}

function Folder({ fid }: { fid: number }) {
    const isOpen = useAppSelector(getFolderOpen(fid))
    const dispatch = useAppDispatch()
    const toggleOpen = () => {
        dispatch(gs.loadFolder({ folderId: fid, goDeep: false }))
        dispatch(gs.setFolderOpen({ folderId: fid, isOpen: !isOpen }))
    }
    const folder = useAppSelector(getFolder(fid))
    const fileChildren = useAppSelector(getNotDeletedFiles(fid))

    const folderDepth = useAppSelector(getDepth(fid))

    useEffect(() => {
        if (folderDepth == 0) {
            dispatch(gs.setFolderOpen({ folderId: fid, isOpen: true }))
        }
    }, [])

    const isTopLevel = true //fid == 1;
    const hoverButtonsField = !isTopLevel ? (
        <></>
    ) : (
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
    )

    return (
        <div className="folder">
            <div
                className="folder__line"
                style={{ paddingLeft: offset(folderDepth) }}
                onClick={toggleOpen}
                onContextMenu={() => {
                    dispatch(gs.setFolderOpen({ folderId: fid, isOpen: true }))
                    dispatch(gs.rightClickFolder(fid))
                }}
            >
                <div className="folder__icon">
                    <FileIcon fileName={folder.name} isFolder={true} isOpen={isOpen} />
                </div>
                <div className="folder__chevron">
                    {isOpen ? (
                        <FontAwesomeIcon icon={faChevronDown} />
                    ) : (
                        <FontAwesomeIcon icon={faChevronRight} />
                    )}
                </div>

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
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <>
                        <div className="folder__name truncate">
                            {folder.name}
                        </div>
                        {hoverButtonsField}
                    </>
                )}
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

    const toggleOpen = () => {
        dispatch(gs.loadFolder({ folderId: rootFolderId, goDeep: false }))
        dispatch(gs.setFolderOpen({ folderId: rootFolderId, isOpen: !isOpen }))
    }

    useEffect(() => {
        dispatch(gs.setFolderOpen({ folderId: rootFolderId, isOpen: true }))
    }, [])

    return (
        <div className="window__leftpane colortheme">
            {/* Sticky project header */}
            <div
                className="filetree__project-header"
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
                <div className="folder__icon">
                    {isOpen ? (
                        <FontAwesomeIcon icon={faChevronDown} />
                    ) : (
                        <FontAwesomeIcon icon={faChevronRight} />
                    )}
                </div>
                <div className="folder__name truncate">{rootFolder.name}</div>
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
            <div className="filetree__content">
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
