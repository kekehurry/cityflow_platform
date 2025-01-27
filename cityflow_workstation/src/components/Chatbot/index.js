import React, { useState, useEffect } from 'react';
import {
  Stack,
  IconButton,
  InputAdornment,
  OutlinedInput,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { MessageLeft, MessageRight } from './utils/MessageBox';
import Assistant from '@/utils/assistant';
import { initUserId } from '@/utils/local';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function ChatBot({
  name,
  assistantIcon,
  sendCode,
  systemPrompt,
  context,
  height,
  greeding,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'AI',
      message: greeding || 'Hi, What can I do for you?',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [controller, setController] = useState(null);
  const [userId, setUserId] = useState(null);

  const handleAbort = () => {
    try {
      controller.abort();
      setController(null);
      setIsLoading(false);
    } catch (e) {
      console.log(e);
    }
  };

  const assistant = new Assistant({ systemPrompt, context });

  useEffect(() => {
    initUserId().then((id) => {
      setUserId(id);
    });
  }, []);

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === 'human') {
      setIsLoading(true);
      const newController = new AbortController();
      setController(newController);
      const signal = newController.signal;

      const historyMessage = messages.slice(0, messages.length - 1);
      const newMessage = messages[messages.length - 1].message;
      const readStream = async () => {
        let reply = '';
        try {
          for await (const chunk of await assistant.stream(
            newMessage,
            historyMessage,
            signal
          )) {
            reply += chunk;
            setMessages((prevMessages) => [
              ...prevMessages.slice(0, -1),
              { role: 'AI', message: reply },
            ]);
          }
          setIsLoading(false);
        } catch (e) {
          if (e.name === 'AbortError') {
            console.log('Aborted');
          } else {
            setIsLoading(false);
            setMessages([...messages, { role: 'AI', message: e }]);
          }
        }
      };
      readStream();
    }
  }, [messages, inputMessage]);

  useEffect(() => {
    isLoading &&
      setMessages([
        ...messages,
        { role: 'AI', message: `![loading](${basePath}/static/loading.gif)` },
      ]);
  }, [isLoading]);

  return (
    <Stack spacing={1} width="100%" height="100%">
      <Stack
        spacing={1}
        sx={{
          overflowY: 'auto',
          height: height,
          p: 0,
          m: 0,
          userSelect: 'text',
          cursor: 'auto',
        }}
        className="nowheel"
      >
        {messages &&
          messages.map((message, index) => {
            return message['role'] === 'human' ? (
              <MessageRight
                key={index}
                message={message['message']}
                name="human"
                avatar={`https://api.multiavatar.com/${userId.slice(0, 4)}.png`}
              />
            ) : (
              <MessageLeft
                key={index}
                message={message['message']}
                name={name}
                avatar={assistantIcon}
                sendCode={sendCode}
              />
            );
          })}
      </Stack>
      <OutlinedInput
        placeholder="Chat with Miya..."
        multiline
        rows={3}
        width="100%"
        size="small"
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            setMessages([
              ...messages,
              { role: 'human', message: inputMessage },
            ]);
            setInputMessage('');
          }
        }}
        endAdornment={
          <InputAdornment position="end">
            <Stack direction="row" spacing={1}>
              {isLoading ? (
                <IconButton size="small" onClick={handleAbort}>
                  <StopCircleIcon />
                </IconButton>
              ) : (
                <IconButton
                  size="small"
                  onClick={() => {
                    setMessages([
                      ...messages,
                      { role: 'human', message: inputMessage },
                    ]);
                    setInputMessage('');
                  }}
                >
                  <SendIcon />
                </IconButton>
              )}
              <IconButton
                size="small"
                onClick={() => {
                  setMessages([messages[0]]);
                  setInputMessage('');
                }}
              >
                <AddCircleIcon />
              </IconButton>
            </Stack>
          </InputAdornment>
        }
      />
    </Stack>
  );
}
