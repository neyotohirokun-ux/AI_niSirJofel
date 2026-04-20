#!/bin/bash

echo "🤖 niSirJofel AI Chatbot - Setup"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js detected: $(node -v)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm detected: $(npm -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Get your FREE Hugging Face API key: https://huggingface.co/settings/tokens"
echo "2. Create a .env file: cp .env.example .env"
echo "3. Add your API key to the .env file"
echo "4. Start the server: npm start"
echo "5. Open http://localhost:3000 in your browser"
echo ""
echo "📚 For more info, see SETUP_AI.md"
