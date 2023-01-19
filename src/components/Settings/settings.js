import { ipcRenderer } from 'electron';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios'
import './settings.css';

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
    // Misc
    const [vimMode, setVimMode] = useState(false);
    const [themeSet, setTheme] = useState("dark");
    //End States

    // Effects
    useEffect(() => {
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

            console.log(realgot)
            if (realgot[0] === "theme") {
                setTheme(realgot[1])
                document.documentElement.setAttribute("data-theme", realgot[1]);
            } else {
                setTheme("dark")
            }
        })
    }, [])

    // Misc
    function AboutPage() {
        return (<div>
            <h1>Incogine Editor v0.1.5 Open Source</h1>
            <span>© 2023 leafstudiosDot. All rights reserved</span><br />
            <span>Incogine Editor powered by <span onClick={() => ipcRenderer.send('openLink', 'https://www.electronjs.org/')}>Electron</span> and other open-source projects</span>
        </div>)
    }

    function ThemePage() {
        function ThemeChange(theme) {
            setTheme(theme.target.value)
            document.documentElement.setAttribute("data-theme", theme.target.value);
            ipcRenderer.send('set-fromstorage', { key: 'theme', value: theme.target.value })
            ipcRenderer.send('get-fromstorage', { callbackname: 'theme', key: 'theme' })
        }

        return (<div>
            <h1>Theme</h1>
            <select name="incoedit-theme" id="dropdown-settings" value={themeSet} onChange={(e) => ThemeChange(e)} style={{ width: props.size.width - 220 }}>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
            </select>
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
        ipcRenderer.send('get-fromstorage', { callbackname: 'theme', key: 'theme' })
        return () => {
            ipcRenderer.removeAllListeners('get-fromstorage-reply')
        }
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