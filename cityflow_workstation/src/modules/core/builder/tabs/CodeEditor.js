import {
  Box,
  Tab,
  Tabs,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import MonacoEditor from '@monaco-editor/react';
import ControlButtons from '../utils/ControlButtons';
import { useState, useEffect, useRef, use } from 'react';
import { registerLLMCompletions } from '../utils/CodeAssistant';
import { getLocalStorage } from '@/utils/local';

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
  sessionId,
  config,
  editor,
  setEditor,
  formValue,
  setFormValue,
  setConfig,
  setCodeSubmited,
}) {
  const [editorTabs, setEditorTabs] = useState(
    formValue?.code && Array.isArray(formValue.code)
      ? formValue.code.map((item, id) => getFileName(item))
      : ['entrypoint']
  );
  const monacoRef = useRef(null);
  const AUTO_COMPLETION = getLocalStorage('CODE_COMPLETION') === 'true';
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleEditorDidMount = (editor, monaco) => {
    monacoRef.current = monaco;
    ['javascript', 'python'].forEach((lang) => {
      registerLLMCompletions(monaco, lang, setLoading, setStatus);
    });
  };

  const createNewTab = () => {
    let newTabName = `new${editorTabs.length}`;
    if (editorTabs.includes(newTabName)) {
      newTabName = `new${newTabName}`;
    }
    setEditorTabs([...editorTabs, newTabName]);
    setEditor(editorTabs.length);
    setFormValue({
      ...formValue,
      code: [...formValue.code, ''],
    });
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

  const handleCodeChange = (value, e) => {
    let newCode = formValue.code;
    let tabs = [...editorTabs];
    newCode[editor] = value;
    setFormValue({
      ...formValue,
      code: newCode,
    });
    const filename = editor === 0 ? 'entrypoint' : getFileName(value);
    tabs[editor] = filename;
    setEditor(editor);
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
      <Box className="nowheel nodrag" height={formValue.expandHeight - 50}>
        <ControlButtons
          config={config}
          formValue={formValue}
          setConfig={setConfig}
          setCodeSubmited={setCodeSubmited}
        />
        {formValue.expandHeight && (
          <MonacoEditor
            key={sessionId}
            width="100%"
            height={formValue.expandHeight - 65}
            language={formValue.language}
            theme="vs-dark"
            value={formValue.code[editor]}
            onChange={(value, e) => handleCodeChange(value, e)}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              wordWrap: 'on',
              inlineSuggest: {
                enabled: AUTO_COMPLETION,
                showToolbar: true,
              },
              suggestOnTriggerCharacters: AUTO_COMPLETION,
            }}
          />
        )}
        <Box
          sx={{
            width: '100%',
            height: 12,
            backgroundColor: 'primary',
            zIndex: 1,
            p: 1,
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          <Stack direction="row" spacing={1}>
            {loading && (
              <CircularProgress
                size={6}
                sx={{ color: '#FFB300', cursor: 'pointer' }}
              />
            )}
            {status && (
              <Typography sx={{ color: 'text.secondary', fontSize: 6 }}>
                {status}
              </Typography>
            )}
          </Stack>
        </Box>
      </Box>
      {/* <Box height={20} /> */}
    </Box>
  );
}
