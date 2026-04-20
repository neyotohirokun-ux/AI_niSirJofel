// List Available Models
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = process.env.GOOGLE_API_KEY;

console.log('📋 Listing Available Models...\n');

async function listModels() {
    if (!API_KEY) {
        console.error('❌ No API key found in .env');
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        
        // Try to list models using the API
        try {
            // Note: listModels might not be available in all SDK versions
            // So we'll try direct API call instead
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
            );
            
            const data = await response.json();
            
            if (data.models) {
                console.log('✅ Available Models:\n');
                data.models.forEach(model => {
                    console.log(`- ${model.name}`);
                    console.log(`  Display Name: ${model.displayName}`);
                    console.log(`  Version: ${model.version}\n`);
                });
            } else if (data.error) {
                console.error('❌ API Error:', data.error.message);
            } else {
                console.log('Response:', JSON.stringify(data, null, 2));
            }
            
        } catch (error) {
            console.error('❌ Error listing models:', error.message);
        }
        
    } catch (error) {
        console.error('❌ Failed:', error.message);
    }
}

listModels();
