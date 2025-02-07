import {
  Box,
  Button,
  TextField,
  Stack,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
  Divider,
  Input,
  InputLabel,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import React, { useState, useEffect, useRef } from 'react';
import { addNode, updateMeta } from '@/store/actions';
import { connect } from 'react-redux';
import { setupExecutor, check, killExecutor } from '@/utils/executor';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Assistant from '@/utils/assistant';
import { useLocalStorage } from '@/utils/local';
import { initUserId } from '@/utils/local';
import theme from '@/theme';

import LogBoard from './LogBoard';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const mapStateToProps = (state, ownProps) => ({
  state: state,
  flowCodes: {
    name: state.name,
    description: state.description,
    city: state.city,
    author: state.author,
    tag: state.tag,
    nodes: state.nodes.map((node) => {
      return {
        id: node.id,
        config: {
          name: node.config?.name || '',
          author: node.config?.author || '',
          type: node.config?.type || '',
          category: node.config?.category || '',
          description: node.config?.description || '',
          input: node.config?.input || '',
          output: node.config?.output || '',
          code: node.config?.code || '',
          language: node.config?.language || '',
        },
      };
    }),
    edges: [...state.edges],
  },
  viewport: state.viewport,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  setNode: (node) => dispatch(addNode({ ...node })),
  setMeta: (meta) => dispatch(updateMeta(meta)),
});

const FlowSettings = (props) => {
  const { tab, setMeta } = props;
  const [formValue, setFormValue] = useState({});
  const latestPropsRef = useRef(props);
  const [loading, setLoading] = useState(false);
  const [author, setAuthor] = useLocalStorage('author', null);
  const [MAPBOX_TOKEN, setMapboxToken] = useLocalStorage('MAPBOX_TOKEN', '');
  const [codeCompletion, saveCodeCompletion] = useLocalStorage(
    'CODE_COMPLETION',
    'false'
  );
  const [localLLMConfig, setLocalLLMConfig] = useLocalStorage('LLM_CONFIG', {
    name: 'CityFlow',
    assistantIcon: `${basePath}/static/favicon.ico`,
    systemPrompt: `You are a helpful assistant for CityFlow Platform. You can help users to design, evaluate, and visualize urban solutions through Python and JavaScript modules and creating customized workflows.`,
    context: '',
    greeding: `What can I do for you?`,
    model: 'gpt-4o-mini',
    baseUrl: 'https://api.openai.com/v1',
    temperature: 0.8,
    maxTokens: 4192,
    presencePenalty: 0.0,
    frequencyPenalty: 0.0,
    responseFormat: 'text',
    apiKey: '',
  });
  const [defaultRunner, setDefaultRunner] = useLocalStorage(
    'DEFAULT_RUNNER',
    process.env.NEXT_PUBLIC_DEFAULT_RUNNER || 'cityflow/cityflow-runner:light'
  );
  const [logOpen, setLogOpen] = useState(false);
  const [autoCompletion, setAutoCompletion] = useState(true);
  const accordionRef = useRef(null);

  const inputProps = {
    style: {
      background: 'none',
      color: 'text.secondary',
      border: 'none',
      borderBottom: `1px solid text.secondary`,
    },
  };

  // sumbit workflow settings
  const hangleSubmit = async () => {
    setMeta({ ...formValue, loading: true });
    setAuthor(formValue.author);
    setDefaultRunner(formValue.image);
    const logs = [];
    if (props.state?.isAlive) {
      await killExecutor(formValue.flowId);
      setMeta({ logs: null, loading: false });
    } else {
      setLogOpen(true);
      for await (const chunk of await setupExecutor(
        formValue.flowId,
        formValue.packages,
        formValue.image
      )) {
        logs.push(chunk);
        setMeta({ logs: logs.slice(-20).join('') });
      }
    }
    check(formValue.flowId).then((data) => {
      setLogOpen(false);
      setMeta({ loading: false });
    });
  };

  const handleFormChange = (event) => {
    const { id, value } = event.target;
    setFormValue({
      ...formValue,
      [id]: value,
    });
  };

  const explainWorkflow = () => {
    const systemPrompt = `You are a helpful assistant who can help human explain a worflow consisting of a series of nodes and edges. Each node is a code block, and the edges indicate the data flow between the code blocks. Your task is to provide a brief description of the workflow in one sentence based on the code and the description of nodes.`;
    const context = `workflow: ${JSON.stringify(props.flowCodes)}`;
    const assistant = new Assistant({
      ...localLLMConfig,
      systemPrompt,
      context,
    });
    const inputMessage = 'briefly describe this workflow in one sentence';
    const messageHistory = [
      {
        role: 'AI',
        message: "Hi, I'm your assistant! How can I help you today?",
      },
    ];
    setLoading(true);
    assistant.chat(inputMessage, messageHistory).then((response) => {
      setFormValue({ ...formValue, description: response });
      setLoading(false);
    });
  };

  const tagWorkflow = () => {
    const systemPrompt = `You are a helpful assistant who can help human tag a worflow consisting of a series of nodes and edges. Each node is a code block, and the edges indicate the data flow between the code blocks. Your task is to provide tags for the workflow in several keywords based on the code and the description of nodes. Tags should related to city problems and solutions.
    Output with no more than 5 words, separated by comma. 
    **No explanation or other information needed.**`;
    const context = `workflow: ${JSON.stringify(props.flowCodes)}`;
    const assistant = new Assistant({
      ...localLLMConfig,
      systemPrompt,
      context,
    });
    const inputMessage =
      'tag this workflow with several keywords, separated by comma';
    const messageHistory = [
      {
        role: 'AI',
        message: "Hi, I'm your assistant! How can I help you today?",
      },
    ];
    setLoading(true);
    assistant.chat(inputMessage, messageHistory).then((response) => {
      setFormValue({ ...formValue, tag: response });
      setLoading(false);
    });
  };

  const handleAccordionChange = (event, expanded) => {
    const parentContainer = accordionRef.current?.parentElement;
    setTimeout(() => {
      parentContainer.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }, 100);
  };

  useEffect(() => {
    if (!props.state?.flowId) return;
    initUserId().then((userId) => {
      author || setAuthor(`user_${userId.slice(0, 4)}`);
    });
    setFormValue({
      flowId: props.state?.flowId || '',
      name: props.state?.name || '',
      description: props.state?.description || '',
      tag: props.state?.tag || '',
      city: props.state?.city || '',
      author: author || '',
      image: props.state?.image || defaultRunner,
      packages: props.state?.packages || '',
    });
  }, [props.state?.flowId]);

  useEffect(() => {
    if (!formValue.flowId) return;
    const isAlive = setInterval(() => {
      check(formValue.flowId).then((data) => {
        if (props.state?.isAlive != data?.alive) {
          setMeta({ isAlive: data?.alive });
        }
      });
    }, 1000);
    return () => {
      clearInterval(isAlive);
    };
  }, [formValue.flowId, props.state?.isAlive]);

  useEffect(() => {
    setAutoCompletion(codeCompletion === 'true');
  }, []);

  useEffect(() => {
    latestPropsRef.current = props;
  }, [props]);

  return (
    <Box id="FlowSettings" hidden={tab !== 0}>
      <Stack spacing={2} sx={{ mt: 0 }}>
        {/* <TextField
              label="flowId"
              id="flowId"
              value={formValue?.flowId || ''}
              disabled
            /> */}
        <TextField
          label="name"
          id="name"
          value={formValue?.name || ''}
          onChange={handleFormChange}
          placeholder="what is the name of your workflow?"
          InputLabelProps={{ shrink: true }}
        />
        <Stack>
          <Stack direction="row" spacing={2} justifyContent="space-between">
            <TextField
              fullWidth
              label="city"
              id="city"
              value={formValue?.city || ''}
              onChange={handleFormChange}
              placeholder="which city is this workflow related to?"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="author"
              id="author"
              placeholder="user name"
              value={formValue?.author || ''}
              onChange={handleFormChange}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </Stack>
        <Box sx={{ position: 'relative' }}>
          <TextField
            id="description"
            fullWidth
            label="description"
            onChange={handleFormChange}
            value={formValue?.description || ''}
            multiline
            rows={3}
            placeholder="breifly describe your workflow"
            InputLabelProps={{ shrink: true }}
          ></TextField>
          <Tooltip title="AI Summary" placement="top" arrow>
            <IconButton
              onClick={explainWorkflow}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 1,
              }}
            >
              <AutoAwesomeIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ position: 'relative' }}>
          <TextField
            id="tag"
            fullWidth
            label="tag"
            onChange={handleFormChange}
            value={formValue?.tag || ''}
            placeholder="tag your workflow"
            InputLabelProps={{ shrink: true }}
          ></TextField>
          <Tooltip title="AI Summary" placement="top" arrow>
            <IconButton
              onClick={tagWorkflow}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 1,
              }}
            >
              <AutoAwesomeIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <TextField
          id="image"
          fullWidth
          label="image"
          value={formValue?.image || ''}
          onChange={handleFormChange}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          id="packages"
          label="packages"
          fullWidth
          onChange={handleFormChange}
          value={formValue?.packages}
          multiline
          rows={5}
          placeholder={`conda:
  - package1
  - package2
npm:
  - package1
  - package2
pip:
  - package1
  - package2
channels:
  - conda-forge
  - defaults`}
          InputLabelProps={{ shrink: true }}
        />
        <LoadingButton
          loading={props.state.loading || loading}
          variant="contained"
          color="primary"
          onClick={hangleSubmit}
        >
          <Typography sx={{ fontWeight: 'bold', fontSize: 12 }}>
            {props.state.isAlive ? 'Stop Runner' : 'Init Environment'}
          </Typography>
        </LoadingButton>
        <Button
          fullWidth
          variant="contained"
          sx={{
            background: theme.palette.secondary.gray,
          }}
          onClick={() => {
            setLogOpen(true);
          }}
        >
          <Typography
            sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: 12 }}
          >
            Open Terminal
          </Typography>
        </Button>
        <Accordion
          sx={{ border: '0px', background: 'none' }}
          variant="outlined"
          disableGutters
          slotProps={{ transition: { timeout: { enter: 100, exit: 500 } } }}
          onChange={handleAccordionChange}
        >
          <AccordionSummary sx={{ m: 0, p: 0, color: 'text.secondary' }}>
            Advance Settings
          </AccordionSummary>
          <AccordionDetails sx={{ m: 0, p: 0, height: '550px' }}>
            <Stack spacing={2}>
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
            </Stack>
            <div ref={accordionRef}></div>
          </AccordionDetails>
        </Accordion>
        <LogBoard
          flowId={formValue.flowId}
          logOpen={logOpen}
          setLogOpen={setLogOpen}
          isAlive={props.state?.isAlive}
          logs={props.state?.logs}
        />
      </Stack>
    </Box>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(FlowSettings);
