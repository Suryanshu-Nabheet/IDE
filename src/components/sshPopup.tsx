import React, { useRef } from 'react'
import Modal from 'react-modal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose } from '@fortawesome/pro-regular-svg-icons'

import { useAppDispatch, useAppSelector } from '../app/hooks'
import * as gs from '../features/globalSlice'
import * as gsel from '../features/selectors'

const customStyles = {
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        zIndex: 10000,
    },
    content: {
        padding: 'none',
        top: '150px',
        bottom: 'none',
        background: 'none',
        border: 'none',
        width: 'auto',
        height: 'auto',
        marginLeft: 'auto',
        marginRight: 'auto',
        maxWidth: '700px',
    },
}

export function SSHPopup() {
    const showRemotePopup = useAppSelector(gsel.getShowRemotePopup)
    const remoteCommand = useAppSelector(gsel.getRemoteCommand)
    const remotePath = useAppSelector(gsel.getRemotePath)
    const remoteBad = useAppSelector(gsel.getRemoteBad)
    const dispatch = useAppDispatch()
    const textInputRef = useRef<HTMLInputElement>(null)
    const textInputRef2 = useRef<HTMLInputElement>(null)

    function submit() {
        // if the inputs have more than 2 chars each
        if (
            textInputRef.current!.value.length > 2 &&
            textInputRef2.current!.value.length > 2
        ) {
            dispatch(gs.openRemoteFolder(null))
        }
    }

    return (
        <Modal
            isOpen={showRemotePopup}
            onRequestClose={() => {
                dispatch(gs.closeRemotePopup())
            }}
            style={customStyles}
        >
            <div className="errorPopup">
                <div className="errorPopup__title">
                    <div className="errorPopup__title_text">
                        Connect to SSH directory
                    </div>
                    <div
                        className="remotePopup__title_close"
                        onClick={() => dispatch(gs.closeRemotePopup())}
                    >
                        <FontAwesomeIcon icon={faClose} />
                    </div>
                </div>
                {remoteBad && (
                    <div className="errorPopup__body">
                        The SSH command or path you entered is invalid. Please
                        try again.
                    </div>
                )}
                <div className="remotePopup__body">
                    <div className="settings__item_title">SSH Command</div>
                    <div className="settings__item_description">
                        Same command you would put in the terminal
                    </div>
                    <input
                        type="text"
                        placeholder="ssh -i ~/keys/mypemfile.pem ubuntu@ec2dns.aws.com"
                        ref={textInputRef}
                        value={remoteCommand}
                        onChange={(e) =>
                            dispatch(gs.setRemoteCommand(e.target.value))
                        }
                    />
                </div>
                <div className="remotePopup__body">
                    <div className="settings__item_title">Target Folder</div>
                    <div className="settings__item_description">
                        Must be an absolute path
                    </div>
                    <input
                        type="text"
                        placeholder="/home/ubuntu/portal/"
                        value={remotePath}
                        ref={textInputRef2}
                        onChange={(e) =>
                            dispatch(gs.setRemotePath(e.target.value))
                        }
                        onKeyDown={(event: any) => {
                            if (event.key === 'Enter') {
                                submit()
                            }
                        }}
                    />
                </div>
                <div className="submit-button-parent">
                    <button
                        className="submit-button-ssh"
                        onClick={() => {
                            submit()
                        }}
                    >
                        Submit
                    </button>
                </div>
            </div>
        </Modal>
    )
}
