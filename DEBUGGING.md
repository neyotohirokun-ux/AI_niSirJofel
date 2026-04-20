# 🔧 Troubleshooting & Debugging Guide

## Hallucination Issues - SOLVED ✅

Your chatbot was hallucinating because:
1. **No system instruction** - Model didn't know to stay on topic
2. **High temperature** - 0.7 was too creative/random
3. **No conversation focus** - Wasn't anchored to what you said

### What's Fixed Now:

✅ **System Instruction Added** - Model now explicitly instructed to:
- Only reference things from YOUR conversation
- Never make up information
- Ask clarifying questions instead of guessing
- Stay focused on the topic

✅ **Temperature Reduced** - From 0.7 → 0.3 (More consistent, less hallucination)

✅ **Conversation Memory** - Full history context with every message

✅ **Detailed Logging** - See exactly what the AI receives and outputs

---

## 🧪 How to Test & Debug

### Step 1: Verify API Key is Working
Run this in terminal to check if API is initialized:
```bash
curl http://localhost:3000/api/verify
```

You should see:
```json
{
  "status": "verified",
  "hasApiKey": true,
  "modelInitialized": true,
  "apiKeyPreview": "AIzaSyA..."
}
```

### Step 2: Check Server Health
```bash
curl http://localhost:3000/api/health
```

Should show:
```json
{
  "status": "Bot is running!",
  "hasMemory": true,
  "apiInitialized": true,
  "activeSessions": 1
}
```

### Step 3: View Console Logs
Watch your terminal where you ran `npm start`. You'll see:
```
📝 New chat session created: session_1234...
💬 User (session_1234...): What's your name?
🤖 AI Response: I'm niSirJofel AI, a helpful chatbot...
```

This tells you the API is working!

---

## 🐛 Debugging Conversation Issues

### Browser Console (F12 or Cmd+Option+I):
```javascript
// Check session ID
console.log(localStorage.getItem('chatSessionId'))

// Should show: session_1713600000000_abc123...
```

### Terminal Logs:
Look for these indicators:

✅ **Good Sign:**
```
💬 User (session_xxx): I like coffee
🤖 AI Response: That's great! Coffee is a popular beverage...
💬 User (session_xxx): What do I like?
🤖 AI Response: Based on our conversation, you like coffee!
```

❌ **Bad Sign (Hallucination):**
```
💬 User (session_xxx): I like coffee
🤖 AI Response: Great! I like pizza too...  ← Didn't mention pizza!
```

---

## 🛠️ If It Still Hallucinating:

### 1. Clear Browser Cache
```bash
# Press: Cmd+Shift+Delete (Chrome/Safari)
# Clear Browsing Data → Clear cache
```

### 2. Clear Conversation History
- Click "Clear History" button in chat
- This starts fresh session

### 3. Restart Server
```bash
# Stop: Ctrl+C in terminal
npm start
```

### 4. Check Temperature Setting
If still hallucinating, lower temperature in `server.js`:
```javascript
temperature: 0.2,  // Even lower (more focused)
```

---

## 📊 Temperature Settings Explained

- **0.1 - 0.3** = Very focused, safe responses (recommended)
- **0.4 - 0.6** = Balanced
- **0.7 - 1.0** = Creative, more hallucination risk

---

## 🚀 Expected Behavior Now

**Test Conversation:**
1. User: "I'm learning Python"
2. AI: "That's great! Python is an excellent programming language..."
3. User: "What language am I learning?"
4. AI: "Based on our conversation, you're learning Python!"

**NOT:**
4. AI: "You're learning JavaScript" ← This would be hallucination

---

## 📝 API Key Validation

Your key is properly configured in `.env`:
```
GOOGLE_API_KEY=AIzaSyACLaL7U25Xm3O9DMSL64KehGVP03q52BE
```

The backend loads it and initializes Google AI:
```
✅ Google AI Studio API initialized
```

---

## 🆘 Still Having Issues?

1. Check terminal output for error messages
2. Verify API key hasn't expired (regenerate at https://aistudio.google.com/app/apikey)
3. Check internet connection (API needs to reach Google)
4. Try clearing localStorage: `localStorage.clear()` in browser console

---

## 💡 Pro Tips

- **Press F12** → Console tab to see client-side logs
- **Watch terminal** where `npm start` runs to see server logs  
- **Shorter conversations test better** - Start simple, then more complex
- **Clear history between tests** - Use the Clear History button
- **Refresh page** after restarting server

