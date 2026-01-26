import React from 'react';
import './Sidebar.css';

/**
 * Sidebar Component
 * Navigation and chat history sidebar
 */
function Sidebar({ onNewChat, chatHistory, currentChatId, onSelectChat, isOpen = true, onClose = () => { } }) {
    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            {/* Logo/Brand */}
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <span className="material-symbols-outlined logo-icon">school</span>
                    <span className="logo-text">Dumbledore</span>
                </div>
                {/* Close button removed */}
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
        </div>
    );
}

export default Sidebar;
