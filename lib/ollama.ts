export interface OllamaOptions {
  model: string;
  prompt: string;
  stream?: boolean;
  images?: string[]; // Base64 strings for LLaVA
  format?: 'json';
}

export async function generateOllama(options: OllamaOptions) {
  const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
  
  try {
    const response = await fetch(OLLAMA_URL, {
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
