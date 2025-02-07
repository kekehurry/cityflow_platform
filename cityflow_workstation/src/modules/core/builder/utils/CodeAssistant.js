import ChatBot from '@/components/Chatbot';
import { getLocalStorage } from '@/utils/local';
import { useState, useEffect } from 'react';
import Assistant from '@/utils/assistant';
import { debounce } from 'lodash';

export default function CodeAssistant(props) {
  const {
    language,
    editor,
    formValue,
    setFormValue,
    config,
    setConfig,
    height,
  } = props;

  const sendCode = (code) => {
    const newCode =
      editor < formValue.code.length
        ? formValue.code.map((item, index) => (index === editor ? code : item))
        : [...formValue.code, code];
    setFormValue({
      ...formValue,
      code: newCode,
    });
  };
  const [llmConfig, setLLMConfig] = useState(null);

  const localLLMConfig = getLocalStorage('LLM_CONFIG');

  useEffect(() => {
    setLLMConfig({
      ...localLLMConfig,
      systemPrompt:
        config.llmConfig?.model ||
        (language === 'javascript'
          ? `
  You are a helpful assistant for CityFlow Platform, who can help human create a module using javascript. 

  Moduel Information:
  - title: ${formValue.title}
  - description: ${formValue.description}
  - input_keys: ${formValue.input}
  - output_keys: ${formValue.output}
  - width: ${formValue.width}
  - height: ${formValue.height}

  Note:
  - Make sure you wrap the code in the code block like \`\`\`javascript \`\`\`.
  - You can only use one file to implement the module. And only export one default function.
  - The first line must be the filename, e.g. //entrypoint.js
  - Ensuring the module fuction returns a valid UI element for the platform to render.
  - Provide example data to run and test the module, because input might be null before user run the whole flow.
  - You don't need to worry about how to use the function, it's already implemented in the platform. If you code structure is correct, the platform will run your code automatically.
  - Global variables and functions you can use:
        const {input,config,setConfig,setOutput} = props;
      - input: input data, e.g. input1 = input['input1']
      - config: module configuration value, e.g. title = config.title
      - setConfig: the function setting the configuration for this module, e.g. setConfig({var1: var1})
      - setOutput: the function setting the output data for the next module, e.g. setOutput({output1: output1})

  Example:
  \`\`\`javascript
  //entrypoint.js

  import {useState} from 'react';

  // main function
  export default function ModuleTitle(props){

      const {input,config,setConfig,setOutput} = props;
      return (<div style={{textAlign:"center"}}>
      <h1>{config.title}</h1>
      </div>)
  }
  \`\`\
  `
          : `
      You are a helpful assistant for CityFlow Platform, who can help human create a module using python.

      Moduel Information:
      - title: ${formValue.title}
      - description: ${formValue.description}
      - input_keys: ${formValue.input}
      - output_keys: ${formValue.output}

      Note:
      - You can only use one file to implement the module. 
      - The fist line must be the filename, e.g. #entrypoint.py
      - Focus on the code logic, and construct the output. You don't need to worry about how to use the function, it's already implemented in the platform. If you code structure is correct, the platform will run your code automatically.
      - When you write the code, make sure you wrap the python code in the python code block like \`\`\`python \`\`\`**.

      Global variables and functions you can use directly:
      - import cityflow.module as cm
      - cm.input: input data, e.g. input1 = cm.input['input1']
      - cm.config: module configuration value, e.g. title = cm.config['title']
      - cm.ouput: output data for next module, e.g cm.output({'output': title})

      Example:
      \`\`\`python
      #entrypoint.py

      import cityflow.module as cm

      def main():
          return {
                  "output": cm.config["title"]
              }

      #Set the output
      cm.output = main(input_data)
      \`\`\`
      `),
      context: `Current code: ${formValue.code[editor]}`,
      greeding: `Hi, I'm code assistant! How can I help you today?`,
      model: config.llmConfig?.model || localLLMConfig?.model || 'gpt-4o-mini',
      assistantIcon:
        config?.icon || localLLMConfig?.code || '/static/cflogo_black.png',
    });
  }, [config, formValue, editor, language]);

  const updateLLMConfig = (newConfig) => {
    setConfig({ ...config, llmConfig: newConfig });
  };

  return (
    llmConfig && (
      <ChatBot
        llmConfig={llmConfig}
        setLLMConfig={updateLLMConfig}
        height={height}
        sendCode={sendCode}
      />
    )
  );
}

export function registerLLMCompletions(
  monaco,
  language,
  setLoading = null,
  setStatus = null
) {
  const localLLMConfig = getLocalStorage('LLM_CONFIG');
  const llmConfig = {
    ...localLLMConfig,
    systemPrompt: `You are a code completion assistant integrated with Monaco Editor. Your primary task is to provide accurate, context-aware suggestions for completing code, ensuring correctness, and optimizing the user’s coding experience. 
        Complete the current line, your output MUST be a JSON object with the following format:
        {"suggestions": 
        [
          { "label": "suggestion1", "insertText": "suggestion1" },
          { "label": "suggestion2", "insertText": "suggestion2" }
        ]
        }
        `,
    maxTokens: 200,
    context: '',
    responseFormat: 'json_object',
    baseUrl: localLLMConfig?.codeBaseUrl || localLLMConfig?.baseUrl,
    model: localLLMConfig?.codeModel || localLLMConfig?.model,
    apiKey: localLLMConfig?.codeApiKey || localLLMConfig?.apiKey,
  };
  const assistant = new Assistant(llmConfig);

  // fetchCodeSuggestions
  const fetchCodeSuggestions = debounce(async (code, language, currentLine) => {
    let response;
    try {
      setLoading && setLoading(true);
      response = await assistant.chat(
        `
          Provide code suggestions based on the following information:
          Language: ${language}
          Code: ${code}
          Current Line: ${currentLine}
          `
      );
      setLoading && setLoading(false);
      const result = JSON.parse(response);
      return result.suggestions;
    } catch (e) {
      setStatus && setStatus('Error');
      return [{ label: 'Error', insertText: `Error: ${e.message}` }];
    }
  }, 500);

  return monaco.languages.registerInlineCompletionsProvider(language, {
    provideInlineCompletions: async (model, position) => {
      try {
        const currentLine = model.getLineContent(position.lineNumber);
        const code = model.getValue();
        const suggestions = await fetchCodeSuggestions(
          code,
          language,
          currentLine
        );
        return {
          items: suggestions
            ? suggestions.map((suggestion) => ({
                label: suggestion.label,
                insertText: suggestion.insertText,
                kind: monaco.languages.CompletionItemKind.Text,
                range: new monaco.Range(
                  position.lineNumber,
                  position.column,
                  position.lineNumber,
                  model.getLineMaxColumn(position.lineNumber)
                ),
              }))
            : [],
          dispose: () => {},
        };
      } catch (e) {
        setStatus && setStatus(`Error`);
        return {
          label: 'Error',
          insertText: e.message || 'Error',
          kind: monaco.languages.CompletionItemKind.Text,
          range: new monaco.Range(
            position.lineNumber,
            position.column,
            position.lineNumber,
            model.getLineMaxColumn(position.lineNumber)
          ),
          dispose: () => {},
        };
      } finally {
        setLoading && setLoading(false);
      }
    },
    freeInlineCompletions: () => {},
    triggerCharacters: [
      '.',
      '(',
      ':',
      '=',
      '+',
      '-',
      ';',
      '"',
      "'",
      '{',
      '}',
      '[',
      '<',
    ],
  });
}
