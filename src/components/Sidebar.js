import React, { useState } from 'react';
import './Sidebar.css';
import SettingsModal from './SettingsModal';
import dumbledoreLogo from '../assets/dumbledore_logo.png';
/**
 * Sidebar Component
 * Navigation and chat history sidebar
    */

function Sidebar({ onNewChat, onFileUpload, onDeleteChat, onOpenCVE, chatHistory, currentChatId, onSelectChat, isOpen = true, onClose = () => { }, persona: personaProp, onPersonaChange }) {
    const [showSettings, setShowSettings] = useState(false);
    const [showSecretRoom, setShowSecretRoom] = useState(false);
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('openrouter_api_key') || '');
    const [persona, setPersona] = useState(() => localStorage.getItem('persona') || 'dumbledore');
    const fileInputRef = React.useRef(null);

    const handleSaveApiKey = (key, selectedPersona) => {
        setApiKey(key);
        setPersona(selectedPersona);
        localStorage.setItem('openrouter_api_key', key);
        localStorage.setItem('persona', selectedPersona);
        setShowSettings(false);
        // Optionally: window.location.reload();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const allowed = /\.(txt|log|json|csv|md)$/i;
        if (!allowed.test(file.name)) {
            alert('Only text-based files allowed: .txt, .log, .json, .csv, .md');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('File too large (max 5MB).');
            return;
        }
        file.text().then((text) => {
            if (!text || text.trim().length === 0) {
                alert('File appears to be empty or unreadable.');
                return;
            }
            if (onFileUpload) {
                onFileUpload(file, text);
            }
        }).catch(() => {
            alert('Failed to read file. Make sure it is a text-based file.');
        });
        e.target.value = '';
    };

    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            {/* Logo/Brand */}
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <img src={dumbledoreLogo} alt="Dumbledore Logo" className="logo-img sidebar-logo-img" />
                    <span className="logo-text">Dumbledore</span>
                </div>
            </div>

            {/* New Chat Button */}
            <button className="new-chat-button" onClick={onNewChat}>
                <span>Start new chat</span>
                <span className="plus-icon">+</span>
            </button>

            {/* Secret Room Dropdown */}
            <div className="secret-room-container">
                <button
                    className="secret-room-trigger"
                    onClick={() => setShowSecretRoom(!showSecretRoom)}
                >
                    <span>Secret Room</span>
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ transform: showSecretRoom ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                    >
                        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {showSecretRoom && (
                    <div className="secret-room-dropdown">
                        <button
                            className="dropdown-item"
                            onClick={() => {
                                fileInputRef.current?.click();
                                setShowSecretRoom(false);
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 1H3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5l-5-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M9 1v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>Unleash Secrets</span>
                        </button>
                        <button
                            className="dropdown-item"
                            onClick={() => {
                                onOpenCVE();
                                setShowSecretRoom(false);
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
                                <line x1="11" y1="11" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <span>CVE Explorer</span>
                        </button>
                    </div>
                )}
            </div>
            <input
                type="file"
                ref={fileInputRef}
                accept=".txt,.log,.json,.csv,.md"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            {/* Chat History */}
            <div className="chat-history">
                <div className="history-section">
                    <div className="history-label">Today</div>
                    {chatHistory.today.map((chat) => (
                        <div key={chat.id} style={{ position: 'relative' }}>
                            <button
                                className={`history-item ${currentChatId === chat.id ? 'active' : ''}`}
                                onClick={() => onSelectChat(chat.id)}
                            >
                                <div className="history-title">{chat.title}</div>
                                <div className="history-subtitle">{chat.subtitle}</div>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm('Delete this chat?')) {
                                        onDeleteChat?.(chat.id);
                                    }
                                }}
                                style={{
                                    position: 'absolute',
                                    right: '8px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#9ca3af',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    opacity: 0.6,
                                    fontSize: '18px'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                                title="Delete chat"
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2 4h12M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1M13 4v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4h10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>

                {chatHistory.yesterday.length > 0 && (
                    <div className="history-section">
                        <div className="history-label">Yesterday</div>
                        {chatHistory.yesterday.map((chat) => (
                            <div key={chat.id} style={{ position: 'relative' }}>
                                <button
                                    className={`history-item ${currentChatId === chat.id ? 'active' : ''}`}
                                    onClick={() => onSelectChat(chat.id)}
                                >
                                    <div className="history-title">{chat.title}</div>
                                    <div className="history-subtitle">{chat.subtitle}</div>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm('Delete this chat?')) {
                                            onDeleteChat?.(chat.id);
                                        }
                                    }}
                                    style={{
                                        position: 'absolute',
                                        right: '8px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#9ca3af',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        opacity: 0.6,
                                        fontSize: '18px'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                                    title="Delete chat"
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M2 4h12M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1M13 4v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4h10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Settings Button at Bottom */}
            <div className="sidebar-footer">
                <button className="settings-btn" onClick={() => setShowSettings(true)}>
                    <span className="material-symbols-outlined">settings</span> Settings
                </button>
            </div>
            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                onSave={handleSaveApiKey}
                initialApiKey={apiKey}
                initialPersona={persona}
            />
        </div>
    );
}

export default Sidebar;
