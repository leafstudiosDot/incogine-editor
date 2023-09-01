import { useState } from 'react'
import './videoeditor.css'

export default function VideoEditor(props) {
    const [projectVideoDetail, setProjectVideoDetail] = useState({
        name: "",
        frametl: 0,
        framerate: 24,

    })

    return (
        <div className="videoEditor-container" style={{ width: props.winsize.width, height: props.winsize.height - 26 }}>
            <video className="videoEditor-video" controls></video>
        </div>
    )
}