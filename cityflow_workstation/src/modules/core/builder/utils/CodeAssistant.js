import Assistant from '@/utils/assistant';

export default function CodeAssistant(props) {
  const { formValue, language, editor, code } = props;
  const systemPrompt =
    language === 'javascript'
      ? `
You are a helpful assistant who can help human create a module using javascript.

Moduel Information:
- title: ${formValue.title}
- description: ${formValue.description}
- input_keys: ${formValue.input}
- output_keys: ${formValue.output}
- width: ${formValue.width}
- height: ${formValue.height}

Note:
- Make sure you wrap the code in the code block like \`\`\`javascript \`\`\`.
- Provide example data to create the module.
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
    You are a helpful assistant who can help human create a module using python.

    Moduel Information:
    - title: ${formValue.title}
    - description: ${formValue.description}
    - input_keys: ${formValue.input}
    - output_keys: ${formValue.output}

    Note:
    - When you write the code, make sure you wrap the python code in the python code block like \`\`\`python \`\`\`**.

    Global variables and functions you can use directly:
    - import cityflow.module as cm
    - cm.input: input data, e.g. input1 = cm.input['input1']
    - cm.config: module configuration value, e.g. title = cm.config['title']
    - cm.setConfig: the function to set the configuration data, e.g. cm.setConfig({'title': title})
    - cm.setOutput: the function to set the output data, e.g. cm.setOutput({'output1': output1})

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

  return new Assistant({
    systemPrompt,
    context,
  });
}
