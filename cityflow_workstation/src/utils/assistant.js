import { get } from 'lodash';
import { semanticSearch } from './dataset';

const parseMessage = (messages) => {
  if (!messages) {
    return [];
  }
  return messages.map((msg) => {
    if (msg.role === 'AI') {
      const messageWithoutThink = msg.message.replace(
        /<think>(.*?)<\/think>/gs,
        ''
      );
      return { role: 'assistant', content: messageWithoutThink };
    } else if (msg.role === 'system') {
      return { role: 'system', content: msg.message };
    } else {
      return { role: 'user', content: msg.message };
    }
  });
};

const isBase64Image = (str) => {
  return /^data:image\/[a-zA-Z]+;base64,/.test(str);
};

const getContext = async (query) => {
  const searchResults = await semanticSearch(query, 3);
  const [graph, ids, nodes] = searchResults;
  const knowledgeNodes = graph.nodes.map((node) => {
    const { id, value, ...res } = node;
    return res;
  });
  const knowledgeLinks = graph.links.map((link) => {
    const sourceNode = graph.nodes.find((node) => node.id === link.source);
    const targetNode = graph.nodes.find((node) => node.id === link.target);
    return {
      source: {
        nodeId: sourceNode?.nodeId,
        name: sourceNode?.name,
      },
      target: {
        nodeId: targetNode?.nodeId,
        name: targetNode?.name,
      },
      relation: link.type,
    };
  });
  const knowledgeGraph = {
    nodes: knowledgeNodes,
    links: knowledgeLinks,
  };
  const context = `This is the knowledge graph context might related to the question: ${JSON.stringify(
    knowledgeGraph
  )}`;
  return context;
};

export default class Assistant {
  constructor(props) {
    if (!props) return;
    this.props = props;
  }

  async chat({ inputMessage, messageHistory }) {
    const messages = [
      {
        role: 'system',
        content: this.props?.systemPrompt || 'you are a helpful assistant',
      },
    ];
    if (messageHistory) {
      messages.push(...parseMessage(messageHistory));
    }
    if (this.props?.context) {
      const contextToPush = Array.isArray(this.props?.context)
        ? this.props?.context
        : [this.props?.context];

      contextToPush.forEach((msg) => {
        messages.push(
          isBase64Image(msg)
            ? {
                role: 'user',
                content: [{ type: 'image_url', image_url: { url: msg } }],
              }
            : { role: 'user', content: msg || '' }
        );
        messages.push({
          role: 'assistant',
          content: 'I understand the context, what do you want to know?',
        });
      });
    }
    if (inputMessage) {
      const messagesToPush = Array.isArray(inputMessage)
        ? inputMessage
        : [inputMessage];

      messagesToPush.forEach((msg) => {
        messages.push(
          isBase64Image(msg)
            ? {
                role: 'user',
                content: [{ type: 'image_url', image_url: { url: msg } }],
              }
            : { role: 'user', content: msg || '' }
        );
      });
    }
    try {
      const response = await fetch(`${this.props?.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.props?.apiKey}`,
        },
        body: JSON.stringify({
          model: this.props?.model || 'gpt-4o-mini',
          messages: messages,
          response_format: this.props?.responseFormat
            ? {
                type: this.props?.responseFormat,
              }
            : { type: 'text' },
          max_tokens: this.props?.maxTokens || 4096,
          temperature: this.props?.temperature || 0.8,
          // presence_penalty: this.props?.presencePenalty || 0.0,
          // frequency_penalty: this.props?.frequencyPenalty || 0.0,
        }),
      }).catch((error) => {
        throw new Error(error);
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

  async *stream({ inputMessage, messageHistory, signal, tool }) {
    const messages = [
      {
        role: 'system',
        content: this.props?.systemPrompt || 'you are a helpful assistant',
      },
    ];
    if (messageHistory) {
      messages.push(...parseMessage(messageHistory));
    }
    if (this.props?.context) {
      const contextToPush = Array.isArray(this.props?.context)
        ? this.props?.context
        : [this.props?.context];

      contextToPush.forEach((msg) => {
        messages.push(
          isBase64Image(msg)
            ? {
                role: 'user',
                content: [{ type: 'image_url', image_url: { url: msg } }],
              }
            : { role: 'user', content: msg || '' }
        );
        messages.push({
          role: 'assistant',
          content: 'I understand the context, what do you want to know?',
        });
      });
    }
    if (tool == 'search') {
      const context = await getContext(inputMessage);
      messages.push({
        role: 'user',
        content: context,
      });
      messages.push({
        role: 'assistant',
        content:
          'I understand the knowledge graph context, what do you want to know?',
      });
    }
    if (inputMessage) {
      const messagesToPush = Array.isArray(inputMessage)
        ? inputMessage
        : [inputMessage];

      messagesToPush.forEach((msg) => {
        messages.push(
          isBase64Image(msg)
            ? {
                role: 'user',
                content: [{ type: 'image_url', image_url: { url: msg } }],
              }
            : { role: 'user', content: msg || '' }
        );
      });
    }

    try {
      const response = await fetch(`${this.props?.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.props?.apiKey}`,
        },
        body: JSON.stringify({
          model: this.props?.model || 'gpt-4o-mini',
          messages: messages,
          response_format: this.props?.responseFormat
            ? {
                type: this.props?.responseFormat,
              }
            : { type: 'text' },
          max_tokens: this.props?.maxTokens || 4096,
          temperature: this.props?.temperature || 0.8,
          // presence_penalty: this.props?.presencePenalty || 0.0,
          // frequency_penalty: this.props?.frequencyPenalty || 0.0,
          stream: true,
        }),
        signal,
      }).catch((error) => {
        throw new Error(error);
      });

      if (!response.ok) {
        throw new Error(response.status);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        // Check if the signal is aborted
        if (signal.aborted) {
          reader.cancel(); // Cancel the reader
          return; // Exit the generator
        }

        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        let boundary = buffer.indexOf('\n');
        while (boundary !== -1) {
          const line = buffer.slice(0, boundary).trim();
          buffer = buffer.slice(boundary + 1);

          if (line.startsWith('data:')) {
            const jsonData = line.slice(5).trim();
            if (jsonData === '[DONE]') {
              return; // End of the stream
            }
            if (jsonData) {
              try {
                const parsed = JSON.parse(jsonData);
                const reasoning_content =
                  parsed.choices[0]?.delta?.reasoning_content;
                const content = parsed.choices[0]?.delta?.content;
                yield [reasoning_content, content];
              } catch (e) {}
            }
          }
          boundary = buffer.indexOf('\n');
        }
      }
    } catch (error) {
      yield error;
    }
  }
}
