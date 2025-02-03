import { Box, Tab, Tabs, IconButton, Stack } from '@mui/material';
import MonacoEditor from '@monaco-editor/react';
import ControlButtons from '../utils/ControlButtons';
import { useState, useRef } from 'react';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

export const initCode = {
  interface: [
    `//entrypoint.js

import {useState} from 'react';

// main function
export default function CustomUI(props){
    const {input,config,setConfig,setOutput} = props; 
    return (
    <div style={{textAlign:"center"}}>
        <h3>{config?.name}</h3>
        <h6>{config?.author}</h6>
    </div>)
}
`,
  ],
  module: [
    `#entrypoint.py

import cityflow.module as cm

# main function
def main():
    return {
    "output": cm.config["name"]
    }

#Set the output
cm.output = main()
print(cm.output)
`,
  ],
};

const getFileName = (code) => {
  const filename = code
    .trim()
    .split('\n')[0]
    .replace(/^(#|\/\/)\s*/, '')
    .trim();
  if (filename.lastIndexOf('.') !== -1) {
    return filename.substring(0, filename.lastIndexOf('.'));
  } else {
    return filename;
  }
};

export default function CodeEditor({
  userId,
  config,
  editor,
  setEditor,
  formValue,
  setFormValue,
  setConfig,
  setCodeSubmited,
}) {
  const [editorTabs, setEditorTabs] = useState(
    config?.code && Array.isArray(config.code)
      ? config.code.map((item, id) => getFileName(item))
      : ['entrypoint']
  );
  const createNewTab = () => {
    let newTabName = `new${editorTabs.length}`;
    if (editorTabs.includes(newTabName)) {
      newTabName = `new${newTabName}`;
    }
    setEditorTabs([...editorTabs, newTabName]);
    setEditor(editorTabs.length);
  };

  const handleTabDelete = (index) => {
    if (editorTabs.length > 1 && index !== 0) {
      setEditorTabs(editorTabs.filter((item, id) => id !== index));
      setEditor(index - 1);
      setFormValue({
        ...formValue,
        code: formValue.code.filter((item, id) => id !== index),
      });
    } else {
      setEditor(0);
    }
  };

  const handleEditorChange = (event, newValue) => {
    setEditor(newValue);
  };

  const handleCodeChange = (index, value) => {
    let newCode = formValue.code;
    let tabs = [...editorTabs];
    newCode[index] = value;
    setFormValue({
      ...formValue,
      author_id: userId,
      code: newCode,
    });
    const filename = index === 0 ? 'entrypoint' : getFileName(value);
    tabs[index] = filename;
    setEditor(index);
    setEditorTabs(tabs);
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Tabs
        variant="scrollable"
        scrollButtons="auto"
        value={editor}
        onChange={handleEditorChange}
        sx={{
          fontSize: 12,
          minHeight: 10,
          height: 20,
          overflow: 'auto',
          '& .MuiTabs-indicator': { display: 'none' },
        }}
      >
        {editorTabs.map((tab, index) => (
          <Tab
            key={tab}
            label={tab}
            sx={{
              fontSize: 12,
              minHeight: 10,
              height: 10,
              backgroundColor: editor === index ? '#212121' : null,
            }}
            id={index}
            onDoubleClick={() => handleTabDelete(index)}
            disableRipple
          />
        ))}
        <Tab
          key={'+'}
          label={'+'}
          sx={{
            fontSize: 14,
            minHeight: 10,
            height: 10,
            backgroundColor: 'none',
            borderLeft: '1px solid #212121',
            borderRight: '1px solid #212121',
          }}
          id={editorTabs.length}
          onClick={createNewTab}
          disableRipple
        />
      </Tabs>
      <Box className="nowheel nodrag">
        <ControlButtons
          config={config}
          formValue={formValue}
          setConfig={setConfig}
          setCodeSubmited={setCodeSubmited}
        />
        {config.expandHeight && (
          <MonacoEditor
            key={editor}
            width="100%"
            height={config.expandHeight - 20}
            language={formValue.language}
            theme="vs-dark"
            value={formValue.code[editor]}
            onChange={(value) => handleCodeChange(editor, value)}
            options={{
              minimap: { enabled: false },
              wordWrap: 'on',
            }}
          />
        )}
      </Box>
      {/* <Box height={20} /> */}
    </Box>
  );
}
