import { useEffect } from 'react';
import './settings.css';

export default function SettingsPage(props) {
    return (
        <div className="settingspage-cont" style={{
            width: props.winsize.width,
            height: props.winsize.height - 56
        }}>
            
        </div>
    )
}