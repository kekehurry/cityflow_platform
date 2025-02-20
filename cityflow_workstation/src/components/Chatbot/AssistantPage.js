import ChatBot from '@/components/Chatbot';
import { Box } from '@mui/material';
import { useLocalStorage, getLocalStorage } from '@/utils/local';
import { useEffect, useState } from 'react';
import theme from '@/theme';

const AssistantPage = ({ width, height, background = 'none' }) => {
  const [localLLMConfig, setLocalLLMConfig] = useLocalStorage('LLM_CONFIG');
  const [llmConfig, setLLMConfig] = useState(null);

  useEffect(() => {
    setLLMConfig({ ...localLLMConfig });
  }, [localLLMConfig]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: background || 'none',
        pt: '5%',
        pb: '5%',
      }}
    >
      {llmConfig && (
        <ChatBot
          llmConfig={llmConfig}
          setLLMConfig={setLocalLLMConfig}
          height={height || '100%'}
          width={width || '100%'}
        />
      )}
    </Box>
  );
};

export default AssistantPage;
