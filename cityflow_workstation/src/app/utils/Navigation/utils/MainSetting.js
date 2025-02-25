import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Stack,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Input,
  InputLabel,
  Divider,
  Typography,
} from '@mui/material';
import theme from '@/theme';
import { useLocalStorage, initUserId } from '@/utils/local';
import multiavatar from '@multiavatar/multiavatar/esm';
import EditIcon from '@mui/icons-material/Edit';

const inputProps = {
  style: {
    background: 'none',
    color: 'text.secondary',
    border: 'none',
    borderBottom: `1px solid text.secondary`,
  },
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const defaultCommunityURL = process.env.NEXT_PUBLIC_COMMUNITY_URL || '';

export default function MainSetting({ open, setOpen }) {
  const [localLLMConfig, setLocalLLMConfig] = useLocalStorage('LLM_CONFIG', {
    name: 'CityFlow',
    assistantIcon: `${basePath}/static/favicon.ico`,
    systemPrompt: `You are a helpful assistant for CityFlow Platform. This platform can evaluate, and visualize urban solutions through Python and JavaScript modules and creating customized workflows. 
    
    - If no knowledge graph context is provided, you need to answer the question as best as you can.

    - When you are provided with a knowledge graph context, you need to analyse the context and generate accurate, clear, and helpful responses. 
    
      - Don't answer with graph context directly, but with the information that is relevant to the user's question. 
    
      - At the end of your answer, attach the "nodeId" of workflows or modules that you think is the most relevant to the user's question. 
      - Do not attach 'Text,Shape, Arrow, Preivewer' modules.
      - The maximun nember of attached workflows or modules is 3.
      - Wrap the id in a <workflow></worflow> tag. 

      For example:  
      <workflow nodeId="1234" type="module"></workflow>
      <workflow nodeId="1234" type="workflow"></workflow>
    `,
    context: '',
    greeding: `What can I do for you?`,
    model: 'gpt-4o',
    baseUrl: 'https://api.openai.com/v1',
    temperature: 0.8,
    maxTokens: 4192,
    presencePenalty: 0.0,
    frequencyPenalty: 0.0,
    responseFormat: 'text',
    apiKey: '',
  });
  const [userId, setUserId] = useState(null);
  const [MAPBOX_TOKEN, setMapboxToken] = useLocalStorage('MAPBOX_TOKEN', '');
  const [userName, setUserName] = useLocalStorage('USER_NAME', null);
  const [codeCompletion, saveCodeCompletion] = useLocalStorage(
    'CODE_COMPLETION',
    'false'
  );
  const [autoCompletion, setAutoCompletion] = useState(
    codeCompletion == 'true'
  );
  const [autoSave, setAutoSave] = useLocalStorage('AUTO_SAVE', 'true');
  const [communityURL, setCommunityURL] = useLocalStorage(
    'COMMUNITY_URL',
    defaultCommunityURL
  );
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    initUserId().then((id) => {
      setUserId(id);
      userName || setUserName(`user_${id.slice(0, 5)}`);
    });
  }, []);

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      transitionDuration={{ enter: 500, exit: 500 }}
      variant="outlined"
      maxWidth="xs"
      PaperProps={{
        component: 'form',
        style: {
          width: '50vw',
          height: '60vh',
          border: theme.palette.node.border,
          background: theme.palette.flow.background,
          overflow: 'auto',
        },
      }}
    >
      <DialogTitle sx={{ fontSize: 20 }}>Settings</DialogTitle>
      <DialogContent>
        <Stack spacing={1}>
          <Divider />
          <Stack direction={'row'}>
            <Box
              width="50%"
              sx={{
                alignItems: 'center',
                display: 'flex',
                pt: 1,
                pb: 1,
              }}
            >
              <Avatar
                sx={{
                  width: 70,
                  height: 70,
                  boxShadow: '0 0 10px 0 #212121',
                }}
              >
                <img
                  style={{ width: 70, height: 70 }}
                  src={
                    userId &&
                    `data:image/svg+xml;utf8,${encodeURIComponent(
                      multiavatar(userId)
                    )}`
                  }
                />
              </Avatar>
            </Box>
            <Stack
              sx={{
                width: '100%',
                alignItems: 'left',
                justifyContent: 'center',
              }}
            >
              <Stack spacing={1} direction="row" sx={{ cursor: 'pointer' }}>
                {edit ? (
                  <Input
                    id="USER_NAME"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    fullWidth
                    inputProps={{
                      style: {
                        fontWeight: 'bold',
                        fontSize: 20,
                      },
                    }}
                  />
                ) : (
                  <Typography
                    sx={{
                      display: 'center',
                      fontWeight: 'bold',
                      fontSize: 20,
                    }}
                  >
                    {userName}
                  </Typography>
                )}
                <EditIcon
                  onClick={() => {
                    setEdit(!edit);
                  }}
                />
              </Stack>
              <Typography sx={{ fontSize: 10 }}>{userId}</Typography>
            </Stack>
          </Stack>
          <Divider />
          <Stack direction={'row'}>
            <InputLabel
              htmlFor="LLM_BASE_URL"
              size="small"
              sx={{ fontSize: 10, width: '50%' }}
            >
              BASE_URL
            </InputLabel>
            <Input
              id="LLM_BASE_URL"
              value={localLLMConfig?.baseUrl || ''}
              onChange={(e) =>
                setLocalLLMConfig({
                  ...localLLMConfig,
                  baseUrl: e.target.value,
                })
              }
              fullWidth
              inputProps={inputProps}
            />
          </Stack>
          <Stack direction={'row'}>
            <InputLabel
              htmlFor="LLM_MODEL"
              size="small"
              sx={{ fontSize: 10, width: '50%' }}
            >
              LLM_MODEL
            </InputLabel>
            <Input
              id="LLM_MODEL"
              value={localLLMConfig?.model || ''}
              onChange={(e) =>
                setLocalLLMConfig({
                  ...localLLMConfig,
                  model: e.target.value,
                })
              }
              fullWidth
              inputProps={inputProps}
            />
          </Stack>
          <Stack direction={'row'}>
            <InputLabel
              htmlFor="LLM_API_KEY"
              size="small"
              sx={{ fontSize: 10, width: '50%' }}
            >
              LLM_API_KEY
            </InputLabel>
            <Input
              type="password"
              id="LLM_API_KEY"
              value={localLLMConfig?.apiKey || ''}
              onChange={(e) =>
                setLocalLLMConfig({
                  ...localLLMConfig,
                  apiKey: e.target.value,
                })
              }
              fullWidth
              inputProps={inputProps}
            />
          </Stack>
          <Stack direction={'row'} sx={{ pb: 2 }}>
            <InputLabel
              htmlFor="MAPBOX_TOEKN"
              size="small"
              sx={{ fontSize: 10, width: '50%' }}
            >
              MAPBOX_TOKEN
            </InputLabel>
            <Input
              type="password"
              id="MAPBOX_TOEKN"
              value={MAPBOX_TOKEN || ''}
              onChange={(e) => setMapboxToken(e.target.value)}
              fullWidth
              inputProps={inputProps}
            />
          </Stack>
          <Divider />
          <Stack sx={{ pt: 1, pb: 1 }}>
            <Button
              variant="contained"
              onClick={() => {
                window.location.reload();
              }}
            >
              Submit
            </Button>
          </Stack>
          <Divider />
          <Stack
            direction={'row'}
            sx={{ pb: 2, pt: 2 }}
            style={{
              display: 'flex',
              flexDirection: 'row',
              paddingBottom: '16px',
              justifyContent: 'space-between',
            }}
          >
            <InputLabel
              htmlFor="AUTO_SAVE"
              style={{ fontSize: '10px', width: '50%' }}
            >
              AUTO_SAVE
            </InputLabel>
            <input
              type="checkbox"
              id="AUTO_SAVE"
              size="small"
              checked={autoSave == 'true'}
              onChange={(e) => {
                const status = e.target.checked;
                status ? setAutoSave('true') : setAutoSave('false');
              }}
              style={{
                appearance: 'none',
                width: '12px',
                height: '12px',
                cursor: 'pointer',
                backgroundColor:
                  autoSave == 'true' ? theme.palette.primary.main : '#f0f0f0', // Change colors based on checked state
                border: `0.5px solid ${theme.palette.secondary.gray}`,
                borderRadius: '50%',
                transition: 'background-color 0.3s ease', // Optional smooth transition
              }}
            />
          </Stack>
          <Stack
            direction={'row'}
            sx={{ pb: 2 }}
            style={{
              display: 'flex',
              flexDirection: 'row',
              paddingBottom: '16px',
              justifyContent: 'space-between',
            }}
          >
            <InputLabel
              htmlFor="CODE_COMPLETION"
              style={{ fontSize: '10px', width: '50%' }}
            >
              CODE_COMPLETION
            </InputLabel>
            <input
              type="checkbox"
              id="CODE_COMPLETION"
              size="small"
              checked={autoCompletion}
              onChange={(e) => {
                const status = e.target.checked;
                setAutoCompletion(e.target.checked);
                saveCodeCompletion(JSON.stringify(status));
              }}
              style={{
                appearance: 'none',
                width: '12px',
                height: '12px',
                cursor: 'pointer',
                backgroundColor: autoCompletion
                  ? theme.palette.primary.main
                  : '#f0f0f0', // Change colors based on checked state
                border: `0.5px solid ${theme.palette.secondary.gray}`,
                borderRadius: '50%',
                transition: 'background-color 0.3s ease', // Optional smooth transition
              }}
            />
          </Stack>
          <Divider />
          <Stack direction={'row'}>
            <InputLabel
              htmlFor="CODE_BASE_URL"
              size="small"
              sx={{ fontSize: 10, width: '50%' }}
            >
              CODE_BASE_URL
            </InputLabel>
            <Input
              id="CODE_BASE_URL"
              value={localLLMConfig?.codeBaseUrl || ''}
              onChange={(e) =>
                setLocalLLMConfig({
                  ...localLLMConfig,
                  codeBaseUrl: e.target.value,
                })
              }
              fullWidth
              inputProps={inputProps}
            />
          </Stack>
          <Stack direction={'row'}>
            <InputLabel
              htmlFor="CODE_MODEL"
              size="small"
              sx={{ fontSize: 10, width: '50%' }}
            >
              CODE_MODEL
            </InputLabel>
            <Input
              id="CODE_MODEL"
              value={localLLMConfig?.codeModel || ''}
              onChange={(e) =>
                setLocalLLMConfig({
                  ...localLLMConfig,
                  codeModel: e.target.value,
                })
              }
              fullWidth
              inputProps={inputProps}
            />
          </Stack>
          <Stack direction={'row'}>
            <InputLabel
              htmlFor="CODE_API_KEY"
              size="small"
              sx={{ fontSize: 10, width: '50%' }}
            >
              CODE_API_KEY
            </InputLabel>
            <Input
              id="CODE_API_KEY"
              type="password"
              value={localLLMConfig?.codeApiKey || ''}
              onChange={(e) =>
                setLocalLLMConfig({
                  ...localLLMConfig,
                  codeApiKey: e.target.value,
                })
              }
              fullWidth
              inputProps={inputProps}
            />
          </Stack>
          <Stack sx={{ pt: 2, pb: 2, spacing: 2 }}>
            <Divider />
            <Stack direction={'row'} sx={{ pt: 2 }}>
              <InputLabel
                htmlFor="COMMUNITY_URL"
                size="small"
                sx={{ fontSize: 10, width: '50%' }}
              >
                COMMUNITY_URL
              </InputLabel>
              <Input
                id="COMMUNITY_URL"
                value={communityURL || ''}
                onChange={(e) => setCommunityURL(e.target.value)}
                fullWidth
                inputProps={inputProps}
              />
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
