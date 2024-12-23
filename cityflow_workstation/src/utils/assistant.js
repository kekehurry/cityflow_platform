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

  async chat(inputMessage, messageHistory) {
    const messages = [
      { role: 'system', content: this.systemPrompt },
      ...parseMessage(messageHistory),
      { role: 'user', content: this.context },
      { role: 'user', content: inputMessage },
    ];

    try {
      const api = '/api/assistant/chat';
      const response = await fetch(basePath + api, {
        method: 'POST',
        body: JSON.stringify({
          messages,
        }),
      });
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error during chat:', error);
    }
  }

  async stream(inputMessage, messageHistory, signal) {
    const messages = [
      { role: 'system', content: this.systemPrompt },
      ...parseMessage(messageHistory),
      { role: 'user', content: inputMessage },
    ];

    try {
      const api = '/api/assistant/stream';
      const response = await fetch(basePath + api, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let output = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        // Parse each line of the streamed response
        chunk.split('\n').forEach((line) => {
          if (line.startsWith('data:')) {
            const jsonData = line.slice(5).trim();
            if (jsonData === '[DONE]') {
              // End of the stream
              return;
            }
            if (jsonData) {
              try {
                const parsed = JSON.parse(jsonData);
                const content = parsed.choices[0]?.delta?.content;
                if (content) {
                  output += content;
                }
              } catch (e) {
                console.error('Error parsing JSON:', e);
              }
            }
          }
        });
      }

      return output;
    } catch (error) {
      console.error('Error during stream:', error);
    }
  }
}
