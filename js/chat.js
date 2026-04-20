// Chat application JavaScript

const API_URL = 'http://localhost:3000/api/chat';

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');

// Generate or retrieve session ID for conversation continuity
let sessionId = localStorage.getItem('chatSessionId');
if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('chatSessionId', sessionId);
}

console.log('🔑 Session ID:', sessionId);

// Event listeners
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
clearBtn.addEventListener('click', clearHistory);

// Send message function
async function sendMessage() {
    const message = userInput.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addMessage(message, 'user');
    userInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Send to backend API with session ID for conversation continuity
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                message: message,
                sessionId: sessionId
            })
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add bot response
        addMessage(data.reply, 'bot');
        
    } catch (error) {
        console.error('Error:', error);
        removeTypingIndicator();
        addMessage('Sorry, I encountered an error. Please try again.', 'bot');
    }
    
    // Scroll to bottom
    scrollToBottom();
}

// Add message to chat display
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = text;
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    scrollToBottom();
}

// Show typing indicator
function showTypingIndicator() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.id = 'typingIndicator';
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'typing-dot';
        typingDiv.appendChild(dot);
    }
    
    messageDiv.appendChild(typingDiv);
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Remove typing indicator
function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// Scroll chat to bottom
function scrollToBottom() {
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 0);
}

// Clear conversation history
async function clearHistory() {
    if (confirm('Are you sure you want to clear the conversation history? This will start a fresh conversation.')) {
        try {
            // Clear conversation on backend
            await fetch(API_URL.replace('/chat', '/clear'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sessionId: sessionId })
            });
            
            // Generate new session ID for fresh conversation
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('chatSessionId', sessionId);
            
            // Clear chat UI
            chatMessages.innerHTML = '<div class="message bot-message"><div class="message-content">Hey! I\'m niSirJofel AI. How can I help you today?</div></div>';
            
            console.log('🔄 Conversation cleared. New Session ID:', sessionId);
        } catch (error) {
            console.error('Error clearing history:', error);
        }
    }
}

// Initialize
console.log('Chat application loaded. Backend running on port 3000');
