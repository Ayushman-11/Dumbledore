import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import dumbledoreAvatar from '../assets/dumbledore_pfp.png';
import './Message.css';

/**
 * Message Component
 * Displays individual chat messages with appropriate styling
 * @param {Object} message - Message object containing sender, text, timestamp
 */
function Message({ message }) {
    const { sender, text, isError } = message;
    const isUser = sender === 'user';
    const MarkdownContent = () => (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                a: ({ children, ...props }) => (
                    <a
                        target="_blank"
                        rel="noopener noreferrer"
                        {...props}
                    >
                        {children && children.length > 0 ? children : props.href || 'link'}
                    </a>
                )
            }}
        >
            {text || ''}
        </ReactMarkdown>
    );

    return (
        <div className={`message-wrapper ${isUser ? 'user-message' : 'assistant-message'}`}>
            <div className={`message-bubble ${isError ? 'error-message' : ''}`}>
                <div className="message-content">
                    <div className="message-text">
                        {!isUser && !isError ? (
                            <div className="assistant-inline-layout">
                                <img
                                    className="assistant-inline-avatar"
                                    src={dumbledoreAvatar}
                                    alt="Dumbledore"
                                />
                                <div className="assistant-inline-content">
                                    <MarkdownContent />
                                </div>
                            </div>
                        ) : (
                            <MarkdownContent />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Message;
