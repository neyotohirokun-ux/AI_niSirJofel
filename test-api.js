// Test API Key and Model Availability
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = process.env.GOOGLE_API_KEY;

console.log('🧪 Testing Google AI Studio API...\n');
console.log('API Key configured:', !!API_KEY);
if (API_KEY) {
    console.log('API Key preview:', API_KEY.substring(0, 20) + '...\n');
}

async function testAPI() {
    if (!API_KEY) {
        console.error('❌ No API key found. Please add GOOGLE_API_KEY to .env file');
        console.log('\nSteps:');
        console.log('1. Go to: https://aistudio.google.com/app/apikey');
        console.log('2. Create or copy your API key');
        console.log('3. Add to .env file: GOOGLE_API_KEY=your_key_here');
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        
        console.log('✅ GoogleGenerativeAI initialized\n');
        
        // Test different models
        const modelsToTest = [
            'gemini-pro',
            'gemini-pro-vision',
            'gemini-1.5-pro',
            'gemini-1.5-flash',
        ];
        
        for (const modelName of modelsToTest) {
            try {
                console.log(`🔍 Testing model: ${modelName}...`);
                const model = genAI.getGenerativeModel({ model: modelName });
                
                // Try a simple request
                const result = await model.generateContent('Hello, are you working?');
                const response = await result.response;
                const text = response.text();
                
                console.log(`✅ ${modelName} - WORKING!`);
                console.log(`   Response: "${text.substring(0, 50)}..."\n`);
                
            } catch (error) {
                console.log(`❌ ${modelName} - Failed: ${error.message}\n`);
            }
        }
        
    } catch (error) {
        console.error('❌ Failed to initialize GoogleGenerativeAI:', error.message);
        console.log('\nPossible issues:');
        console.log('1. Invalid API key - regenerate at https://aistudio.google.com/app/apikey');
        console.log('2. API not enabled - check Google AI Studio');
        console.log('3. Network issue - check internet connection');
    }
}

testAPI();
