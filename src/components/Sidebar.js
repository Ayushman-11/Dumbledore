import React, { useState } from 'react';
import './Sidebar.css';
import SettingsModal from './SettingsModal';
import dumbledoreLogo from '../assets/dumbledore_logo.png';
/**
 * Sidebar Component
 * Navigation and chat history sidebar
    */
function Sidebar({ onNewChat, chatHistory, currentChatId, onSelectChat, isOpen = true, onClose = () => { } }) {
    const [showSettings, setShowSettings] = useState(false);
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('openrouter_api_key') || '');

    const handleSaveApiKey = (key) => {
        setApiKey(key);
        localStorage.setItem('openrouter_api_key', key);
        setShowSettings(false);
        // Optionally: window.location.reload();
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

            {/* Chat History */}
            <div className="chat-history">
                <div className="history-section">
                    <div className="history-label">Today</div>
                    {chatHistory.today.map((chat) => (
                        <button
                            key={chat.id}
                            className={`history-item ${currentChatId === chat.id ? 'active' : ''}`}
                            onClick={() => onSelectChat(chat.id)}
                        >
                            <div className="history-title">{chat.title}</div>
                            <div className="history-subtitle">{chat.subtitle}</div>
                        </button>
                    ))}
                </div>

                {chatHistory.yesterday.length > 0 && (
                    <div className="history-section">
                        <div className="history-label">Yesterday</div>
                        {chatHistory.yesterday.map((chat) => (
                            <button
                                key={chat.id}
                                className={`history-item ${currentChatId === chat.id ? 'active' : ''}`}
                                onClick={() => onSelectChat(chat.id)}
                            >
                                <div className="history-title">{chat.title}</div>
                                <div className="history-subtitle">{chat.subtitle}</div>
                            </button>
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
            />
        </div>
    );
}

export default Sidebar;
