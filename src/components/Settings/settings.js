import { ipcRenderer } from 'electron';
import { useState, useEffect } from 'react';
import './settings.css';

import twitterlogo from './connections_logo/twitter.svg';

function SettingList(props) {
    var settingList = [
        {
            type: "button",
            label: "About",
            content: "about"
        },
        {
            type: "button",
            label: "Theme",
            content: "theme"
        },
        {
            type: "button",
            label: "Connections",
            content: "connections"
        }, 
        {
            type: "button",
            label: "Miscaellaneous",
            content: "misc"
        }
    ]
    let oldprops = [...props.docs.docs];
    function SettingButton(type, label, content) {
        switch (type) {
            case "button":
                return (
                    <li style={{backgroundColor: oldprops[props.docs.selected].content === content ? "#535353" : null}} onClick={() => {
                        oldprops[props.docs.selected] = {
                            title: "Settings - " + label,
                            file: null,
                            content: content,
                            saved: true,
                            type: "settings",
                        }
                        props.setCateg({ selected: props.docs.selected, docs: [...oldprops] })
                    }}>{label}</li>
                )
            default:
                return null
        }

    }
    return (
        <div className="settings-lists">
            <ul style={{ height: props.size.height - 67 }}>
                {settingList.map((setting, index) => {
                    return SettingButton(setting.type, setting.label, setting.content)
                })}
            </ul>
        </div>
    )
}

function SettingWindow(props) {
    function AboutPage() {
        return (<div >
            <h1>Incogine Editor v0.1.2</h1>
            <span>© 2022 leafstudiosDot. All rights reserved</span><br />
            <span>Incogine Editor is made powered by <span onClick={() => ipcRenderer.send('openLink', 'https://www.electronjs.org/')}>Electron</span> and other open-source projects</span>
        </div>)
    }

    function ThemePage() {
        return (<div>
            <h1>Theme</h1>
        </div>)
    }

    function ConnectionsPage() {
        const [twitterConnected, setTwitterConnected] = useState(false);
        const [twitterUsername, setTwitterUsername] = useState("");

        function connectTwitter(userid) {
            if (userid) {
                setTwitterConnected(true);
                setTwitterUsername("")
                setTimeout(() => {
                    setTwitterUsername(localStorage.getItem("twitter_username"));
                }, 100)
            } else {
                setTwitterConnected(false);
            }
        }
        window.connection_ConnectTwitter = connectTwitter;

        function disconnectTwitter() {
            ipcRenderer.send('connections-disconnect:twitter');
            setTwitterConnected(false);
        }

        useEffect(() => {
            connectTwitter(localStorage.getItem("twitter_userid"))
        }, [])

        return (<div>
            <h1>Connections</h1>
            <div class="connection-list">
                <div style={{ width: twitterConnected ? (props.size.width - 356) : (props.size.width - 231) }} class="connection-connect" id="connect-twitter" onClick={() => {
                    if (!twitterConnected) {
                        ipcRenderer.send('connections:twitter')
                    }
                }}><img style={{ width: "30px", position: "absolute", marginTop: "-5px", marginLeft: "-5px" }} src={twitterlogo} alt="Twitter" /><span style={{ marginLeft: 30 }}>
                        {twitterConnected ? (twitterUsername === "" ? (<span>Loading...</span>) : (
                            <span>@{twitterUsername}</span>
                        )) : (<span>Connect to Twitter</span>)}
                    </span></div>
                {twitterConnected ? (<span><div style={{ width: 100, marginLeft: 5 }} class="connection-connect" id="connection-disconnect" onClick={() => { disconnectTwitter() }}>Disconnect</div></span>) : (null)}
            </div>
        </div>)
    }

    function MiscPage() {
        const [vimMode, setVimMode] = useState(false);
        function ToggleVimMode(sure) {
            setVimMode(sure)

            if (sure) {
                
            }
        }
        return (<div>
            <h1>Miscellaneous</h1>
            <div class="settings-checkmark">
                <span id="settings-checkmark" style={{ backgroundColor: vimMode ? ("#00ae0f") : (null) }} onClick={() => {setVimMode(vimMode ? (false) : (true))}}></span>
                <span style={{ position: "absolute", marginTop: "-1px"}}>
                    Vim Mode
                </span>
            </div>
        </div>)
    }

    function renderSetting() {
        switch (props.docs.docs[props.docs.selected].content) {
            case "about":
                return AboutPage()
            case "theme":
                return ThemePage()
            case "connections":
                return ConnectionsPage()
            case "misc":
                return MiscPage()
            default:
                return AboutPage()
        }
    }

    return (
        <div id="settingWindowContent" style={{ height: props.size.height - 57, width: props.size.width - 191 }}>
            {renderSetting()}
        </div>
    )
}

export default function SettingsPage(props) {
    return (
        <div className="settingspage-cont" style={{
            width: props.winsize.width,
            height: props.winsize.height - 56
        }}>
            <SettingList size={props.winsize} docs={props.docs} setCateg={props.setDocs} />
            <SettingWindow size={props.winsize} docs={props.docs} />
        </div>
    )
}