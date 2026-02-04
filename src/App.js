import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import CVEExplorer from './components/CVEExplorer';
import './App.css';
import dumbledoreLogo from './assets/dumbledore_logo.png';

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

    // Fix: Define handleToggleSidebar to toggle sidebar open state
    const handleToggleSidebar = () => {
        setSidebarOpen(prev => !prev);
    };
    const [chats, setChats] = useState(() => loadChatsFromSession());
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
    const [showCVEExplorer, setShowCVEExplorer] = useState(false);
    const [persona, setPersona] = useState(() => localStorage.getItem('persona') || 'dumbledore');

    // Apply theme based on persona
    useEffect(() => {
        const root = document.documentElement;
        if (persona === 'snape') {
            root.style.setProperty('--bg-primary', '#000000');
            root.style.setProperty('--bg-secondary', '#0a0a0a');
            root.style.setProperty('--text-primary', '#00ff41');
            root.style.setProperty('--text-secondary', '#00cc33');
            root.style.setProperty('--accent-color', '#00ff41');
        } else {
            root.style.setProperty('--bg-primary', '');
            root.style.setProperty('--bg-secondary', '');
            root.style.setProperty('--text-primary', '');
            root.style.setProperty('--text-secondary', '');
            root.style.setProperty('--accent-color', '');
        }
    }, [persona]);

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

    const handleFileUpload = (file, content) => {
        const newChat = createChatSession({
            title: `📄 ${file.name}`,
            subtitle: `${(file.size / 1024).toFixed(1)} KB`,
            fileContext: {
                name: file.name,
                size: file.size,
                content: content.slice(0, 12000)
            }
        });
        setChats(prev => [newChat, ...prev]);
        setCurrentChatId(newChat.id);
        closeSidebarOnMobile();
    };

    const handleSelectChat = (chatId) => {
        setCurrentChatId(chatId);
        closeSidebarOnMobile();
    };

    const handleDeleteChat = (chatId) => {
        setChats(prev => {
            const filtered = prev.filter(chat => chat.id !== chatId);
            // If we deleted the current chat, switch to another one
            if (currentChatId === chatId) {
                const nextChat = filtered[0] || createChatSession();
                if (filtered.length === 0) {
                    setCurrentChatId(nextChat.id);
                    return [nextChat];
                }
                setCurrentChatId(nextChat.id);
            }
            return filtered;
        });
    };

    const handleCVEAnalysis = (prompt, cveId) => {
        const newChat = createChatSession({
            title: `CVE: ${cveId}`,
            subtitle: 'CVE Analysis'
        });
        setChats(prev => [newChat, ...prev]);
        setCurrentChatId(newChat.id);

        // Add the prompt as initial message
        setTimeout(() => {
            handleMessagesChange(newChat.id, [{
                id: Date.now(),
                sender: 'user',
                text: prompt,
                timestamp: new Date()
            }]);
        }, 100);
    };




    const handleMetadataUpdate = (chatId, updates) => {
        setChats(prev => prev.map(chat => (
            chat.id === chatId ? { ...chat, ...updates } : chat
        )));
    };

    // Fix: Define handleMessagesChange to update messages for a chat
    const handleMessagesChange = (chatId, updatedMessages) => {
        setChats(prev => prev.map(chat => (
            chat.id === chatId ? { ...chat, messages: updatedMessages, updatedAt: new Date().toISOString() } : chat
        )));
    };

    return (
        <div className="App">
            {/* mobile-menu-toggle removed, replaced by appbar menu */}
            {/* AppBar for mobile */}
            {isMobileView && (
                <header className="appbar">
                    <button
                        type="button"
                        className="appbar-menu"
                        onClick={handleToggleSidebar}
                        aria-label="Open sidebar"
                        aria-pressed={isSidebarOpen}
                        style={{ visibility: isSidebarOpen ? 'hidden' : 'visible' }}
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    <div className="appbar-title">
                        <img src={dumbledoreLogo} alt="Dumbledore Logo" className="logo-img appbar-logo" />
                        Dumbledore
                    </div>
                    {/* <div className="appbar-profile">
                        <span className="appbar-pro">PRO</span>
                        <img className="appbar-avatar" src="/avatar.png" alt="User avatar" />
                    </div> */}
                </header>
            )}
            <Sidebar
                onNewChat={handleNewChat}
                onFileUpload={handleFileUpload}
                onDeleteChat={handleDeleteChat}
                onOpenCVE={() => setShowCVEExplorer(true)}
                chatHistory={chatHistory}
                currentChatId={currentChat?.id}
                onSelectChat={handleSelectChat}
                isOpen={isSidebarOpen}
                onClose={closeSidebarOnMobile}
                persona={persona}
                onPersonaChange={setPersona}
            />
            <Chat
                chatId={currentChat?.id}
                messages={currentChat?.messages || []}
                fileContext={currentChat?.fileContext}
                onMessagesChange={(updatedMessages) => {
                    if (currentChat) {
                        handleMessagesChange(currentChat.id, updatedMessages);
                    }
                }}
                onUpdateMetadata={(updates) => {
                    if (currentChat) {
                        handleMetadataUpdate(currentChat.id, updates);
                    }
                }}
            />
            {isMobileView && isSidebarOpen && (
                <div className="sidebar-overlay visible" onClick={closeSidebarOnMobile} />
            )}
            {showCVEExplorer && (
                <CVEExplorer
                    onAnalyzeWithAI={handleCVEAnalysis}
                    onClose={() => setShowCVEExplorer(false)}
                />
            )}
        </div>
    );
}

export default App;
