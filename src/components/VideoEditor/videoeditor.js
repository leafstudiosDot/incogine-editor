import { useEffect } from 'react'
import './videoeditor.css'
import videoeditorapp from './videoedit/index.html'

export default function VideoEditor(props) {

    useEffect(() => {

    }, []);

    return (
        <div className="videoEditor-container" style={{ width: props.winsize.width, height: props.winsize.height - 26 }}>
            <iframe style={{
                width: "100%",
                height: "100%",
                position: "fixed",
                border: "none"
            }} title="Video Editor" src={`http://localhost:3618`} />
        </div>
    )
}