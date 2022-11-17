import { ipcRenderer } from 'electron';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios'
import './settings.css';

import twitterlogo from './connections_logo/twitter.svg';

function SettingList(props) {
    var [settingList, setSettingList] = useState([
        {
            type: "grplbl",
            label: "Incogine Editor"
        },
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
            label: "Miscellaneous",
            content: "misc"
        }
    ])

    useEffect(() => {
        let oldsetlist = [...settingList]
        ipcRenderer.send('getExtSettings')
        ipcRenderer.on('getExtSettings-reply', async function (e, got) {

            got.map((ext) => {
                oldsetlist.push({
                    type: "grplbl",
                    label: ext.settings.title
                })
                return ext.settings.content.map(async (extsetting) => {
                    oldsetlist.push({
                        type: extsetting.type,
                        label: extsetting.label,
                        content: ext.detail.extid
                    })
                    setSettingList(oldsetlist)
                })
            })

        })
    }, [])

    let oldprops = [...props.docs.docs];
    function SettingButton(type, label, content) {
        switch (type) {
            case "button":
                return (
                    <li style={{ backgroundColor: oldprops[props.docs.selected].content === content ? "#535353" : null }} onClick={() => {
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
            case "grplbl":
                return (
                    <span style={{
                        fontSize: "10px",
                        position: "relative",
                        top: "-5px"
                    }}>{label}</span>
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
    // States
    // Connections
    const [twitterConnected, setTwitterConnected] = useState(false);
    const [twitterUsername, setTwitterUsername] = useState("");
    // Misc
    const [vimMode, setVimMode] = useState(false);
    //End States

    // Effects
    useEffect(() => {
        // Connections
        connectTwitter(localStorage.getItem("twitter_token"))
        // Misc
        ipcRenderer.on('get-fromstorage-reply', (event, got) => {
            let realgot = String(got).split(";")
            if (realgot[0] === "vimmode") {
                if (realgot[1] === "true") {
                    setVimMode(true)
                } else {
                    setVimMode(false)
                }
            }
        })
    }, [])

    // Misc
    function connectTwitter(token) {
        if (token) {
            setTwitterConnected(true);
            setTwitterUsername("")

            fetch("https://incoeditapi.hodots.com/connections/twitter2/user?access_token=" + localStorage.getItem("twitter_token"), {
                method: "GET",
                mode: 'no-cors',
                headers: new Headers({
                    'Content-Type': 'application/json',
                }),
                withCredentials: true,
                credentials: 'same-origin',
            })
                .then(res => res.json())
                .then(data => {
                    setTwitterUsername(data.data.username)
                })
                .catch(err => {
                    console.error("Twitter connection error.")
                })

            setTimeout(() => {
                setTwitterUsername("");
            }, 100)
        } else {
            setTwitterConnected(false);
        }
    }
    window.connection_ConnectTwitter = connectTwitter;

    function AboutPage() {
        return (<div>
            <h1>Incogine Editor v0.1.2</h1>
            <span>© 2022 leafstudiosDot. All rights reserved</span><br />
            <span>Incogine Editor powered by <span onClick={() => ipcRenderer.send('openLink', 'https://www.electronjs.org/')}>Electron</span> and other open-source projects</span>
        </div>)
    }

    function ThemePage() {
        return (<div>
            <h1>Theme</h1>
            <select name="incoedit-theme" id="dropdown-settings" style={{ width: props.size.width - 220 }}>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
            </select>
        </div>)
    }

    function ConnectionsPage() {
        function disconnectTwitter() {
            ipcRenderer.send('connections-disconnect:twitter');
            setTwitterConnected(false);
        }

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
        function ToggleVimMode(sure) {
            setVimMode(sure)
            ipcRenderer.send('set-fromstorage', { key: 'vimmode', value: sure })
            ipcRenderer.send('get-fromstorage', { callbackname: 'vimmode', key: 'vimmode' })
        }

        return (<div>
            <h1>Miscellaneous</h1>
            <div class="settings-checkmark">
                <span id="settings-checkmark" style={{ backgroundColor: vimMode ? ("#00ae0f") : (null) }} onClick={() => { ToggleVimMode(vimMode ? (false) : (true)) }}></span>
                <span style={{ position: "absolute", marginTop: "-1px" }}>
                    Vim Mode (Not working yet)
                </span>
            </div>
        </div>)
    }

    function RenderSetting(props) {
        var [renderList, setRenderList] = useState([])

        useEffect(() => {
            let oldsetlist = [...renderList]
            ipcRenderer.on('getExtSettings-reply', async function (e, got) {

                got.map((ext) => {
                    return oldsetlist.push({
                        content: ext.detail.extid,
                        render: <div dangerouslySetInnerHTML={{ __html: ext.settings.render }} />
                    })
                })
                setRenderList(oldsetlist)
            })
        }, [renderList])

        var matchrend = renderList.filter(rend => {
            return rend.content === props.docs.docs[props.docs.selected].content
        })

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
                if (matchrend.length > 0) {
                    return matchrend[0].render
                } else {
                    return AboutPage()
                }
        }
    }

    return (
        <div id="settingWindowContent" style={{ height: props.size.height - 57, width: props.size.width - 191 }}>
            {RenderSetting(props)}
        </div>
    )
}

export default function SettingsPage(props) {
    useEffect(() => {
        ipcRenderer.send('get-fromstorage', { callbackname: 'vimmode', key: 'vimmode' })
    })
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