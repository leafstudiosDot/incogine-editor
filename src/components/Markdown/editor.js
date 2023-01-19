import { ipcRenderer } from 'electron';
import { useState, useEffect, useCallback } from 'react';
import './editor.css';

export default function MarkdownEdit(props) {
    return (
        <div className="markdown-edit">
            <div id="markdown-menubar">
                
            </div>
            <div id="markdown-textbox">

            </div>
            <div id="markdown-preview">

            </div>
        </div>
    )
}