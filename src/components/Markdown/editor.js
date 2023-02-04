import { ipcRenderer } from 'electron';
import { useState, useEffect, useCallback } from 'react';
import showdown from 'showdown';
import './editor.css';

export default function MarkdownEdit(props) {
    var converter = new showdown.Converter()
    return (
        <div className="markdown-edit">
            <div id="markdown-menubar">
                
            </div>
            <div id="markdown-textbox">
                <textarea id="markdown-textarea" onChange={(e) => {}}
                
                style={{
                    width: props.winsize.width - 46,
                    height: props.winsize.height - 60 - props.titleMenuBarSpace
                  }}
                  />
            </div>
            <div id="markdown-preview">

            </div>
        </div>
    )
}