import { useState } from 'react'
import './anim.css'

export default function VideoEditor(props) {
    return (
        <div className="anim-container" style={{ width: props.winsize.width, height: props.winsize.height - 26 }}>
            <canvas></canvas>
        </div>
    )
}