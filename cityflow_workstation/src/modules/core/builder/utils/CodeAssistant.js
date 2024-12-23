import Assistant from '@/utils/assistant';

const importCommands = {
  react: 'import React,{useState} from "react";',
  '@mui/material': 'import {Button,Typography} from "@mui/material";',
  '@mui/icons-material': 'import * as ICONS from "@mui/icons-material";',
  '@mui/lab': 'import {Autocomplete} from "@mui/lab";',
  '@mui/x-data-grid': 'import {DataGrid} from "@mui/x-data-grid";',
  nanoid: 'import {nanoid} from "nanoid";',
  lodash: 'import _ from "lodash";',
  '@turf/turf': 'import * as turf from "@turf/turf";',
  '@deck.gl/react': 'import DeckGL from "@deck.gl/react";',
  '@deck.gl/core': 'import Deck from "@deck.gl/core";',
  '@deck.gl/layers': 'import {ScatterplotLayer} from "@deck.gl/layers";',
  'mapbox-gl/dist/mapbox-gl.css': 'import "mapbox-gl/dist/mapbox-gl.css";',
  'mapbox-gl': 'import * as Mapbox from "mapbox-gl";',
  d3: 'import * as d3 from "d3";',
  'd3-color-legend': 'import { Legend } from "d3-color-legend;"',
  'topojson-client': 'import * as topojson from "topojson-client";',
  three: 'import * as THREE from "three";',
  'chart.js': 'import * as ChartJS from "chart.js";',
};

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
- Please note this module is running in a live environment, following is the scope of the environment:
    - props: available global variables and functions for the module
        - input: input data, e.g. const {input1,input2} = input,
        - config: module configuration value,
        - setConfig: function to save the configuration,
        - setOutput: function to set the output of the module, e.g. setOutput({outputName1:output1, outputName2:output2}),
    - import: scoope used by import statement **you can ONLY import the following packages with the SPECIFIC NAME**
${formValue.packages
  .map((key) => `        -${key}: ${key} library e.g. ${importCommands[key]}`)
  .join('\n')}

Example:
\`\`\`javascript
//import packages from the scope
import React from 'react';
// load necessary variables from the scope
const {input,config,setConfig,setOutput} = props;
// main function
export default function ModuleTitle(){
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
    - **Step1: Before you write the code, you need to install the required packages. Make sure you wrap the pip command in the shell code block like \`\`\`sh \`\`\`**.
    - **Step2: When you write the code, make sure you wrap the python code in the python code block like \`\`\`python \`\`\`**.

    Global variables and functions you can use directly:
    - input_data: input data, e.g. input1 = input_data['input1']
    - config_data: module configuration value, e.g. title = config_data['title']
    - output_data: the variable to store output data, e.g. output_data['output1'] = output1

    Example:
    \`\`\`sh
    #Install required packages
    pip install pandas
    \`\`\`

    \`\`\`python
    def main(input_data):
        if input_data:
            output_data = {
                "output": input_data["input"]
            }
        else:
            output_data = {
                "output": config_data["title"]
            }
        return output_data

    #Set the output
    output_data = main(input_data)
    \`\`\`
    `;
  const context = `Current code: ${code}`;

  return new Assistant({
    systemPrompt,
    context,
  });
}
