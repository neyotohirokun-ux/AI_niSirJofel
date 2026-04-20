// Express server for chatbot backend with Google AI Studio (Gemini) Integration

require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = 3000;

// Get API key from environment variable
// Get free at: https://aistudio.google.com/app/apikey
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
let genAI = null;
let model = null;

if (GOOGLE_API_KEY) {
    genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    console.log('✅ Google AI Studio API initialized');
} else {
    console.log('⚠️  No Google API key found. Using fallback responses.');
}

// Store conversation history per user session
const conversationHistory = new Map();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Fallback responses for when API is unavailable
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

// Call Google AI Studio (Gemini) API with conversation history and system prompt
async function getAIResponse(userMessage, sessionId) {
    if (!model) {
        console.log('⚠️  Model not initialized');
        return null; // Use fallback
    }

    try {
        // System instruction to prevent hallucination
        const systemInstruction = `You are niSirJofel AI, a helpful and truthful chatbot assistant. 
IMPORTANT RULES:
1. ALWAYS stay on topic based on the conversation history
2. ONLY reference things the user explicitly mentioned in this conversation
3. If asked about something NOT in our conversation history, say "I don't have that information from our conversation"
4. Be concise and helpful
5. If the user asks what they said earlier, refer to the conversation history
6. Never make up information or assume things not mentioned
7. Ask clarifying questions if needed

Current conversation context:`;

        // Get or create conversation for this session
        if (!conversationHistory.has(sessionId)) {
            const chat = model.startChat({
                history: [
                    {
                        role: 'user',
                        parts: [{ text: systemInstruction }]
                    },
                    {
                        role: 'model',
                        parts: [{ text: 'I understand. I will stay on topic, not hallucinate, and only reference what has been discussed in our conversation. I will be helpful and truthful.' }]
                    }
                ],
                generationConfig: {
                    maxOutputTokens: 256,
                    temperature: 0.3,  // Lower temperature for more focused responses
                    topP: 0.9,
                    topK: 40
                }
            });
            conversationHistory.set(sessionId, chat);
            console.log(`📝 New chat session created: ${sessionId}`);
        }

        const chat = conversationHistory.get(sessionId);
        console.log(`💬 User (${sessionId}): ${userMessage}`);
        
        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        const text = response.text();
        
        console.log(`🤖 AI Response: ${text}`);
        return text || "I'm thinking about that...";
    } catch (error) {
        console.error('❌ Google AI error:', error.message);
        return null; // Use fallback on error
    }
}

// Generate bot response (fallback)
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

// API endpoint for chat with conversation memory
app.post('/api/chat', async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Invalid message format' });
        }
        
        // Use provided sessionId or generate a new one
        const userId = sessionId || 'default';
        
        // Try to get AI response first (with conversation history)
        let reply = await getAIResponse(message, userId);
        
        // Fallback to simple responses if AI is unavailable
        if (!reply) {
            reply = generateBotResponse(message);
        }
        
        // Send response with sessionId to maintain conversation
        res.json({ reply: reply, sessionId: userId });
        
    } catch (error) {
        console.error('Error processing chat:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Clear conversation history endpoint
app.post('/api/clear', (req, res) => {
    const { sessionId } = req.body;
    const userId = sessionId || 'default';
    conversationHistory.delete(userId);
    console.log(`🗑️  Conversation cleared: ${userId}`);
    res.json({ status: 'Conversation cleared' });
});

// API key verification endpoint
app.get('/api/verify', (req, res) => {
    const hasKey = !!GOOGLE_API_KEY;
    const isInitialized = !!model;
    res.json({ 
        status: 'verified',
        hasApiKey: hasKey,
        modelInitialized: isInitialized,
        apiKeyPreview: hasKey ? GOOGLE_API_KEY.substring(0, 10) + '...' : 'none'
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'Bot is running!', 
        hasMemory: true,
        apiInitialized: !!model,
        activeSessions: conversationHistory.size
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🤖 niSirJofel AI Chatbot Backend running on http://localhost:${PORT}`);
    console.log(`Frontend: Open index.html in your browser`);
    console.log(`API endpoint: POST http://localhost:${PORT}/api/chat`);
});
