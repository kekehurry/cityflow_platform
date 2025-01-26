import Assistant from '@/utils/assistant';
import {
  Stack,
  Typography,
  TextField,
  Button,
  Box,
  Slider,
  Divider,
  Card,
  Select,
  MenuItem,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import LLMInterface from './interface';
import { json } from 'd3';

export default function LLM(props) {
  const { input, config, setConfig, setOutput, run, loading, setLoading } =
    props;

  const [formValue, setFormValue] = useState({
    systemPrompt:
      config.systemPrompt ||
      'You are an advanced data processing assistant, capable of handling a variety of tasks related to the manipulation, analysis, and interpretation of data. ',
    outputInstruction:
      config.outputInstruction ||
      `You MUST output in a json object, for example: { "output" : "hello, how can I help you today?"}`,
    response_format: config.response_format || 'json_object',
    temperature: config.temperature || 0.8,
    maxTokens: config.maxTokens || 128,
    topK: config.topK || 50,
    seed: config.seed || 0,
  });

  const [llm, setLLM] = useState(
    new Assistant({
      systemPrompt: formValue.systemPrompt + '\n' + formValue.outputInstruction,
    })
  );

  const handleFormChange = (event) => {
    const { id, value } = event.target;
    setFormValue({
      ...config,
      [id]: value,
    });
  };

  const handleSubmit = () => {
    setConfig({
      ...config,
      ...formValue,
    });
    setLLM(
      new Assistant({
        systemPrompt:
          formValue.systemPrompt + '\n' + formValue.outputInstruction,
      })
    );
  };

  useEffect(() => {
    setConfig({
      ...config,
      interfaceComponent: <LLMInterface />,
    });
  }, []);

  useEffect(() => {
    if (!run || !input) {
      setOutput({ output: null });
    } else {
      setLoading(true);
      llm
        .chat(JSON.stringify(input))
        .then((res) => {
          console.log(res);
          if (formValue.response_format === 'json_object') {
            const jsonPattern = /\{(?:[^{}]*|(?:(?<=\{)[^{}]*(?=\})))*\}/;
            const match = res.match(jsonPattern);
            match
              ? setOutput({ output: match[0] })
              : setOutput({ output: res });
          } else {
            setOutput({ output: res });
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [run, input]);

  return (
    <Stack
      sx={{ width: '100%', height: '100%', overflow: 'auto', p: 1, mt: 1 }}
      spacing={2}
      className="nowheel nodrag"
    >
      <TextField
        id="systemPrompt"
        label="System Prompt"
        fullWidth
        multiline
        onChange={handleFormChange}
        value={formValue.systemPrompt}
        size="small"
        rows={6}
        InputProps={{ style: { fontSize: 12 } }}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        id="outputInstruction"
        label="Output Instruction"
        fullWidth
        multiline
        onChange={handleFormChange}
        value={formValue.outputInstruction}
        size="small"
        rows={6}
        InputProps={{ style: { fontSize: 12 } }}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Response Format"
        id="response_format"
        size="small"
        fullWidth
        select
        onChange={(e, value) =>
          handleFormChange({
            target: {
              id: 'response_format',
              value: e.target.value,
            },
          })
        }
        value={formValue.response_format}
        InputProps={{ style: { fontSize: 12 } }}
        InputLabelProps={{ shrink: true }}
      >
        <MenuItem value="json_object">json_object</MenuItem>
        <MenuItem value="text">text</MenuItem>
      </TextField>

      <Button variant="contained" onClick={handleSubmit}>
        Submit
      </Button>
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
            Temperature
          </Typography>
          <Slider
            value={formValue.temperature}
            onChange={handleFormChange}
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
            Max Tokens
          </Typography>
          <Slider
            value={formValue.maxTokens}
            onChange={handleFormChange}
            min={1}
            max={2048}
            step={1}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => value}
            size="small"
            id="maxTokens"
          />
        </Stack>

        <Stack direction={'row'} spacing={2}>
          <Typography variant="caption" width="50%">
            Top-k
          </Typography>
          <Slider
            value={formValue.topK}
            onChange={handleFormChange}
            min={1}
            max={100}
            step={1}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => value}
            size="small"
            id="topK"
          />
        </Stack>

        <Stack direction={'row'} spacing={2}>
          <Typography variant="caption" width="50%">
            Seed
          </Typography>
          <Slider
            value={formValue.seed}
            onChange={handleFormChange}
            min={0}
            max={1000}
            step={1}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => value}
            size="small"
            id="seed"
          />
        </Stack>
      </Box>
    </Stack>
  );
}
