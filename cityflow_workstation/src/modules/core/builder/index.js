import React, { useEffect, useState } from 'react';
import { Box, Stack, TextField, Tabs, Tab, Typography } from '@mui/material';
import MonacoEditor from '@monaco-editor/react';
import theme from '@/theme';
import _, { set } from 'lodash';

import { removeSession, useExecuteCode } from '@/utils/executor';
import CodeAssistant from './utils/CodeAssistant';
import FileUploader from './utils/FileUploader';
import ControlButtons from './utils/ControlButtons';
import ConfigTab from './utils/ConfigTab';
import { initUserId } from '@/utils/local';
import { useReactFlow } from 'reactflow';
import BuilderInterface from './interface';
import IframeComponent from './utils/IframeComponent';

const initCode = {
  interface: `
//import packages
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
  module: `
# import packages
import cityflow.module as cm;

# main function
def main():
    return {
    "output": cm.config["title"]
    }

#Set the output
cm.output = main()
print(cm.output)
`,
};

export default function ModuleBuilder(props) {
  const {
    id,
    flowId,
    flowAuthor,
    input,
    config,
    setConfig,
    image,
    position,
    expand,
    setOutput,
    run,
    setLoading,
    updateInterface,
  } = props;
  const [log, setLog] = useState(null);
  const [tab, setTab] = useState(0);
  const [editor, setEditor] = useState(0);
  const [editorTabs, setEditorTabs] = useState(['interface', 'module']);

  const initForm = {
    type: config.type || 'interface',
    author: config.author || 'Anonymous',
    author_id: config.author_id || null,
    category: config.category || 'Custom',
    name: config.name || 'Untitled Module',
    input: config.input || ['input'],
    output: config.output || ['output'],
    width: config.width || 200,
    height: config.height || 100,
    expandWidth: config.expandWidth || 800,
    expandHeight: config.expandHeight || 600,
    port: config.type === 'server' ? config.port || 8080 : null,
    language: config.language || 'javascript',
    description: config.description || 'No description',
    code: config.code || initCode,
    files: config.files || [],
  };
  const [userId, setUserId] = useState(null);
  const [formValue, setFormValue] = useState({ ...initForm });
  const [codeSubmited, setCodeSubmited] = useState(false);
  const [params, setParams] = useState(null);
  const executeResult = useExecuteCode(params || {});
  const { setCenter, fitBounds } = useReactFlow();

  // init
  useEffect(() => {
    updateInterface(<BuilderInterface />);
    initUserId().then((userId) => {
      setUserId(userId);
      if (!config.author_id) {
        setConfig({
          ...config,
          ...initForm,
          author_id: userId,
        });
      } else {
        setConfig({
          ...config,
          ...initForm,
        });
      }
    });
    return () => {
      removeSession(flowId, id);
    };
  }, []);

  // expand
  useEffect(() => {
    expand &&
      setCenter(position.x + 70, position.y + 30, {
        duration: 1000,
        zoom: 1.1,
      });
  }, [expand]);

  //html
  // useEffect(() => {
  //   config.html &&
  //     setConfig({
  //       ...config,
  //       InterfaceComponent: <BuilderInterface {...props} />,
  //     });
  // }, [config.html]);

  // reset
  useEffect(() => {
    let language;
    if (formValue.type === 'interface') {
      setEditorTabs(['interface']);
      language = 'javascript';
    } else {
      setEditorTabs(['module']);
      language = 'python';
    }
    setFormValue({ ...initForm, language: language, type: formValue.type });
    setConfig({
      ...config,
      ...initForm,
      language: language,
      type: formValue.type,
      run: false,
    });
    setTab(0);
    setEditor(0);
    setLog(null);
    setOutput(null);
  }, [formValue.type]);

  useEffect(() => {
    if (codeSubmited || (formValue.language == 'python' && config.run)) {
      setLog(null);
      setParams({
        sessionId: id,
        flowId: flowId,
        userName: flowAuthor,
        moduleCode: formValue.code[formValue.type],
        files: formValue.files,
        language: formValue.language,
        input: input,
        config: config,
        image: image,
      });
    }
  }, [codeSubmited, config.run, formValue.language, input]);

  useEffect(() => {
    if (executeResult?.isLoading) {
      setLoading(true);
    } else {
      setLoading(false);
      setCodeSubmited(false);
    }

    if (executeResult?.data) {
      const res = executeResult.data;
      const output = res?.output && JSON.parse(res.output, null, 2);
      const html = res?.html;
      setConfig({ ...config, html: html });
      setOutput({ ...output });
      setLog(res?.console);
    }

    if (executeResult?.error) {
      setLog(executeResult.error);
    }
  }, [executeResult?.isLoading, executeResult?.error, executeResult?.data]);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleEditorChange = (event, newValue) => {
    setEditor(newValue);
  };

  const handleCodeChange = (value, key) => {
    setFormValue({
      ...formValue,
      author_id: userId,
      code: {
        ...formValue.code,
        [key]: value,
      },
    });
  };

  const configTab = (
    <Box hidden={tab !== 0}>
      <ConfigTab
        language={formValue.language || 'javascript'}
        code={formValue.code[editorTabs[editor]]}
        formValue={formValue}
        setFormValue={setFormValue}
        config={config}
        setConfig={setConfig}
        height={config.expandHeight - 330}
      />
      {formValue.type === 'interface' ? (
        <>
          <Typography variant="caption">Preview</Typography>
          <Box
            sx={{
              height: 220,
              borderRadius: 1,
              border: `1px solid ${theme.palette.divider}`,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'auto',
            }}
          >
            <Box
              sx={{
                width:
                  config.width > config.height
                    ? config.expandWidth * 0.4 - 80
                    : (200 * config.width) / config.height,
                height:
                  config.width > config.height
                    ? (config.expandWidth * 0.4 - 80) *
                      (config.height / config.width)
                    : 200,
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <IframeComponent
                config={config}
                input={input}
                setConfig={setConfig}
                setOutput={setOutput}
                zoom={
                  config.width > config.height
                    ? (config.expandWidth * 0.4 - 80) / config.width
                    : 200 / config.height
                }
              />
            </Box>
          </Box>
        </>
      ) : (
        <>
          <Typography variant="caption">Logs</Typography>
          <TextField
            id="log"
            multiline
            className="nowheel"
            lable="Log"
            fullWidth
            value={log ? JSON.stringify(log) : ''}
            rows={9}
            sx={{ background: theme.palette.node.main }}
          />
        </>
      )}
    </Box>
  );

  const assistantTab = (
    <Box hidden={tab !== 1}>
      <CodeAssistant
        language={formValue.language || 'javascript'}
        code={formValue.code[editorTabs[editor]]}
        editorTab={editorTabs[editor]}
        formValue={formValue}
        setFormValue={setFormValue}
        config={config}
        setConfig={setConfig}
        height={config.expandHeight - 170}
      />
    </Box>
  );
  const dependencyTab = (
    <Box hidden={tab !== 2}>
      <Stack spacing={1} height={config.expandHeight - 100}>
        <Typography variant="caption">Dependencies</Typography>
        <FileUploader
          formValue={formValue}
          setFormValue={setFormValue}
          height={config.expandHeight - 110}
        />
      </Stack>
    </Box>
  );
  return (
    <>
      <Stack direction="row" spacing={0.1}>
        <Box className="nowheel" sx={{ width: '60%', height: '600px' }}>
          <Tabs
            value={editor}
            onChange={handleEditorChange}
            sx={{
              fontSize: 12,
              minHeight: 10,
              height: 20,
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
                disableRipple
              />
            ))}
          </Tabs>
          <Box style={{ height: '600px' }} className="nowheel nodrag">
            <ControlButtons
              config={config}
              formValue={formValue}
              setConfig={setConfig}
              setCodeSubmited={setCodeSubmited}
            />
            {editorTabs.map((tab, index) => (
              <Box hidden={editor !== index} key={tab}>
                <MonacoEditor
                  width="100%"
                  height={config.expandHeight - 50}
                  language={tab === 'interface' ? 'javascript' : 'python'}
                  theme="vs-dark"
                  value={formValue.code[tab]}
                  onChange={(value) => handleCodeChange(value, tab)}
                  options={{
                    minimap: { enabled: false },
                    wordWrap: 'on',
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>
        <Box sx={{ width: '40%' }}>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            sx={{
              fontSize: 12,
              minHeight: 10,
              height: 20,
              '& .MuiTabs-indicator': { display: 'none' },
            }}
          >
            <Tab
              label="Config"
              sx={{ fontSize: 12, minHeight: 10, height: 10 }}
              id={0}
              disableRipple
            />
            <Tab
              label="Assistant"
              sx={{ fontSize: 12, minHeight: 10, height: 10 }}
              id={1}
              disableRipple
            />
            <Tab
              label="Dependency"
              sx={{ fontSize: 12, minHeight: 10, height: 10 }}
              id={2}
              disableRipple
            />
          </Tabs>
          <Box style={{ padding: 20 }} className="nowheel nodrag">
            {configTab}
            {assistantTab}
            {dependencyTab}
          </Box>
        </Box>
      </Stack>
    </>
  );
}
