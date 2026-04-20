# 🤖 niSirJofel AI Chatbot - Setup Guide

## Quick Start (With Google AI Studio - Gemini)

### 1. Your API Key is Ready! ✅
You've already provided your Google AI Studio API key:
```
AIzaSyACLaL7U25Xm3O9DMSL64KehGVP03q52BE
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Server
```bash
npm start
```

The server will run on `http://localhost:3000`

### 4. Open in Browser
Open `index.html` in your browser or go to `http://localhost:3000`

That's it! Your chatbot is ready to use with **Google Gemini AI** 🚀

---

## Features

✅ **Powered by Google Gemini** - Advanced AI model  
✅ **No Credit Card** - Completely free tier available  
✅ **Smart Fallback** - Works with or without API key  
✅ **Real Conversations** - Understands context and generates human-like responses  
✅ **Fast & Reliable** - Google's infrastructure  
✅ **Latest AI Model** - Uses state-of-the-art Gemini technology  

---

## Troubleshooting

**Q: Getting rate limited?**
- A: Google AI Studio free tier has limits. The chatbot will fall back to simple responses if limits are exceeded. Wait a moment and try again.

**Q: API Key not working?**
- A: Make sure the API key is correctly pasted in the `.env` file
- Get a new one at: https://aistudio.google.com/app/apikey

**Q: Port 3000 already in use?**
- A: Edit `server.js` and change `const PORT = 3000;` to another port like `3001`

**Q: Want to generate a new API key?**
- A: Visit https://aistudio.google.com/app/apikey and create a new one, then update your `.env` file

---

## Project Structure

```
AI_niSirJofel/
├── index.html          # Frontend (HTML)
├── style/index.css     # Styling (CSS)
├── js/chat.js          # Chat logic (JavaScript)
├── server.js           # Node.js backend with Google Gemini API
├── package.json        # Dependencies
├── .env               # Your API key (don't share!)
├── .env.example       # Example template
└── SETUP_AI.md        # This file
```

---

## More Info

- **Google AI Studio**: https://aistudio.google.com
- **Gemini Model Docs**: https://ai.google.dev/
- **Free API Tier Details**: https://ai.google.dev/pricing
