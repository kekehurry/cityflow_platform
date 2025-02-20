import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Stack,
  IconButton,
  InputAdornment,
  OutlinedInput,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Assistant from '@/utils/assistant';
import { initUserId, useLocalStorage } from '@/utils/local';
import { MessageLeft, MessageRight } from './utils/MessageBox';
import MenuIcon from '@mui/icons-material/Menu';
import theme from '@/theme';
import multiavatar from '@multiavatar/multiavatar/esm';

import LLMSetting from './utils/LLMSetting';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function ChatBot({
  llmConfig,
  setLLMConfig,
  width,
  height,
  sendCode,
}) {
  const [isLoading, setIsLoading] = useState(false);

  const [historyMessages, setHistoryMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');

  const [controller, setController] = useState(null);
  const [userId, setUserId] = useState(null);
  const [showConfig, setShowConfig] = useState(false);
  const localLLMConfig = useLocalStorage('LLM_CONFIG');
  const [assistant, setAssistant] = useState(new Assistant(localLLMConfig));
  const messageEndRef = useRef(null);

  const handleAbort = () => {
    try {
      controller.abort();
      setController(null);
      setIsLoading(false);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    setAssistant(new Assistant({ ...llmConfig }));
  }, [llmConfig]);

  useEffect(() => {
    initUserId().then((id) => {
      setUserId(id);
    });
  }, []);

  useEffect(() => {
    if (
      historyMessages.length > 0 &&
      historyMessages[historyMessages.length - 1].role === 'human'
    ) {
      setIsLoading(true);
      const newController = new AbortController();
      setController(newController);
      const signal = newController.signal;
      const readStream = async () => {
        let reply = '';
        try {
          for await (const chunk of await assistant.stream(
            '',
            historyMessages,
            signal
          )) {
            reply += chunk;
            setCurrentMessage({ role: 'AI', message: reply });
          }
          setIsLoading(false);
        } catch (e) {
          setIsLoading(false);
          setCurrentMessage({ role: 'AI', message: e });
        } finally {
          setHistoryMessages([
            ...historyMessages,
            { role: 'AI', message: reply },
          ]);
          setCurrentMessage('');
        }
      };
      readStream();
    }
  }, [historyMessages]);

  useEffect(() => {
    isLoading &&
      setCurrentMessage({
        role: 'AI',
        message: `![loading](${basePath}/static/loading.gif)`,
      });
  }, [isLoading]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }, [historyMessages, currentMessage]);

  return (
    <Stack
      spacing={1}
      width={width || '100%'}
      height={height || '100%'}
      overflow={'auto'}
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <IconButton
        sx={{
          alignSelf: 'flex-end',
          position: 'absolute',
          height: 30,
          width: 30,
          p: 0,
          zIndex: 1,
        }}
        onClick={() => setShowConfig(!showConfig)}
      >
        <MenuIcon
          sx={{ color: theme.palette.text.secondary, width: 15, height: 15 }}
        />
      </IconButton>
      {showConfig ? (
        <LLMSetting
          setAssistant={setAssistant}
          llmConfig={llmConfig}
          setLLMConfig={setLLMConfig}
          setShowConfig={setShowConfig}
        />
      ) : (
        <>
          <Stack
            spacing={1}
            sx={{
              overflowY: 'auto',
              width: '100%',
              height: '100%',
              p: 0,
              m: 0,
              userSelect: 'text',
              cursor: 'auto',
            }}
            className="nowheel"
          >
            {llmConfig?.greeding && (
              <MessageLeft
                key="greeding"
                message={llmConfig?.greeding}
                name={llmConfig?.name}
                avatar={llmConfig?.assistantIcon}
                sendCode={sendCode}
              />
            )}
            {historyMessages &&
              historyMessages.map((message, index) => {
                return message['role'] === 'human' ? (
                  <MessageRight
                    key={index}
                    message={message['message']}
                    name="human"
                    avatar={
                      userId &&
                      `data:image/svg+xml;utf8,${encodeURIComponent(
                        multiavatar(userId)
                      )}`
                    }
                  />
                ) : (
                  <MessageLeft
                    key={index}
                    message={message['message']}
                    name={llmConfig?.name}
                    avatar={llmConfig?.assistantIcon}
                    sendCode={sendCode}
                  />
                );
              })}
            {currentMessage && currentMessage.role === 'AI' && (
              <MessageLeft
                message={currentMessage.message}
                name={llmConfig?.name}
                avatar={llmConfig?.assistantIcon}
                sendCode={sendCode}
              />
            )}
            <div ref={messageEndRef} />
          </Stack>
          <OutlinedInput
            placeholder="Chat with CityFlow..."
            // multiline
            // rows={2}
            width="100%"
            size="small"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                setHistoryMessages([
                  ...historyMessages,
                  { role: 'human', message: inputMessage },
                ]);
                setInputMessage('');
              }
            }}
            sx={{
              borderRadius: 5,
              backgroundColor: theme.palette.secondary.gray,
              opacity: 0.7,
            }}
            inputProps={{
              style: {
                height: 40,
              },
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
                        setHistoryMessages([
                          ...historyMessages,
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
                      setHistoryMessages([]);
                      setInputMessage('');
                    }}
                  >
                    <AddCircleIcon />
                  </IconButton>
                </Stack>
              </InputAdornment>
            }
          />
        </>
      )}
    </Stack>
  );
}
