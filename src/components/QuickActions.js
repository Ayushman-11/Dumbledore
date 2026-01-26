import React from 'react';
import './QuickActions.css';

/**
 * Quick Actions Component
 * Displays quick action buttons for common tasks
 */
function QuickActions({ onActionClick }) {
    const actions = [
        {
            id: 'spell-creation',
            icon: 'auto_fix_high',
            text: 'Create a spell',
            prompt: 'Help me create a new magical spell or incantation'
        },
        {
            id: 'research',
            icon: 'menu_book',
            text: 'Research magic',
            prompt: 'I need help researching magical theory and history'
        },
        {
            id: 'potion',
            icon: 'science',
            text: 'Brew a potion',
            prompt: 'Guide me through brewing a magical potion'
        },
        {
            id: 'defense',
            icon: 'shield',
            text: 'Defense training',
            prompt: 'Teach me defensive magic and protection spells'
        }
    ];

    return (
        <div className="quick-actions">
            {actions.map((action) => (
                <button
                    key={action.id}
                    className="quick-action-button"
                    onClick={() => onActionClick(action.prompt)}
                >
                    <span className="material-symbols-outlined action-icon">{action.icon}</span>
                    <span className="action-text">{action.text}</span>
                </button>
            ))}
        </div>
    );
}

export default QuickActions;
