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

            </ul>
        </div>
    )
}

function SettingWindow(props) {
    function AboutPage() {
        return (<div >
            <h1>Incogine Editor v0.1.1</h1>
            <span>© 2022 leafstudiosDot</span>
        </div>)
    }

    return (
        <div id="settingWindowContent" style={{ height: props.size.height - 57, width: props.size.width - 191 }}>
            {props.docs.docs[props.docs.selected].content === "about" ? <AboutPage /> : null}
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