import {
  Box,
  Button,
  TextField,
  Stack,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import React, { useState, useEffect, useRef } from 'react';
import { addNode, updateMeta } from '@/store/actions';
import { connect } from 'react-redux';
import { setupExecutor, check, killExecutor } from '@/utils/executor';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Assistant from '@/utils/assistant';
import { getLocalStorage, useLocalStorage } from '@/utils/local';
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
  const userName = getLocalStorage('USER_NAME');
  const localLLMConfig = getLocalStorage('LLM_CONFIG');
  const [defaultRunner, setDefaultRunner] = useLocalStorage(
    'DEFAULT_RUNNER',
    process.env.NEXT_PUBLIC_DEFAULT_RUNNER ||
      'ghcr.io/kekehurry/cityflow_runner:latest'
  );
  const [logOpen, setLogOpen] = useState(false);

  // sumbit workflow settings
  const hangleSubmit = async () => {
    setMeta({ ...formValue, loading: true });
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
    assistant.chat({inputMessage, messageHistory}).then((response) => {
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
    assistant.chat({inputMessage, messageHistory}).then((response) => {
      setFormValue({ ...formValue, tag: response });
      setLoading(false);
    });
  };

  useEffect(() => {
    if (!props.state?.flowId) return;
    setFormValue({
      flowId: props.state?.flowId || '',
      name: props.state?.name || '',
      description: props.state?.description || '',
      tag: props.state?.tag || '',
      city: props.state?.city || '',
      author: props.state?.author || userName || '',
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
    latestPropsRef.current = props;
  }, [props]);

  return (
    <Box id="FlowSettings" hidden={tab !== 0}>
      <Stack spacing={2} sx={{ mt: 0 }}>
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
