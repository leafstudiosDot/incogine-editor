import './titlebar.css';
const isMac = process.platform === 'darwin'
const { ipcRenderer } = require("electron");

function openMenu(x, y) {
    ipcRenderer.send(`display-app-menu`, { x, y });
}

export default function TitleBar(props) {
    return (<div className="titleBar" style={{ width: props.winsize.width, height: props.titleMenuBarSpace }}>
        {isMac ?
            <div className="titleBar-mac">
                <span className="titleBar-mac-greybutton" />
                <span className="titleBar-mac-greybutton" style={{ left: "28px" }} />
                <span className="titleBar-mac-greybutton" style={{ left: "48px" }} />
            </div>
            :
            <div>
                <div className="titleBar-onemenu" onClick={() => openMenu(0, 5)}>
                    ☰
                </div>
		<div className="titleBar-draggable" />
                <div className="titleBar-buttons">
                    <span className="titleBar-button" id="titleBar-minimize" onClick={() => ipcRenderer.send("window-minimize")}>_</span>
                    <span className="titleBar-button" id="titleBar-maximize" onClick={() => ipcRenderer.send("toggle-maximize-window")}>&#9634;</span>
                    <span className="titleBar-button" id="titleBar-close" onClick={() => ipcRenderer.send("window-close")}>X</span>
                </div>
            </div>
        }
    </div>)
}
