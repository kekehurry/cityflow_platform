import {
  Box,
  TextField,
  Stack,
  Typography,
  IconButton,
  MenuItem,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import React, { useState, useEffect, useRef } from 'react';
import { addNode, updateMeta } from '@/store/actions';
import { connect } from 'react-redux';
import { setupExecutor } from '@/utils/executor';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Assistant from '@/utils/assistant';
import { useLocalStorage } from '@/utils/local';
import { initUserId } from '@/utils/local';

const defaultRunner = process.env.NEXT_PUBLIC_DEFAULT_RUNNER;

const mapStateToProps = (state, ownProps) => ({
  state: state,
  flowCodes: {
    ...state,
    data: null,
    nodes: state.nodes.map((node) => {
      return {
        ...node,
        icon: null,
        data: {
          ...node.data,
          input: null,
          output: null,
        },
        config: {
          ...node.config,
          files: [],
          scope: {},
          run: false,
        },
      };
    }),
    edges: [...state.edges],
    screenShot: null,
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
  const [initLog, setInitLog] = useState('');
  const [author, setAuthor] = useLocalStorage('author', null);
  const [LLM_BASE_URL, setLLMBaseUrl] = useLocalStorage(
    'LLM_BASE_URL',
    'https://api.openai.com/v1'
  );
  const [LLM_MODEL, setLLMModel] = useLocalStorage('LLM_MODEL', 'gpt-4o-mini');
  const [LLM_API_KEY, setLLLMAPIKey] = useLocalStorage('LLM_API_KEY', '');
  const [MAPBOX_TOKEN, setMapboxToken] = useLocalStorage('MAPBOX_TOKEN', '');

  // set flowInited
  const setFlowInited = (value) => {
    setMeta({ flowInited: value });
  };

  // sumbit workflow settings
  const hangleSubmit = () => {
    setMeta(formValue);
    setFlowInited(false);
    setAuthor(formValue.author);
    setLoading(true);
    const packages = formValue.packages.split('\n');
    setInitLog('initing environment...');
    setupExecutor(formValue.flowId, packages, formValue.image)
      .then((data) => {
        setInitLog(data?.console);
        setFlowInited(true);
      })
      .finally(() => {
        setLoading(false);
        setInitLog('');
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

  useEffect(() => {
    initUserId().then((userId) => {
      author || setAuthor(`user_${userId.slice(0, 4)}`);
    });
    setFormValue({
      flowId: props.state?.flowId || '',
      name: props.state?.name || '',
      description: props.state?.description || '',
      tag: props.state?.tag || '',
      city: props.state?.city || '',
      author: author,
      image: props.state?.image,
      packages: props.state?.packages || '',
    });
  }, [props.state?.flowId]);

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
            rows={4}
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
          select
          id="image"
          fullWidth
          label="image"
          value={defaultRunner}
          onChange={(e) => {
            handleFormChange({
              target: { id: 'image', value: e.target.value },
            });
          }}
          InputLabelProps={{ shrink: true }}
        >
          <MenuItem value={defaultRunner}>{defaultRunner}</MenuItem>
        </TextField>
        <Accordion
          sx={{ border: '0px', background: 'none' }}
          variant="outlined"
          disableGutters
        >
          <AccordionSummary sx={{ m: 0, p: 0, color: 'text.secondary' }}>
            Secrets (these secrets only save locally)
          </AccordionSummary>
          <AccordionDetails sx={{ m: 0, p: 0 }}>
            <Stack spacing={2}>
              <Divider />
              <TextField
                fullWidth
                variant="standard"
                label="LLM_BASE_URL"
                id="LLM_BASE_URL"
                value={LLM_BASE_URL}
                onChange={(e) => setLLMBaseUrl(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                variant="standard"
                label="LLM_MODEL"
                id="LLM_MODEL"
                value={LLM_MODEL}
                onChange={(e) => setLLMModel(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                variant="standard"
                label="LLM_API_KEY"
                id="LLM_API_KEY"
                value={LLM_API_KEY}
                onChange={(e) => setLLLMAPIKey(e.target.value)}
                InputLabelProps={{ shrink: true }}
                type="password"
              />
              <TextField
                fullWidth
                variant="standard"
                label="MAPBOX_TOEKN"
                id="MAPBOX_TOEKN"
                value={MAPBOX_TOKEN}
                onChange={(e) => setMapboxToken(e.target.value)}
                InputLabelProps={{ shrink: true }}
                type="password"
              />
              <Divider />
            </Stack>
          </AccordionDetails>
        </Accordion>
        <LoadingButton
          loading={loading}
          variant="contained"
          color="primary"
          onClick={hangleSubmit}
        >
          Init Environment
        </LoadingButton>
        <Typography variant="caption">{initLog}</Typography>
      </Stack>
    </Box>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(FlowSettings);
