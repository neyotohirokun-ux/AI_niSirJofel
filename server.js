// Express server for chatbot backend with Google AI Studio (Gemini) Integration

require('dotenv').config({ path: __dirname + '/.env' }); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = 3000;

// Get API key from environment variable
// Get free at: https://aistudio.google.com/app/apikey
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
console.log(`\n🔑 API Key Status:`);
console.log(`   Loaded: ${!!GOOGLE_API_KEY}`);
console.log(`   Preview: ${GOOGLE_API_KEY ? GOOGLE_API_KEY.substring(0, 15) + '...' : 'NOT FOUND'}\n`);

let genAI = null;
let model = null;

if (GOOGLE_API_KEY) {
    genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    
    // Use latest Gemini models available on free tier
    // Try models in order of preference
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let modelInitialized = false;
    
    for (const modelName of modelsToTry) {
        try {
            console.log(`🔧 Initializing model: ${modelName}...`);
            model = genAI.getGenerativeModel({ model: modelName });
            console.log(`✅ Google AI Studio API initialized with ${modelName}`);
            modelInitialized = true;
            break;
        } catch (e) {
            console.log(`⚠️  ${modelName} initialization error: ${e.message}`);
        }
    }
    
    if (!modelInitialized) {
        console.error('❌ Failed to initialize any model. Check your API key at: https://aistudio.google.com');
        console.error('The models may not be available on your API tier.');
        model = null;
    }
} else {
    console.log('⚠️  No Google API key found. Using fallback responses.');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Store full conversation history per user session
const conversationHistory = new Map();

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

// Call Google AI Studio (Gemini) API with full conversation context
async function getAIResponse(userMessage, sessionId) {
    if (!model) {
        return null; // Will use fallback responses
    }

    try {
        // Get conversation history (already initialized by chat endpoint)
        const sessionMessages = conversationHistory.get(sessionId) || [];
        
        // Build full conversation context (excluding the current message we just added)
        let conversationContext = '';
        if (sessionMessages.length > 1) {
            conversationContext = '\n\n=== CONVERSATION HISTORY ===\n';
            // Skip the last message (which is the current user message)
            sessionMessages.slice(0, -1).forEach((msg) => {
                if (msg.role === 'user') {
                    conversationContext += `\nUser: ${msg.content}`;
                } else {
                    conversationContext += `\nAI: ${msg.content}`;
                }
            });
            conversationContext += '\n\n=== NEW MESSAGE ===\n';
        }

        // Build comprehensive system prompt - optimized for free tier
        const systemPrompt = `You are niSirJofel AI, a helpful and intelligent conversational assistant.

IMPORTANT - REMEMBER CONVERSATION:
1. Pay careful attention to everything the user says in this conversation
2. Reference earlier messages to show you remember the context
3. If user asks "what do I love?" or "what did I say?" - refer to conversation history
4. Be natural and engaging
5. Keep responses concise but thoughtful

${conversationContext}

Now respond naturally to the user's message.`;
        
        // Build the full prompt
        const fullPrompt = systemPrompt + `\n\nUser's message: ${userMessage}`;
        
        console.log(`📤 Sending request to Gemini API for session: ${sessionId}`);
        
        // Send request with full context using simplified format
        const result = await model.generateContent(fullPrompt);
        const response = result.response;
        const aiMessage = response.text();
        
        console.log(`✅ AI Response: ${aiMessage.substring(0, 80)}...`);
        return aiMessage || "I'm thinking...";
        
    } catch (error) {
        console.error('❌ API Error Details:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        console.log('⚠️  Falling back to built-in responses...');
        return null; // Use fallback responses
    }
}

// Generate smart bot response with conversation memory (fallback)
function generateBotResponse(userMessage, sessionId) {
    const message = userMessage.toLowerCase();
    const sessionMessages = conversationHistory.get(sessionId) || [];
    
    // Extract ALL key facts from conversation history (capture all mentions, not just first)
    let conversationContext = {
        loves: [],
        likes: [],
        professions: [],
    };
    
    sessionMessages.forEach(msg => {
        if (msg.role === 'user') {
            const content = msg.content;
            
            // Extract "I love X" patterns (capture ALL occurrences)
            const loveMatches = content.match(/i\s+love\s+(\w+)/gi);
            if (loveMatches) {
                loveMatches.forEach(match => {
                    const word = match.replace(/i\s+love\s+/i, '');
                    if (word && !conversationContext.loves.includes(word)) {
                        conversationContext.loves.push(word);
                    }
                });
            }
            
            // Extract "I like X" patterns (capture ALL occurrences)
            const likeMatches = content.match(/i\s+like\s+(\w+)/gi);
            if (likeMatches) {
                likeMatches.forEach(match => {
                    const word = match.replace(/i\s+like\s+/i, '');
                    if (word && !conversationContext.likes.includes(word)) {
                        conversationContext.likes.push(word);
                    }
                });
            }
            
            // Extract "I'm X" / "I am X" patterns
            const amMatch = content.match(/i'?m\s+(\w+)/i) || content.match(/i\s+am\s+(\w+)/i);
            if (amMatch && !conversationContext.professions.includes(amMatch[1])) {
                conversationContext.professions.push(amMatch[1]);
            }
        }
    });
    
    // Greeting patterns
    if (message.match(/^(hello|hi|hey|greetings|good morning|good afternoon|good evening)/i)) {
        return "Hi! Nice to chat with you. What's on your mind?";
    }
    
    // Recall patterns - use stored context
    if (message.match(/what do i (love|like)\?/i)) {
        if (conversationContext.loves.length > 0) {
            return `You love: ${conversationContext.loves.join(', ')}!`;
        }
        if (conversationContext.likes.length > 0) {
            return `You like: ${conversationContext.likes.join(', ')}!`;
        }
        return "You haven't mentioned what you love or like yet. Tell me!";
    }
    
    if (message.match(/what am i\?|who am i\?|what do i do\?|what's my job\?|what is my job\?/i)) {
        if (conversationContext.professions.length > 0) return `You're a ${conversationContext.professions[0]}!`;
        return "I'm not sure - tell me about yourself!";
    }
    
    // Context-aware responses
    if (message.match(/history/i)) {
        if (sessionMessages.length === 0) {
            return "We haven't talked about anything yet. Start a conversation!";
        }
        return `I remember our last ${Math.ceil(sessionMessages.length / 2)} message exchanges. What would you like to discuss?`;
    }
    
    // Default thoughtful response
    return "That's interesting! Tell me more about that.";
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
        
        // Initialize conversation history for this session if needed
        if (!conversationHistory.has(userId)) {
            conversationHistory.set(userId, []);
            console.log(`📝 New chat session created: ${userId}`);
        }
        
        // IMPORTANT: Store user message BEFORE trying API
        // This ensures fallback system has access to full conversation history
        const sessionMessages = conversationHistory.get(userId);
        sessionMessages.push({ role: 'user', content: message });
        
        console.log(`💬 User (${userId}): ${message}`);
        
        // Try to get AI response first (with conversation history)
        let reply = await getAIResponse(message, userId);
        
        // Fallback to smart responses with conversation memory if AI is unavailable
        if (!reply) {
            reply = generateBotResponse(message, userId);
        }
        
        // Store AI response in history
        sessionMessages.push({ role: 'assistant', content: reply });
        
        // Keep history manageable (last 100 exchanges = ~200 messages)
        if (sessionMessages.length > 200) {
            sessionMessages.splice(0, 50); // Remove oldest 25 exchanges
        }
        
        console.log(`✅ Response: ${reply.substring(0, 80)}...`);
        
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
    if (conversationHistory.has(userId)) {
        conversationHistory.delete(userId);
        console.log(`🗑️  Conversation history cleared: ${userId}`);
    }
    res.json({ status: 'Conversation cleared', sessionId: userId });
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
