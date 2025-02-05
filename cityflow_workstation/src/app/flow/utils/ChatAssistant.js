import ChatBot from '@/components/Chatbot';
import { Box } from '@mui/material';
import { useLocalStorage, getLocalStorage } from '@/utils/local';
import { useEffect, useState } from 'react';

const ChatAssistant = ({ tab }) => {
  const [localLLMConfig, setLocalLLMConfig] = useLocalStorage('LLM_CONFIG');
  const [llmConfig, setLLMConfig] = useState(null);

  useEffect(() => {
    setLLMConfig({ ...localLLMConfig });
  }, [localLLMConfig]);

  return (
    <Box id="cityflow_assistant" hidden={tab !== 2}>
      {llmConfig && (
        <ChatBot
          llmConfig={llmConfig}
          setLLMConfig={setLocalLLMConfig}
          height={'75vh'}
        />
      )}
    </Box>
  );
};

export default ChatAssistant;
