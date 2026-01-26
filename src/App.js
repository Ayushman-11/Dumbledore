import React, { useState, useMemo, useEffect } from 'react';
import { sendMessage, formatConversationHistory } from './utils/api';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import './App.css';
import './components/FloatingInputBar.css';

const generateChatId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createChatSession = (overrides = {}) => {
    const timestamp = new Date().toISOString();
    return {
        id: generateChatId(),
        title: 'New chat',
        subtitle: 'No messages yet',
        createdAt: timestamp,
        updatedAt: timestamp,
        messages: [],
        ...overrides
    };
};

const partitionHistory = (sessions) => {
    const today = [];
    const yesterday = [];
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const ordered = [...sessions].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    ordered.forEach((chat) => {
        const created = new Date(chat.createdAt);
        if (created >= startOfToday) {
            today.push(chat);
        } else if (created >= startOfYesterday) {
            yesterday.push(chat);
        } else if (yesterday.length < 6) {
            yesterday.push(chat);
        }
    });

    return { today, yesterday };
};

const getIsMobileViewport = () => {
    if (typeof window === 'undefined') {
        return false;
    }
    return window.innerWidth <= 900;
};

const getSidebarDefaultState = () => (
    typeof window === 'undefined' ? true : window.innerWidth > 900
);

/**
 * Main App Component
 * Renders the magical academy chat interface with sidebar
 */

const STORAGE_KEY = 'dumbledore_chats';

function loadChatsFromSession() {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch (e) { }
    return [createChatSession({
        title: 'Welcome to Hogwarts',
        subtitle: 'Dumbledore 3.2'
    })];
}

function App() {
    const [chats, setChats] = useState(() => loadChatsFromSession());
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentChatId, setCurrentChatId] = useState(() => {
        const loaded = loadChatsFromSession();
        return loaded[0]?.id;
    });
    // Persist chats to sessionStorage on every update
    useEffect(() => {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
        } catch (e) { }
    }, [chats]);
    const [isSidebarOpen, setSidebarOpen] = useState(getSidebarDefaultState);
    const [isMobileView, setIsMobileView] = useState(getIsMobileViewport);

    useEffect(() => {
        const handleResize = () => {
            if (typeof window === 'undefined') {
                return;
            }
            const mobile = window.innerWidth <= 900;
            setIsMobileView(mobile);
            if (!mobile) {
                setSidebarOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const currentChat = useMemo(
        () => chats.find(chat => chat.id === currentChatId) || chats[0],
        [chats, currentChatId]
    );

    const chatHistory = useMemo(() => partitionHistory(chats), [chats]);

    const closeSidebarOnMobile = () => {
        if (isMobileView) {
            setSidebarOpen(false);
        }
    };

    const handleToggleSidebar = () => {
        setSidebarOpen(prev => !prev);
    };

    const handleNewChat = () => {
        const emptyChat = chats.find(chat => !chat.messages || chat.messages.length === 0);
        if (emptyChat) {
            setCurrentChatId(emptyChat.id);
            closeSidebarOnMobile();
            return;
        }

        const newChat = createChatSession();
        setChats(prev => [newChat, ...prev]);
        setCurrentChatId(newChat.id);
        closeSidebarOnMobile();
    };

    const handleSelectChat = (chatId) => {
        setCurrentChatId(chatId);
        closeSidebarOnMobile();
    };

    const handleMessagesChange = (chatId, nextMessages) => {
        setChats(prev => prev.map(chat =>
            chat.id === chatId
                ? { ...chat, messages: nextMessages, updatedAt: new Date().toISOString() }
                : chat
        ));
    };


    // Send a message and update chat state
    const handleSendMessage = async (userInput) => {
        if (!currentChat) return;
        const trimmedInput = userInput.trim();
        if (!trimmedInput) return;
        setIsLoading(true);
        const userMessage = {
            id: Date.now(),
            sender: 'user',
            text: trimmedInput,
            timestamp: new Date()
        };
        // Add user message
        let updatedMessages = [...(currentChat.messages || []), userMessage];
        setChats(prev => prev.map(chat =>
            chat.id === currentChat.id
                ? { ...chat, messages: updatedMessages, updatedAt: new Date().toISOString() }
                : chat
        ));
        try {
            const conversationHistory = formatConversationHistory(updatedMessages);
            const response = await sendMessage(conversationHistory, trimmedInput);
            const assistantMessage = {
                id: Date.now() + 1,
                sender: 'assistant',
                text: response,
                timestamp: new Date()
            };
            updatedMessages = [...updatedMessages, assistantMessage];
            setChats(prev => prev.map(chat =>
                chat.id === currentChat.id
                    ? { ...chat, messages: updatedMessages, updatedAt: new Date().toISOString() }
                    : chat
            ));
        } catch (err) {
            const errorMessage = {
                id: Date.now() + 1,
                sender: 'assistant',
                text: `*The connection to the academy wavers...*\n\n${err.message}`,
                timestamp: new Date(),
                isError: true
            };
            updatedMessages = [...updatedMessages, errorMessage];
            setChats(prev => prev.map(chat =>
                chat.id === currentChat.id
                    ? { ...chat, messages: updatedMessages, updatedAt: new Date().toISOString() }
                    : chat
            ));
        } finally {
            setIsLoading(false);
        }
    };

    // Update chat metadata (title/subtitle)
    const handleMetadataUpdate = (chatId, updates) => {
        setChats(prev => prev.map(chat =>
            chat.id === chatId
                ? { ...chat, ...updates, updatedAt: new Date().toISOString() }
                : chat
        ));
    };

    return (
        <div className="app-container">
            <Sidebar
                onNewChat={handleNewChat}
                chatHistory={chatHistory}
                currentChatId={currentChat?.id}
                onSelectChat={handleSelectChat}
                isOpen={isSidebarOpen}
                onClose={closeSidebarOnMobile}
            />
            <Chat
                chat={currentChat}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                onUpdateMetadata={handleMetadataUpdate}
            />
            {isMobileView && isSidebarOpen && (
                <div className="sidebar-overlay visible" onClick={closeSidebarOnMobile} />
            )}

            {/* Floating input bar */}
            <form className="floating-input-bar" onSubmit={e => {
                e.preventDefault();
                if (inputValue.trim() && !isLoading) {
                    handleSendMessage(inputValue);
                    setInputValue("");
                }
            }}>
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !inputValue.trim()}>Send</button>
            </form>
        </div>
    );
}

export default App;
