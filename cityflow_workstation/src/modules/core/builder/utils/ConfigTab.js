import {
  Box,
  Chip,
  Typography,
  Stack,
  TextField,
  MenuItem,
  FormControl,
  Select,
  IconButton,
  Tooltip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LoadingButton from '@mui/lab/LoadingButton';
import { useState } from 'react';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Assistant from '@/utils/assistant';

export default function ConfigTab({
  code,
  language,
  formValue,
  setFormValue,
  config,
  setConfig,
  mapPackages,
  height = 540,
}) {
  const [iconLoading, setIconLoading] = useState(false);

  const handleIconChange = (event) => {
    setIconLoading(true);
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      setConfig({ ...config, icon: e.target.result });
      setIconLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFormChange = (event) => {
    const { id, value } = event.target;
    setFormValue({
      ...formValue,
      [id]:
        id === 'input' || id === 'output'
          ? value.split(',')
          : id === 'width' || id === 'height' || id === 'port'
          ? parseInt(value)
          : value,
    });
  };

  const explainCode = () => {
    const systemPrompt = `You are a helpful assistant who can help human explain a module writting in ${language}. When provide your code for a module, Your should briefly describe the function of this module in one sentence. Start with 'This module ...'`;
    const context = `Current code: ${code}`;
    const assistant = new Assistant({
      systemPrompt,
      context,
    });
    const inputMessage = 'briefly describe this code in one sentence';
    const messageHistory = [
      {
        role: 'AI',
        message: "Hi, I'm your assistant! How can I help you today?",
      },
    ];

    assistant.chat(inputMessage, messageHistory).then((response) => {
      setFormValue({ ...formValue, description: response });
    });
  };

  // const types = ['interface', 'module', 'server'];
  const types = ['interface', 'module'];
  return (
    <Stack spacing={0.5} sx={{ height: height, overflow: 'auto' }}>
      <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
        <FormControl sx={{ width: '100%' }}>
          <Typography variant="caption">Type</Typography>
          <Select
            id="type"
            sx={{ fontSize: 8, height: 30, minHeight: 0 }}
            renderValue={() => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                <Chip
                  key={formValue.type}
                  label={formValue.type}
                  style={{
                    height: 20,
                    fontSize: 8,
                    p: 1,
                  }}
                />
              </Box>
            )}
            value={formValue.type}
            onChange={(e) => {
              handleFormChange({
                target: { id: 'type', value: e.target.value },
              });
            }}
          >
            {types.map((p) => (
              <MenuItem key={p} value={p}>
                {p}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Stack sx={{ width: '100%' }}>
          <Typography variant="caption">IconURL</Typography>
          <LoadingButton
            sx={{
              fontSize: 8,
              width: '100%',
              height: 30,
              color: 'gray',
              borderColor: 'gray',
            }}
            loading={iconLoading}
            component="label"
            variant="outlined"
            fullWidth
            startIcon={<CloudUploadIcon />}
          >
            <input
              type="file"
              onChange={handleIconChange}
              style={{
                clip: 'rect(0 0 0 0)',
                clipPath: 'inset(50%)',
                height: 1,
                overflow: 'hidden',
                position: 'absolute',
                bottom: 0,
                left: 0,
                whiteSpace: 'nowrap',
                width: 1,
              }}
              accept=".png,.jpg"
            />
            <Typography variant="caption" sx={{ ontSize: 8 }}>
              Upload Icon
            </Typography>
          </LoadingButton>
        </Stack>
      </Stack>
      <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
        <Stack sx={{ width: '100%' }}>
          <Typography variant="caption">Category</Typography>
          <TextField
            id="category"
            fullWidth
            onChange={handleFormChange}
            value={formValue.category || ''}
            size="small"
            InputProps={{ style: { fontSize: 8 } }}
          />
        </Stack>
        <Stack sx={{ width: '100%' }}>
          <Typography variant="caption">Module Name</Typography>
          <TextField
            id="name"
            fullWidth
            onChange={handleFormChange}
            value={formValue.name || 'Custom Module'}
            size="small"
            InputProps={{ style: { fontSize: 8 } }}
          />
        </Stack>
        <Stack sx={{ width: '100%' }}>
          <Typography variant="caption">Author</Typography>
          <TextField
            id="author"
            size="small"
            onChange={handleFormChange}
            value={formValue.author || ''}
            InputProps={{ style: { fontSize: 8 } }}
          />
        </Stack>
      </Stack>
      <Stack
        direction="row"
        sx={{ width: '100%', justifyContent: 'space-between' }}
      >
        <Typography variant="caption">Description</Typography>
        <Tooltip title="AI Summary" placement="top" arrow>
          <IconButton
            size="small"
            sx={{ width: 20, height: 20 }}
            onClick={explainCode}
          >
            <AutoAwesomeIcon sx={{ width: 10, height: 10 }} />
          </IconButton>
        </Tooltip>
      </Stack>
      <TextField
        id="description"
        multiline
        rows={2}
        onChange={handleFormChange}
        value={formValue.description || ''}
        size="small"
        InputProps={{ style: { fontSize: 8 } }}
      />
      <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
        <Stack sx={{ width: '100%' }}>
          <Typography variant="caption">Input</Typography>
          <TextField
            id="input"
            onChange={handleFormChange}
            value={formValue.input || ['input']}
            size="small"
            InputProps={{ style: { fontSize: 8 } }}
          />
        </Stack>
        <Stack sx={{ width: '100%' }}>
          <Typography variant="caption">Output</Typography>
          <TextField
            id="output"
            onChange={handleFormChange}
            value={formValue.output || ['output']}
            size="small"
            InputProps={{ style: { fontSize: 8 } }}
          />
        </Stack>
      </Stack>
      <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
        <Stack sx={{ width: '100%' }}>
          <Typography variant="caption">Width</Typography>
          <TextField
            id="width"
            onChange={handleFormChange}
            value={formValue.width || 300}
            size="small"
            InputProps={{ style: { fontSize: 8 } }}
          />
        </Stack>
        <Stack sx={{ width: '100%' }}>
          <Typography variant="caption">Height</Typography>
          <TextField
            id="height"
            onChange={handleFormChange}
            value={formValue.height || 200}
            size="small"
            InputProps={{ style: { fontSize: 8 } }}
          />
        </Stack>
      </Stack>
      {/* <Typography variant="caption">Session ID</Typography>
      <TextField
        id="sessionID"
        onChange={handleFormChange}
        value={formValue.sessionID || ''}
        size="small"
        InputProps={{ style: { fontSize: 8 } }}
      /> */}

      {/* <Typography variant="caption">Assistant</Typography> */}
      {/* <Stack direction="row" spacing={1} justifyContent="space-between">
        <TextField
          id="baseUrl"
          fullWidth
          onChange={handleFormChange}
          value={formValue.baseUrl}
          label="Base Url"
          size="small"
          InputProps={{ style: { fontSize: 8 } }}
          InputLabelProps={{ style: { fontSize: 8 } }}
        />
        <TextField
          id="secretKey"
          fullWidth
          onChange={handleFormChange}
          value={formValue.secretKey}
          label="Secret Key"
          size="small"
          InputProps={{ style: { fontSize: 8 } }}
          InputLabelProps={{ style: { fontSize: 8 } }}
        />
        <TextField
          id="model"
          fullWidth
          onChange={handleFormChange}
          value={formValue.model}
          label="Model"
          size="small"
          InputProps={{ style: { fontSize: 8 } }}
          InputLabelProps={{ style: { fontSize: 8 } }}
        />
      </Stack> */}
      {formValue.language === 'javascript' && (
        <>
          <Typography variant="caption">Packages</Typography>
          <FormControl>
            <Select
              id="packages"
              sx={{ fontSize: 8 }}
              multiple
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={value}
                      style={{
                        height: 20,
                        fontSize: 8,
                        p: 1,
                      }}
                    />
                  ))}
                </Box>
              )}
              value={formValue.packages}
              onChange={(e) => {
                handleFormChange({
                  target: { id: 'packages', value: e.target.value },
                });
              }}
            >
              {Object.keys(mapPackages).map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </>
      )}
    </Stack>
  );
}
