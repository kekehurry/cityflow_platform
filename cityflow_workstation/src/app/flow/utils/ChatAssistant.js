import ChatBot from '@/components/Chatbot';
import { Box } from '@mui/material';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const ChatAssistant = ({ tab }) => {
  const name = 'CityFlow';
  const assistantIcon = `${basePath}/static/favicon.ico`;
  const systemPrompt = `You are a helpful assistant for CityFlow Platform. You can help users to design, evaluate, and visualize urban solutions through Python and JavaScript modules and creating customized workflows.`;
  const context = `Today is ${new Date().toDateString()}`;
  const height = '65vh';
  return (
    <Box id="cityflow_assistant" hidden={tab !== 2}>
      <ChatBot
        name={name}
        assistantIcon={assistantIcon}
        systemPrompt={systemPrompt}
        context={context}
        height={height}
      />
    </Box>
  );
};

export default ChatAssistant;
