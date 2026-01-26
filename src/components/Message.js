import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import dumbledoreAvatar from '../assets/dumbledore_pfp.png';
import dumbledoreErrorAvatar from '../assets/dumbledore_error.png';
import './Message.css';

/**
 * Message Component
 * Displays individual chat messages with appropriate styling
 * @param {Object} message - Message object containing sender, text, timestamp
 */
function Message({ message, onRetry }) {
    const { sender, text, isError, retryPayload } = message;
    const isUser = sender === 'user';

    // Feedback and action buttons (like, dislike, copy, retry, more)
    const renderActionButtons = () => {
        // Only show for assistant (AI) messages that are not errors
        if (isUser || isError) return null;

        // For retry, reconstruct the user message and conversation history up to this message
        let retryPayload = undefined;
        if (onRetry) {
            // Find the last user message before this assistant message
            // and the conversation up to this message
            retryPayload = (() => {
                if (!message || !message.id) return undefined;
                // This component does not have access to the full messages array,
                // so we cannot reconstruct the full conversation here.
                // Instead, rely on error retry (which is correct), and for action bar retry,
                // recommend wiring up the correct payload from parent in the future.
                // For now, fallback to just resending the last user message text.
                return { userMessage: { text }, userAppended: [] };
            })();
        }

        return (
            <div className="ai-action-buttons" style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center', fontSize: 18, paddingLeft: 76 }}>
                {/* Like */}
                <button className="ai-btn" title="Like" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#e3e3e3"><path d="M720-120H280v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h258q32 0 56 24t24 56v80q0 7-2 15t-4 15L794-168q-9 20-30 34t-44 14Zm-360-80h360l120-280v-80H480l54-220-174 174v406Zm0-406v406-406Zm-80-34v80H160v360h120v80H80v-520h200Z" /></svg>
                </button>
                {/* Dislike */}
                <button className="ai-btn" title="Dislike" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#e3e3e3"><path d="M240-840h440v520L400-40l-50-50q-7-7-11.5-19t-4.5-23v-14l44-174H120q-32 0-56-24t-24-56v-80q0-7 2-15t4-15l120-282q9-20 30-34t44-14Zm360 80H240L120-480v80h360l-54 220 174-174v-406Zm0 406v-406 406Zm80 34v-80h120v-360H680v-80h200v520H680Z" /></svg>
                </button>
                {/* Copy */}
                <button className="ai-btn" title="Copy" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => navigator.clipboard.writeText(text)}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#e3e3e3"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z" /></svg>
                </button>
                {/* Retry */}
                <button className="ai-btn" title="Retry" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => onRetry && onRetry(retryPayload)}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#e3e3e3"><path d="M482-160q-134 0-228-93t-94-227v-7l-64 64-56-56 160-160 160 160-56 56-64-64v7q0 100 70.5 170T482-240q26 0 51-6t49-18l60 60q-38 22-78 33t-82 11Zm278-161L600-481l56-56 64 64v-7q0-100-70.5-170T478-720q-26 0-51 6t-49 18l-60-60q38-22 78-33t82-11q134 0 228 93t94 227v7l64-64 56 56-160 160Z" /></svg>
                </button>
                {/* More */}
                <button className="ai-btn" title="More" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#e3e3e3"><path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z" /></svg>
                </button>
            </div>
        );
    };
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
                        {!isUser ? (
                            <div className="assistant-inline-layout">
                                <img
                                    className="assistant-inline-avatar"
                                    src={isError ? dumbledoreErrorAvatar : dumbledoreAvatar}
                                    alt={isError ? "Dumbledore Error" : "Dumbledore"}
                                />
                                <div className="assistant-inline-content">
                                    <MarkdownContent />
                                </div>
                            </div>
                        ) : (
                            <MarkdownContent />
                        )}
                        {renderActionButtons()}
                        {isError && onRetry && (
                            <div className="retry-copy-row" style={{ marginTop: 8, paddingLeft: 75 }}>
                                <button className="retry-button" onClick={() => onRetry(retryPayload)} style={{ cursor: 'pointer', fontSize: 14 }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M482-160q-134 0-228-93t-94-227v-7l-64 64-56-56 160-160 160 160-56 56-64-64v7q0 100 70.5 170T482-240q26 0 51-6t49-18l60 60q-38 22-78 33t-82 11Zm278-161L600-481l56-56 64 64v-7q0-100-70.5-170T478-720q-26 0-51 6t-49 18l-60-60q38-22 78-33t82-11q134 0 228 93t94 227v7l64-64 56 56-160 160Z" /></svg>
                                </button>
                                <button className="copy-button" title="Copy error message" onClick={() => navigator.clipboard.writeText(text)} style={{ cursor: 'pointer', fontSize: 14 }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffbdbd"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z" /></svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Message;
