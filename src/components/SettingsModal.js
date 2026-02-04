import React, { useState } from 'react';
import './SettingsModal.css';

const PERSONAS = [
    { value: 'dumbledore', label: 'Professor Dumbledore' },
    { value: 'snape', label: 'Professor Snape' }
];

function SettingsModal({ isOpen, onClose, onSave, initialApiKey, initialPersona = 'dumbledore' }) {
    const [apiKey, setApiKey] = useState(initialApiKey || '');
    const [persona, setPersona] = useState(initialPersona);

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
                <label htmlFor="persona-select" style={{ marginTop: '0.5rem' }}>Persona</label>
                <select
                    id="persona-select"
                    value={persona}
                    onChange={e => setPersona(e.target.value)}
                    style={{ marginBottom: '1rem', padding: '0.5rem', borderRadius: 6 }}
                >
                    {PERSONAS.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                </select>
                <div className="settings-modal-actions">
                    <button onClick={onClose}>Cancel</button>
                    <button onClick={() => onSave(apiKey, persona)} disabled={!apiKey.trim()}>Save</button>
                </div>
            </div>
        </div>
    );
}

export default SettingsModal;
