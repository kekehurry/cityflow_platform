import { getLocalStorage } from './local';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const parseMessage = (messages) => {
  if (!messages) {
    return [];
  }
  return messages.map((msg) => {
    if (msg.role === 'AI') {
      return { role: 'assistant', content: msg.message };
    } else if (msg.role === 'system') {
      return { role: 'system', content: msg.message };
    } else {
      return { role: 'user', content: msg.message };
    }
  });
};

export default class Assistant {
  constructor(props) {
    this.props = props;
    const { systemPrompt, context } = props;
    // Store system prompt and context for later use
    this.systemPrompt = systemPrompt;
    this.context = context;
  }

  async chat(inputMessage, messageHistory = null) {
    const LLM_BASE_URL = getLocalStorage('LLM_BASE_URL');
    const LLM_API_KEY = getLocalStorage('LLM_API_KEY');
    const LLM_MODEL = getLocalStorage('LLM_MODEL');
    const messages = [
      { role: 'system', content: this.systemPrompt },
      ...parseMessage(messageHistory),
      { role: 'user', content: this.context },
      { role: 'user', content: inputMessage },
    ];

    try {
      const response = await fetch(`${LLM_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LLM_API_KEY}`,
        },
        body: JSON.stringify({
          model: LLM_MODEL,
          messages: messages,
        }),
      });
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error during chat:', error);
    }
  }

  async *stream(inputMessage, messageHistory, signal) {
    const LLM_BASE_URL = getLocalStorage('LLM_BASE_URL');
    const LLM_API_KEY = getLocalStorage('LLM_API_KEY');
    const LLM_MODEL = getLocalStorage('LLM_MODEL');
    const messages = [
      { role: 'system', content: this.systemPrompt },
      ...parseMessage(messageHistory),
      { role: 'user', content: inputMessage },
    ];

    try {
      const response = await fetch(`${LLM_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LLM_API_KEY}`,
        },
        body: JSON.stringify({
          model: LLM_MODEL,
          messages: messages,
          stream: true,
        }),
        signal, // Pass the signal to the fetch request
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        // Check if the signal is aborted
        if (signal.aborted) {
          console.log('Stream aborted');
          reader.cancel(); // Cancel the reader
          return; // Exit the generator
        }

        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        for (const line of chunk.split('\n')) {
          if (line.startsWith('data:')) {
            const jsonData = line.slice(5).trim();
            if (jsonData === '[DONE]') {
              return; // End of the stream
            }
            if (jsonData) {
              try {
                const parsed = JSON.parse(jsonData);
                const content = parsed.choices[0]?.delta?.content;
                if (content) {
                  yield content; // Stream output to the caller
                }
              } catch (e) {
                console.error('Error parsing stream:', e);
              }
            }
          }
        }
      }
    } catch (error) {
      if (signal.aborted) {
        console.log('Stream stopped due to abort signal.');
      } else {
        console.log('Error during stream:', error);
      }
    }
  }
}
