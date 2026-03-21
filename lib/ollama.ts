import axios from 'axios';

export interface OllamaOptions {
  model: string;
  prompt: string;
  stream?: boolean;
  images?: string[]; // Base64 strings for LLaVA
  format?: 'json';
}

const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

export async function generateEmbedding(prompt: string) {
  try {
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/embeddings`, {
      model: 'nomic-embed-text',
      prompt
    });
    return (response.data as any).embedding;
  } catch (error) {
    console.error('Ollama Embedding error:', error);
    return new Array(768).fill(0); // Fallback
  }
}

export async function generateOllama(options: OllamaOptions) {
  const OLLAMA_GENERATE_URL = `${OLLAMA_BASE_URL}/api/generate`;
  
  try {
    const response = await fetch(OLLAMA_GENERATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options.model,
        prompt: options.prompt,
        stream: options.stream ?? false,
        images: options.images,
        format: options.format
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error: any) {
    console.error('Ollama Service Error:', error);
    throw new Error(`Failed to contact local Ollama server: ${error.message}`);
  }
}

export async function chatOllama(model: string, messages: any[]) {
  const OLLAMA_CHAT_URL = 'http://localhost:11434/api/chat';
  
  try {
    const response = await fetch(OLLAMA_CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama Chat API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.message.content;
  } catch (error: any) {
    console.error('Ollama Chat Error:', error);
    throw new Error(`Failed to contact local Ollama server: ${error.message}`);
  }
}
