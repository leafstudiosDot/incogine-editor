import { ipcRenderer } from 'electron';
import { useState, useEffect, useCallback } from 'react';
import showdown from 'showdown';
import './editor.css';

export default function MarkdownEdit(props) {
    var converter = new showdown.Converter()
    const [mdtext, setMDText] = useState("");
    return (
        <div className="markdown-edit">
            <div id="markdown-menubar">
                
            </div>
            <div id="markdown-textbox"
                style={{
                    width: (props.winsize.width - 46)/2,
                }}>
                <textarea id="markdown-textarea" onChange={(e) => {setMDText(e.target.value)}}
                
                style={{
                    width: ((props.winsize.width - 46)/2)-22,
                    height: props.winsize.height - 60 - props.titleMenuBarSpace
                  }}
                  />
            </div>
            <div id="markdown-preview">
                <div id="markdown-preview-content" style={{width: (props.winsize.width - 46)/2}} dangerouslySetInnerHTML={{__html: converter.makeHtml(mdtext)}}>

                </div>
            </div>
        </div>
    )
}