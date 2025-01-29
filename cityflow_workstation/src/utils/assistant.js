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
    if (!props) return;
    this.props = props;
  }

  async chat(inputMessage, messageHistory = null) {
    const LLM_API_KEY = getLocalStorage('LLM_API_KEY');
    const messages = [
      {
        role: 'system',
        content: this.props.systemPrompt || 'you are a helpful assistant',
      },
      { role: 'user', content: this.props.context || '' },
      ...parseMessage(messageHistory),
      { role: 'user', content: inputMessage || '' },
    ];

    try {
      const response = await fetch(`${this.props.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LLM_API_KEY}`,
        },
        body: JSON.stringify({
          model: this.props.model || 'gpt-4o-mini',
          messages: messages,
          response_format: this.props.responseFormat
            ? {
                type: this.props.responseFormat,
              }
            : { type: 'text' },
          max_tokens: this.props.maxTokens || 4096,
          temperature: this.props.temperature || 0.8,
          presence_penalty: this.props.presencePenalty || 0.0,
          frequency_penalty: this.props.frequencyPenalty || 0.0,
        }),
      });
      if (!response.ok) {
        throw new Error(response.status);
      }
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      return error;
    }
  }

  async *stream(inputMessage, messageHistory, signal) {
    const LLM_API_KEY = getLocalStorage('LLM_API_KEY');
    const messages = [
      {
        role: 'system',
        content: this.props.systemPrompt || 'you are a helpful assistant',
      },
      { role: 'user', content: this.props.context || '' },
      ...parseMessage(messageHistory),
      { role: 'user', content: inputMessage || '' },
    ];

    try {
      const response = await fetch(`${this.props.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LLM_API_KEY}`,
        },
        body: JSON.stringify({
          model: this.props.model || 'gpt-4o-mini',
          messages: messages,
          response_format: this.props.responseFormat
            ? {
                type: this.props.responseFormat,
              }
            : { type: 'text' },
          max_tokens: this.props.maxTokens || 4096,
          temperature: this.props.temperature || 0.8,
          presence_penalty: this.props.presencePenalty || 0.0,
          frequency_penalty: this.props.frequencyPenalty || 0.0,
          stream: true,
        }),
        signal,
      });

      if (!response.ok) {
        throw new Error(response.status);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        // Check if the signal is aborted
        if (signal.aborted) {
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
                yield e;
              }
            }
          }
        }
      }
    } catch (error) {
      yield error;
    }
  }
}
