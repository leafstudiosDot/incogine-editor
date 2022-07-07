import './notify.css'

export default function NotificationWindow(props) {
    return (
        <div className="notify-window-cont">
            <span className="notify-window-header">{props.header}</span>
            <br />
            <span className="notify-window-body">{props.body}</span>
            <span id="notify-window-button" onClick={() => props.accept()}>OK</span>
        </div>
    )
}