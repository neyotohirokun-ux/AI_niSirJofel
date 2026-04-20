// Express server for chatbot backend

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Simple chatbot response logic
const botResponses = {
    greeting: [
        "Hello! Nice to meet you!",
        "Hi there! How can I assist you today?",
        "Hey! What can I do for you?",
        "Greetings! I'm here to help!"
    ],
    help: [
        "I can help you with questions and have conversations. Just type something and I'll respond!",
        "I'm here to chat and assist with questions. Ask me anything!",
        "Feel free to ask me questions or just have a chat!"
    ],
    default: [
        "That's interesting! Tell me more.",
        "I understand. What else would you like to know?",
        "Got it! Anything else I can help with?",
        "Thanks for sharing! Is there anything else?",
        "Interesting! What do you think about that?",
        "I see what you mean. Would you like to know more?"
    ]
};

// Generate bot response
function generateBotResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Greeting patterns
    if (message.match(/hello|hi|hey|greetings|good morning|good afternoon|good evening/i)) {
        return botResponses.greeting[Math.floor(Math.random() * botResponses.greeting.length)];
    }
    
    // Help patterns
    if (message.match(/help|what can you do|who are you|what are you|capabilities|features/i)) {
        return botResponses.help[Math.floor(Math.random() * botResponses.help.length)];
    }
    
    // Name
    if (message.match(/what's your name|your name|who are you|what is your name/i)) {
        return "I'm niSirJofel AI, your friendly chatbot assistant!";
    }
    
    // Time/Date
    if (message.match(/time|date|what time|what date/i)) {
        const now = new Date();
        return `It's currently ${now.toLocaleString()}`;
    }
    
    // Math
    if (message.match(/calculate|math|what is.*\+.*|what is.*\-.*|what is.*\*.*|what is.*\//)) {
        try {
            // Simple math evaluation (be careful with this in production!)
            const result = eval(message.replace(/[^\d+\-*/().]/g, ''));
            return `The result is: ${result}`;
        } catch (e) {
            return "I couldn't calculate that. Could you rephrase your question?";
        }
    }
    
    // Default response
    return botResponses.default[Math.floor(Math.random() * botResponses.default.length)];
}

// API endpoint for chat
app.post('/api/chat', (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Invalid message format' });
        }
        
        // Generate bot response
        const reply = generateBotResponse(message);
        
        // Send response
        res.json({ reply: reply });
        
    } catch (error) {
        console.error('Error processing chat:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'Bot is running!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🤖 niSirJofel AI Chatbot Backend running on http://localhost:${PORT}`);
    console.log(`Frontend: Open index.html in your browser`);
    console.log(`API endpoint: POST http://localhost:${PORT}/api/chat`);
});
