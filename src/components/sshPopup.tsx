import React, { useState } from 'react'
import Modal from 'react-modal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faClose,
    faTerminal,
    faFolder,
} from '@fortawesome/pro-regular-svg-icons'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import * as gs from '../features/globalSlice'
import * as gsel from '../features/selectors'

const customStyles = {
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
    },
    content: {
        padding: '0',
        top: '150px',
        bottom: 'auto',
        background: 'var(--black-elevated)',
        border: '1px solid var(--ui-border)',
        width: '500px',
        height: 'auto',
        marginLeft: 'auto',
        marginRight: 'auto',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 25px 70px rgba(0, 0, 0, 0.8)',
    },
}

export function SSHPopup() {
    const showRemotePopup = useAppSelector(gsel.getShowRemotePopup)
    const remoteCommand = useAppSelector(gsel.getRemoteCommand)
    const remotePath = useAppSelector(gsel.getRemotePath)
    const remoteBad = useAppSelector(gsel.getRemoteBad)
    const dispatch = useAppDispatch()

    // Local state for immediate feedback/validation if needed,
    // but we are syncing with global state as per original design.

    const [isConnecting, setIsConnecting] = useState(false)

    function submit() {
        if (remoteCommand.length > 2 && remotePath.length > 2) {
            setIsConnecting(true)
            dispatch(gs.openRemoteFolder(null)).finally(() => {
                setIsConnecting(false)
            })
        }
    }

    const onClose = () => {
        dispatch(gs.closeRemotePopup())
    }

    return (
        <Modal
            isOpen={showRemotePopup}
            onRequestClose={onClose}
            style={customStyles}
            ariaHideApp={false}
        >
            <div className="flex flex-col h-full bg-[#1e1e1e] text-[#cccccc] rounded-xl overflow-hidden font-sans">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-[#333333] bg-[#252526]">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-white flex items-center gap-2">
                        <FontAwesomeIcon
                            icon={faTerminal}
                            className="text-accent"
                        />
                        Connect via SSH
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors outline-none"
                    >
                        <FontAwesomeIcon icon={faClose} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col gap-5">
                    {remoteBad && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded text-xs">
                            The SSH command or path you entered is invalid.
                            Please try again.
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            SSH Command
                        </label>
                        <div className="relative group">
                            <input
                                type="text"
                                className="w-full bg-black/20 border border-[#3c3c3c] rounded px-3 py-2.5 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-gray-600"
                                placeholder="ssh -i ~/keys/my-key.pem ubuntu@1.2.3.4"
                                value={remoteCommand}
                                onChange={(e) =>
                                    dispatch(
                                        gs.setRemoteCommand(e.target.value)
                                    )
                                }
                                onKeyDown={(e) => e.key === 'Enter' && submit()}
                                autoFocus
                            />
                        </div>
                        <p className="text-[10px] text-gray-500">
                            Enter the full SSH command you use to connect in
                            your terminal.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Remote Folder Path
                        </label>
                        <div className="relative group">
                            <input
                                type="text"
                                className="w-full bg-black/20 border border-[#3c3c3c] rounded px-3 py-2.5 pl-9 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-gray-600"
                                placeholder="/home/ubuntu/project"
                                value={remotePath}
                                onChange={(e) =>
                                    dispatch(gs.setRemotePath(e.target.value))
                                }
                                onKeyDown={(e) => e.key === 'Enter' && submit()}
                            />
                            <div className="absolute left-3 top-2.5 text-gray-500">
                                <FontAwesomeIcon icon={faFolder} />
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-500">
                            Absolute path to the directory you want to open on
                            the remote server.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-[#252526] border-t border-[#333333] flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={submit}
                        disabled={isConnecting || !remoteCommand || !remotePath}
                        className={`
                            px-4 py-2 rounded text-xs font-semibold text-white transition-all
                            ${
                                isConnecting || !remoteCommand || !remotePath
                                    ? 'bg-accent/50 cursor-not-allowed opacity-70'
                                    : 'bg-accent hover:bg-accent-hover shadow-lg shadow-accent/20'
                            }
                        `}
                    >
                        {isConnecting ? 'Connecting...' : 'Connect Window'}
                    </button>
                </div>
            </div>
        </Modal>
    )
}
