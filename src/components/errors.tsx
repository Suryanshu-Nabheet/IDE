import { useAppDispatch, useAppSelector } from '../app/hooks'
import { closeError } from '../features/globalSlice'
import { getError, getShowErrors } from '../features/selectors'
import { faClose } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Modal from 'react-modal'
// import { NoAuthGlobalOldRateLimitError, NotLoggedInError } from '../utils'

// import { signIn, upgrade } from '../features/tools/toolSlice'

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
        maxWidth: '600px',
    },
}

export function ErrorPopup() {
    const showError = useAppSelector(getShowErrors)
    const error = useAppSelector(getError)
    const dispatch = useAppDispatch()

    if (error == null) {
        return (
            <Modal
                isOpen={showError}
                onRequestClose={() => {
                    dispatch(closeError())
                }}
                style={customStyles}
            >
                <div className="errorPopup">
                    <div className="errorPopup__title">
                        <div className="errorPopup__title_text">
                            We ran into a problem
                        </div>
                        <div
                            className="errorPopup__title_close"
                            onClick={() => dispatch(closeError())}
                        >
                            <FontAwesomeIcon icon={faClose} />
                        </div>
                    </div>
                    <div className="errorPopup__body">
                        Something unexpected happened. Please try again later.
                        If this continues, please contact suryashunab@gmail.com.
                        <br />
                    </div>
                </div>
            </Modal>
        )
        // NotLoggedInError block removed
        // NoAuthGlobalOldRateLimitError block removed
    } else {
        return (
            <Modal
                isOpen={true || showError}
                onRequestClose={() => {
                    dispatch(closeError())
                }}
                style={customStyles}
            >
                <div className="errorPopup">
                    <div className="errorPopup__title">
                        <div className="errorPopup__title_text">
                            {error.title}
                        </div>
                        <div
                            className="errorPopup__title_close"
                            onClick={() => dispatch(closeError())}
                        >
                            <FontAwesomeIcon icon={faClose} />
                        </div>
                    </div>
                    <div className="errorPopup__body">
                        {error.message}
                        <br />
                    </div>
                </div>
            </Modal>
        )
    }
}
