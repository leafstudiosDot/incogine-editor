import { ipcRenderer } from 'electron';
import { useState, useEffect, useCallback } from 'react';
import showdown from 'showdown';
import { shell } from 'electron';
import './editor.css';

export default function MarkdownEdit(props) {
    var converter = new showdown.Converter()
    const [mdtext, setMDText] = useState("");

    useEffect(() => {
        setMDText(props.docsState.docs[props.docsState.selected].content)
    }, [])

    useEffect(() => {

        const md_cont = document.getElementById('markdown-preview-content')

        const anchorTags = md_cont.getElementsByTagName('a');
        for (const anchorTag of anchorTags) {
            anchorTag.addEventListener('click', (event) => {
                event.preventDefault();
                const url = anchorTag.getAttribute('href');
                shell.openExternal(url);
            });
        }

    }, [mdtext, props.docsState])

    function onTextAreaChange(changed) {
        setMDText(changed)

        let oldprops = [...props.docsState.docs];
        oldprops[props.docsState.selected] = {
            title: props.docsState.docs[props.docsState.selected].title,
            file: props.docsState.docs[props.docsState.selected].file,
            content: mdtext,
            saved: false,
            type: "markdown/edit",
        }
        props.setDocs({ selected: props.docsState.selected, docs: [...oldprops] })
    }

    return (
        <div className="markdown-edit">
            <div id="markdown-menubar">

            </div>
            <div id="markdown-textbox"
                style={{
                    width: (props.winsize.width - 46) / 2,
                }}>
                <textarea id="markdown-textarea" value={mdtext} onChange={(e) => { onTextAreaChange(e.target.value) }}

                    style={{
                        width: ((props.winsize.width - 46) / 2) - 22,
                        height: props.winsize.height - 60 - props.titleMenuBarSpace
                    }}
                />
            </div>
            <div id="markdown-preview">
                <div id="markdown-preview-content" style={{ width: (props.winsize.width - 46) / 2, height: (props.winsize.height - 61) }} dangerouslySetInnerHTML={{ __html: converter.makeHtml(mdtext) }}>

                </div>
            </div>
        </div>
    )
}