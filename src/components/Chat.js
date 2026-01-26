import React, { useState, useRef, useEffect } from 'react';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import QuickActions from './QuickActions';
import { sendMessage, formatConversationHistory } from '../utils/api';
import './Chat.css';

const CODE_LINE_REGEX = /^(\s{4,}\S|\s*(?:if|for|while|def|class|match|case|try|except|return|print|log\(|question\s*=|openssl|chmod|throttle_requests|import|from|const|let|var|function|async|await|sudo|npm|pip)\b)/i;

const wrapLooseCodeSnippets = (text) => {
    const lines = text.split('\n');
    const result = [];
    let inGeneratedFence = false;
    let insideExistingFence = false;

    lines.forEach((line, index) => {
        const trimmed = line.trim();

        if (trimmed.startsWith('```')) {
            if (inGeneratedFence) {
                result.push('```');
                inGeneratedFence = false;
            }
            insideExistingFence = !insideExistingFence;
            result.push(line);
            return;
        }

        if (insideExistingFence) {
            result.push(line);
            return;
        }

        const isCodeLine = CODE_LINE_REGEX.test(line);

        if (isCodeLine && !inGeneratedFence) {
            inGeneratedFence = true;
            result.push('```text');
        } else if (!isCodeLine && inGeneratedFence && trimmed !== '') {
            result.push('```');
            inGeneratedFence = false;
        }

        result.push(line);

        if (index === lines.length - 1 && inGeneratedFence) {
            result.push('```');
            inGeneratedFence = false;
        }
    });

    return result.join('\n');
};

const formatAssistantResponse = (response = '') => {
    const normalized = response.replace(/\r\n/g, '\n').trim();
    if (!normalized) return '';

    const withCodeBlocks = wrapLooseCodeSnippets(normalized);
    return withCodeBlocks.replace(/\n{3,}/g, '\n\n');
};

/**
 * Main Chat Component
 * Manages conversation state and handles user interactions
 */
function Chat({ chatId, messages = [], onMessagesChange, onUpdateMetadata }) {
    const [abortController, setAbortController] = useState(null);
    const [pendingAbort, setPendingAbort] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const lastRequestTime = useRef(0);
    const MIN_REQUEST_INTERVAL = 10000; // Minimum 10 seconds between requests to avoid rate limits

    const safeUpdateMessages = (nextMessages) => {
        if (typeof onMessagesChange === 'function') {
            onMessagesChange(nextMessages);
        }
    };

    useEffect(() => {
        setInputValue('');
        setError(null);
        setIsLoading(false);
        lastRequestTime.current = 0;
    }, [chatId]);

    /**
     * Auto-scroll to bottom when new messages arrive
     */
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    /**
     * Handle sending a message
     */
    // Retry logic for failed messages
    const handleRetry = async (retryPayload) => {
        if (!retryPayload || isLoading || pendingAbort) return;
        setIsLoading(true);
        setError(null);
        const controller = new AbortController();
        setAbortController(controller);
        try {
            const { userMessage, userAppended } = retryPayload;
            const conversationHistory = formatConversationHistory(userAppended);
            const response = await sendMessage(conversationHistory, userMessage.text, controller.signal);
            const assistantMessage = {
                id: Date.now() + 1,
                sender: 'assistant',
                text: formatAssistantResponse(response),
                timestamp: new Date()
            };
            safeUpdateMessages([...userAppended, assistantMessage]);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
            setAbortController(null);
            setPendingAbort(false);
            inputRef.current?.focus();
        }
    };

    const handleSend = async () => {
        const trimmedInput = inputValue.trim();

        // Validate input
        if (!trimmedInput) return;
        if (isLoading || pendingAbort) return; // Prevent sending while loading or aborting

        // Check rate limit cooldown
        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTime.current;
        if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
            const waitTime = Math.ceil((MIN_REQUEST_INTERVAL - timeSinceLastRequest) / 1000);
            setError(`Please wait ${waitTime} second${waitTime > 1 ? 's' : ''} before sending another message.`);
            return;
        }
        lastRequestTime.current = now;

        // Create user message
        const userMessage = {
            id: Date.now(),
            sender: 'user',
            text: trimmedInput,
            timestamp: new Date()
        };

        const userAppended = [...messages, userMessage];
        safeUpdateMessages(userAppended);
        setInputValue('');
        setError(null);
        setIsLoading(true);
        const controller = new AbortController();
        setAbortController(controller);

        if (messages.length === 0 && typeof onUpdateMetadata === 'function') {
            const truncated = trimmedInput.length > 48 ? `${trimmedInput.slice(0, 45)}...` : trimmedInput;
            onUpdateMetadata({
                title: truncated,
                subtitle: 'Just now'
            });
        }

        try {
            // Format conversation history for API
            const conversationHistory = formatConversationHistory(userAppended);

            // Call API
            const response = await sendMessage(conversationHistory, trimmedInput, controller.signal);

            // Create assistant message
            const assistantMessage = {
                id: Date.now() + 1,
                sender: 'assistant',
                text: formatAssistantResponse(response),
                timestamp: new Date()
            };

            // Update UI with assistant response
            safeUpdateMessages([...userAppended, assistantMessage]);

        } catch (err) {
            console.error('Error sending message:', err);
            setError(err.message);

            // Show error as a special message with retry payload
            const errorMessage = {
                id: Date.now() + 1,
                sender: 'assistant',
                text: `*The connection to the academy wavers...*\n\n${err.message}`,
                timestamp: new Date(),
                isError: true,
                retryPayload: {
                    userMessage,
                    userAppended
                }
            };

            safeUpdateMessages([...userAppended, errorMessage]);
        } finally {
            setIsLoading(false);
            setAbortController(null);
            setPendingAbort(false);
            inputRef.current?.focus();
        }
    };

    /**
     * Handle Enter key press
     */
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    /**
     * Clear error when user starts typing
     */
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        if (error) setError(null);
        // Auto-grow textarea
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
        }
    };

    /**
     * Handle quick action click
     */
    const handleQuickAction = (prompt) => {
        setInputValue(prompt);
        inputRef.current?.focus();
    };

    // Auto-grow on mount and chat switch
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
        }
    }, [inputValue, chatId]);

    // Stop query handler
    const handleStop = () => {
        if (abortController) {
            setPendingAbort(true);
            abortController.abort();
        }
    };

    return (
        <div className="chat-container">
            {/* Messages Area */}
            <div className="messages-container">
                {messages.length === 0 ? (
                    <div className="welcome-message">
                        <div className="welcome-greeting">
                            <h1 className="greeting-title">Oleg, how can I help you today?</h1>
                        </div>
                        <QuickActions onActionClick={handleQuickAction} />
                    </div>
                ) : (
                    <>
                        {messages.map((message) => (
                            <Message
                                key={message.id}
                                message={message}
                                onRetry={message.isError ? handleRetry : undefined}
                            />
                        ))}
                    </>
                )}

                {/* Typing Indicator */}
                {isLoading && <TypingIndicator />}

                {/* Auto-scroll anchor */}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="input-container">
                <div className="input-wrapper">
                    <textarea
                        ref={inputRef}
                        className="message-input"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything"
                        rows="1"
                        disabled={isLoading}
                    />
                    <button
                        className="send-button"
                        onClick={isLoading ? handleStop : handleSend}
                        disabled={pendingAbort || (!isLoading && !inputValue.trim())}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        {isLoading ? (
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M320-640v320-320Zm-80 400v-480h480v480H240Zm80-80h320v-320H320v320Z" /></svg>
                        ) : (
                            <span className="material-symbols-outlined send-icon">arrow_upward</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Chat;
