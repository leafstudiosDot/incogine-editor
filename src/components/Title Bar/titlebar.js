import './titlebar.css';
const isMac = process.platform === 'darwin'

export default function TitleBar(props) {
    return (<div className="titleBar" style={{ width: props.winsize.width, height: props.titleMenuBarSpace }}>
        {isMac ?
            <div className="titleBar-mac">
                <span className="titleBar-mac-greybutton" />
                <span className="titleBar-mac-greybutton" style={{ left: "28px" }} />
                <span className="titleBar-mac-greybutton" style={{ left: "48px" }} />
            </div>
            : null}
    </div>)
}