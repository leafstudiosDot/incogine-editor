import { useEffect } from 'react'
import './videoeditor.css'

export default function VideoEditor(props) {

    useEffect(() => {
        /*async function loadWasmModule() {
            const wasm = import('./videoedit/pkg/incoedit_videoedit');
            await wasm.default();

            const wasmContainer = document.createElement('div');
            wasmContainer.style.border = '1px solid black';
            wasmContainer.style.padding = '10px';
            wasmContainer.textContent = 'Loading Incogine Editor - Video Editor...';

            const wasmModule = document.querySelector('.videoEditor-container');
            wasmModule.appendChild(wasmContainer);
        }
        loadWasmModule();*/
    }, []);

    return (
        <div className="videoEditor-container" style={{ width: props.winsize.width, height: props.winsize.height - 26 }}>
        </div>
    )
}