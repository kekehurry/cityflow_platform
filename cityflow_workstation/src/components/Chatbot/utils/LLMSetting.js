import Assistant from '@/utils/assistant';
import {
  Stack,
  Typography,
  TextField,
  Button,
  Box,
  Slider,
  Divider,
  MenuItem,
} from '@mui/material';
import React, { useState } from 'react';

export default function LLMSetting({
  setAssistant,
  llmConfig,
  setLLMConfig,
  setShowConfig,
}) {
  const [formValue, setFormValue] = useState({
    systemPrompt:
      llmConfig.systemPrompt ||
      'You are an advanced data processing assistant, capable of handling a variety of tasks related to the manipulation, analysis, and interpretation of data.',
    responseFormat: llmConfig.responseFormat || 'text',
    temperature: llmConfig.temperature || 0.8,
    maxTokens: llmConfig.maxTokens || 4096,
    presencePenalty: llmConfig.presencePenalty || 0.0,
    frequencyPenalty: llmConfig.frequencyPenalty || 0.0,
    model: llmConfig.model || 'gpt-4o-mini',
    baseUrl: llmConfig.baseUrl || 'https://api.openai.com/v1',
  });

  const handleFormChange = (event) => {
    const { id, value } = event.target;
    setFormValue({
      ...formValue,
      [id]: value,
    });
  };

  const handleSubmit = () => {
    setAssistant(new Assistant(formValue));
    setLLMConfig({ ...llmConfig, ...formValue });
    setShowConfig && setShowConfig(false);
  };

  return (
    <Stack
      sx={{
        width: '100%',
        height: '100%',
        overflow: 'auto',
        p: 1,
        pt: 4,
      }}
      spacing={2}
      className="nowheel nodrag"
    >
      <TextField
        id="baseUrl"
        label="Base URL"
        fullWidth
        onChange={handleFormChange}
        value={formValue.baseUrl}
        size="small"
        InputProps={{ style: { fontSize: 12 } }}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        id="model"
        label="Model"
        fullWidth
        multiline
        onChange={handleFormChange}
        value={formValue.model}
        size="small"
        InputProps={{ style: { fontSize: 12 } }}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        id="systemPrompt"
        label="System Prompt"
        fullWidth
        multiline
        onChange={handleFormChange}
        value={formValue.systemPrompt}
        size="small"
        rows={11}
        InputProps={{ style: { fontSize: 12 } }}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Response Format"
        id="responseFormat"
        size="small"
        fullWidth
        select
        onChange={(e, value) =>
          handleFormChange({
            target: {
              id: 'responseFormat',
              value: e.target.value,
            },
          })
        }
        value={formValue.responseFormat}
        InputProps={{ style: { fontSize: 12 } }}
        InputLabelProps={{ shrink: true }}
      >
        <MenuItem value="json_object">json_object</MenuItem>
        <MenuItem value="text">text</MenuItem>
      </TextField>
      <TextField
        id="maxTokens"
        label="max_tokens"
        fullWidth
        onChange={handleFormChange}
        value={formValue.maxTokens}
        size="small"
        InputProps={{ style: { fontSize: 12 } }}
        InputLabelProps={{ shrink: true }}
      />

      <Button variant="contained" onClick={handleSubmit}>
        Submit
      </Button>

      <Stack spacing={1.5}>
        <Divider />
        <Box
          variant="outlined"
          sx={{
            p: 2,
            overflow: 'autho',
            borderRadius: 1,
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack direction={'row'} spacing={2}>
            <Typography variant="caption" width="50%">
              temperature
            </Typography>
            <Slider
              value={formValue.temperature}
              onChange={(e) => {
                handleFormChange({
                  target: {
                    id: 'temperature',
                    value: e.target.value,
                  },
                });
              }}
              min={0}
              max={1}
              step={0.01}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value.toFixed(2)}`}
              size="small"
              id="temperature"
            />
          </Stack>
          <Stack direction={'row'} spacing={2}>
            <Typography variant="caption" width="50%">
              frequency_penalty
            </Typography>
            <Slider
              value={formValue.frequencyPenalty}
              onChange={(e) => {
                handleFormChange({
                  target: {
                    id: 'frequencyPenalty',
                    value: e.target.value,
                  },
                });
              }}
              min={-2}
              max={2}
              step={0.1}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => value}
              size="small"
              id="frequencyPenalty"
            />
          </Stack>

          <Stack direction={'row'} spacing={2}>
            <Typography variant="caption" width="50%">
              presence_penalty
            </Typography>
            <Slider
              value={formValue.presencePenalty}
              onChange={(e) => {
                handleFormChange({
                  target: {
                    id: 'presencePenalty',
                    value: e.target.value,
                  },
                });
              }}
              min={-2}
              max={2}
              step={0.1}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => value}
              size="small"
              id="presencePenalty"
            />
          </Stack>
        </Box>
      </Stack>
    </Stack>
  );
}
