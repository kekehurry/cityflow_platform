import ChatBot from '@/components/Chatbot';
import { Box } from '@mui/material';
import { useLocalStorage } from '@/utils/local';
import { useEffect, useState } from 'react';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const ChatAssistant = ({ tab }) => {
  const [localLLMConfig, setLocalLLMConfig] = useLocalStorage('LLM_CONFIG');
  const [llmConfig, setLLMConfig] = useState({
    name: 'CityFlow',
    assistantIcon: `${basePath}/static/favicon.ico`,
    systemPrompt:
      localLLMConfig?.systemPrompt ||
      `You are a helpful assistant for CityFlow Platform. You can help users to design, evaluate, and visualize urban solutions through Python and JavaScript modules and creating customized workflows.`,
    context: `Today is ${new Date().toDateString()}`,
    greeding: `What can I do for you?`,
    height: '75vh',
    model: localLLMConfig?.model || 'gpt-4o-mini',
    baseUrl: localLLMConfig?.baseUrl || 'https://api.openai.com/v1',
    temperature: localLLMConfig?.temperature || 0.8,
    maxTokens: localLLMConfig?.maxTokens || 4192,
    presencePenalty: localLLMConfig?.presencePenalty || 0.0,
    frequencyPenalty: localLLMConfig?.frequencyPenalty || 0.0,
    responseFormat: localLLMConfig?.responseFormat || 'text',
  });

  useEffect(() => {
    setLocalLLMConfig({
      ...llmConfig,
    });
  }, [llmConfig]);
  return (
    <Box id="cityflow_assistant" hidden={tab !== 2}>
      <ChatBot
        llmConfig={llmConfig}
        setLLMConfig={setLLMConfig}
        height={'75vh'}
      />
    </Box>
  );
};

export default ChatAssistant;
