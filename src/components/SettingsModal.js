import React, { useState } from 'react';
import './SettingsModal.css';

function SettingsModal({ isOpen, onClose, onSave, initialApiKey }) {
    const [apiKey, setApiKey] = useState(initialApiKey || '');

    if (!isOpen) return null;

    return (
        <div className="settings-modal-backdrop">
            <div className="settings-modal">
                <h2>Settings</h2>
                <label htmlFor="openrouter-api-key">OpenRouter API Key</label>
                <input
                    id="openrouter-api-key"
                    type="text"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    autoFocus
                />
                <div className="settings-modal-actions">
                    <button onClick={onClose}>Cancel</button>
                    <button onClick={() => onSave(apiKey)} disabled={!apiKey.trim()}>Save</button>
                </div>
            </div>
        </div>
    );
}

export default SettingsModal;
