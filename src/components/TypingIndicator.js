import React from 'react';
import dumbledoreThinking from '../assets/dumbledore_thinking.png';
import './TypingIndicator.css';

/**
 * TypingIndicator Component
 * Displays an animated indicator while the AI is generating a response
 */
function TypingIndicator() {
    return (
        <div className="typing-indicator-wrapper">
            <div className="typing-bubble">
                <div className="typing-avatar">
                    <img src={dumbledoreThinking} alt="Dumbledore thinking" />
                </div>
                <div className="typing-content">
                    <div className="typing-text">The Headmaster is considering</div>
                    <div className="typing-dots">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TypingIndicator;
