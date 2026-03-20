const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  const apiKey = 'AIzaSyCmhX-oXJf_Arh4JqlQ1wyvsCnsTPH6U-s';
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const result = await genAI.listModels();
    console.log('Available Models:');
    result.models.forEach(model => {
      console.log(`- ${model.name}`);
    });
  } catch (error) {
    console.error('Error listing models:', error.message);
  }
}

listModels();
