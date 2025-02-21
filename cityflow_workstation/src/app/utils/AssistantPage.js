import ChatBot from '@/components/Chatbot';
import { Box } from '@mui/material';
import { useLocalStorage } from '@/utils/local';
import { useEffect, useState } from 'react';

const AssistantPage = ({ width, height, background = 'none' }) => {
  const [localLLMConfig, setLocalLLMConfig] = useLocalStorage('LLM_CONFIG');
  const [llmConfig, setLLMConfig] = useState(null);

  useEffect(() => {
    setLLMConfig({
      ...localLLMConfig,
      systemPrompt: `You are a helpful assistant for CityFlow Platform. This platform can evaluate, and visualize urban solutions through Python and JavaScript modules and creating customized workflows. 
    
    - If no knowledge graph context is provided, you need to answer the question as best as you can.

    - When you are provided with a knowledge graph context, you need to analyse the context and generate accurate, clear, and helpful responses. 
    
      - Don't answer with graph context directly, but with the information that is relevant to the user's question. 
    
      - At the end of your answer, attach the "flow_id" that you think is the most relevant to the user's question. 
      - The maximun nember of attached workflows or modules is 3.
      - Wrap the id in a <workflow></worflow> tag. 
      - If there are multiple workflows or modules, wrap them in a flexbox. 

      For example:  
      <workflow flow_id="1234" type="module"></workflow>
      <workflow flow_id="1234" type="workflow"></workflow>
    `,
    });
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
          useTool={true}
        />
      )}
    </Box>
  );
};

export default AssistantPage;
