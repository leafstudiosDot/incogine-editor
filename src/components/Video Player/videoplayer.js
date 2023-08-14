import './videoplayer.css'

export default function VideoPlayer(props) {
    return (
        <div className="videoPlayer" style={{ width: props.winsize.width, height: props.winsize.height - 56 }}>
            <video className="videoPlayer-video" src={props.docsState.docs[props.docsState.selected].content} width={props.winsize.width} height={props.winsize.height - 66} autoPlay loop controls />
        </div>
    )
}