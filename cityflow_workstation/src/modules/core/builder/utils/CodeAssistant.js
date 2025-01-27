import ChatBot from '@/components/Chatbot';

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

  const systemPrompt =
    language === 'javascript'
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
- Provide example data to run and test the module, because input might be null before user run the whole flow.
- You don't need to worry about how to use the function, it's already implemented in the platform. If you code structure is correct, the platform will run your code automatically.
- Global variables and functions you can use:
      const {input,config,setConfig,setOutput} = props;
    - input: input data, e.g. input1 = input['input1']
    - config: module configuration value, e.g. title = config.title
    - setConfig: the function to set the configuration data, e.g. setConfig({title: title})
    - setOutput: the function to set the output data, e.g. setOutput({output1: output1})

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
    - cm.ouput: output data, e.g cm.output({'output': title})

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
    `;
  const context = `Current code: ${code}`;
  const greeding = `Hi, I'm code assistant! How can I help you today?`;

  return (
    <ChatBot
      name={config.title}
      assistantIcon={config.icon}
      systemPrompt={systemPrompt}
      context={context}
      height={height}
      sendCode={sendCode}
      greeding={greeding}
    />
  );
}
