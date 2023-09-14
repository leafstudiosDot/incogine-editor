import { useState } from 'react'
import './anim.css'

export default function VideoEditor(props) {
    return (
        <div className="anim-container" style={{ width: props.winsize.width, height: props.winsize.height - 26 }}>
            <iframe style={{
                width: "100%",
                height: "100%",
                position: "fixed",
                border: "none"
            }} title="Animation" src={`http://localhost:3619`} />
        </div>
    )
}