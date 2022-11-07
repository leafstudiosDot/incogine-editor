import { ipcRenderer } from 'electron';
import { useState, useEffect } from 'react';
import './settings.css';

function SettingList(props) {
    let oldprops = [...props.docs.docs];
    return (
        <div className="settings-lists">
            <ul style={{ height: props.size.height - 67 }}>

                <li onClick={() => {
                    oldprops[props.docs.selected] = {
                        title: "Settings",
                        file: null,
                        content: "about",
                        saved: true,
                        type: "settings",
                    }
                    props.setCateg({ selected: props.docs.selected, docs: [...oldprops] })
                }}>About</li>
                <li onClick={() => {
                    oldprops[props.docs.selected] = {
                        title: "Settings",
                        file: null,
                        content: "theme",
                        saved: true,
                        type: "settings",
                    }
                    props.setCateg({ selected: props.docs.selected, docs: [...oldprops] })
                }}>Theme</li>
                <li onClick={() => {
                    oldprops[props.docs.selected] = {
                        title: "Settings",
                        file: null,
                        content: "connections",
                        saved: true,
                        type: "settings",
                    }
                    props.setCateg({ selected: props.docs.selected, docs: [...oldprops] })
                }}>Connections</li>
            </ul>
        </div>
    )
}

function SettingWindow(props) {
    function AboutPage() {
        return (<div >
            <h1>Incogine Editor v0.1.2</h1>
            <span>© 2022 leafstudiosDot</span>
        </div>)
    }

    function ThemePage() {
        return (<div>
            <h1>Theme</h1>
        </div>)
    }

    function ConnectionsPage() {
        const [twitterConnected, setTwitterConnected] = useState(false);

        function connectTwitter(userid) {
            if (userid) {
                setTwitterConnected(true);
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
                <div style={{width: twitterConnected ? (props.size.width - 356) : (props.size.width - 231)}} class="connection-connect" id="connect-twitter" onClick={() => {ipcRenderer.send('connections:twitter')}}>Connect to Twitter</div>
                {twitterConnected ? (<span><div style={{width: 100, marginLeft: 5}} class="connection-connect" id="connection-disconnect" onClick={() => {disconnectTwitter()}}>Disconnect</div></span>) : (null)}
            </div>
        </div>)
    }

    return (
        <div id="settingWindowContent" style={{ height: props.size.height - 57, width: props.size.width - 191 }}>
            {props.docs.docs[props.docs.selected].content === "about" ? <AboutPage /> : null}
            {props.docs.docs[props.docs.selected].content === "theme" ? <ThemePage /> : null}
            {props.docs.docs[props.docs.selected].content === "connections" ? <ConnectionsPage /> : null}
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