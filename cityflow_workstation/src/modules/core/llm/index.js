import Assistant from '@/utils/assistant';
import React, { useState, useEffect } from 'react';
import LLMInterface from './interface';
import LLMSetting from '@/components/Chatbot/utils/LLMSetting';
import { useReactFlow } from 'reactflow';
import { getLocalStorage } from '@/utils/local';

export default function LLM(props) {
  const {
    input,
    config,
    setConfig,
    setOutput,
    run,
    loading,
    setLoading,
    position,
    expand,
    updateInterface,
  } = props;

  const { setCenter } = useReactFlow();
  const localLLMConfig = getLocalStorage('LLM_CONFIG');
  const [formValue, setFormValue] = useState({
    baseUrl:
      config.baseUrl || localLLMConfig?.baseUrl || 'https://api.openai.com/v1',
    model: config.model || localLLMConfig?.model || 'gpt-4o-mini',
    systemPrompt:
      config.systemPrompt ||
      `You are an advanced data processing assistant, capable of handling a variety of tasks related to the manipulation, analysis, and interpretation of data. 
      You MUST output in a json object, for example: { "output" : "hello, how can I help you today?"}
      `,
    responseFormat: config.responseFormat || 'json_object',
    temperature: config.temperature || 0.8,
    maxTokens: config.maxTokens || 4096,
    presencePenalty: config.presencePenalty || 0.0,
    frequencyPenalty: config.frequencyPenalty || 0.0,
  });

  const [assistant, setAssistant] = useState(new Assistant(formValue));

  // expand
  useEffect(() => {
    expand &&
      setCenter(position.x + 70, position.y + 30, {
        duration: 1000,
        zoom: 1,
      });
  }, [expand]);

  // update config
  useEffect(() => {
    setConfig({
      ...config,
      ...formValue,
    });
  }, [formValue]);

  useEffect(() => {
    updateInterface(<LLMInterface />);
  }, []);

  useEffect(() => {
    if (!run || !input) {
      setOutput({ output: null });
    } else {
      setLoading(true);
      assistant
        .chat(input.input)
        .then((res) => {
          if (res && formValue.responseFormat === 'json_object') {
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
    <LLMSetting
      setAssistant={setAssistant}
      llmConfig={formValue}
      setLLMConfig={setFormValue}
    />
  );
}
