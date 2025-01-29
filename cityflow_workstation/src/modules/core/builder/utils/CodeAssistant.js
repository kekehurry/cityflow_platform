import ChatBot from '@/components/Chatbot';
import { getLocalStorage } from '@/utils/local';

export default function CodeAssistant(props) {
  const {
    language,
    code,
    editorTab,
    formValue,
    setFormValue,
    config,
    setConfig,
    height,
  } = props;

  const sendCode = (code) => {
    setFormValue({
      ...formValue,
      code: {
        ...formValue.code,
        [editorTab]: code,
      },
    });
  };

  const localLLMConfig = getLocalStorage('LLM_CONFIG');

  const llmConfig = {
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
//import packages
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
    - Focus on the code logic, and construct the output. You don't need to worry about how to use the function, it's already implemented in the platform. If you code structure is correct, the platform will run your code automatically.
    - When you write the code, make sure you wrap the python code in the python code block like \`\`\`python \`\`\`**.

    Global variables and functions you can use directly:
    - import cityflow.module as cm
    - cm.input: input data, e.g. input1 = cm.input['input1']
    - cm.config: module configuration value, e.g. title = cm.config['title']
    - cm.ouput: output data for next module, e.g cm.output({'output': title})

    Example:
    \`\`\`python
    import cityflow.module as cm

    def main():
        return {
                "output": cm.config["title"]
            }

    #Set the output
    cm.output = main(input_data)
    \`\`\`
    `),
    context: `Current code: ${code}`,
    greeding: `Hi, I'm code assistant! How can I help you today?`,
    model: config.llmConfig?.model || localLLMConfig?.model || 'gpt-4o-mini',
  };

  const setLLMConfig = (newConfig) => {
    setConfig({ ...config, llmConfig: newConfig });
  };

  return (
    <ChatBot
      llmConfig={llmConfig}
      setLLMConfig={setLLMConfig}
      height={height}
      sendCode={sendCode}
    />
  );
}
