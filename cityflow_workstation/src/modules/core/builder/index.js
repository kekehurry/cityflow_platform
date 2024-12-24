import React, { useEffect, useState } from 'react';
import { Box, Stack, TextField, Tabs, Tab, Typography } from '@mui/material';
import MonacoEditor from '@monaco-editor/react';
import theme from '@/theme';
import _ from 'lodash';

import { executeCode, removeSession, useExecuteCode } from '@/utils/executor';
import ChatBot from './utils/ChatBot';
import FileUploader from './utils/FileUploader';
import ControlButtons from './utils/ControlButtons';
import ConfigTab from './utils/ConfigTab';
import { initUserId } from '@/utils/local';

const initCode = {
  interface: `
//import packages from the scope
import React from 'react';

// load necessary variables from the scope
const {input,config,setConfig,setOutput} = props;

// main function
export default function CustomUI(){
    return (
    <div style={{textAlign:"center"}}>
        <h3>{config?.name}</h3>
        <h6>{config?.author}</h6>
    </div>)
}
`,
  module: `
#Available variables:
# input_data: input data, e.g. input1 = input_data['input1']
# config_data: module configuration value, e.g. title = config_data['title']
# output_data: the variable to store output data, e.g. output_data['output1'] = output1

#Do something with the input
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
print(output_data)
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
    setOutput,
    run,
    setLoading,
    mapPackages,
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
    port: config.type === 'server' ? config.port || 8080 : null,
    language: config.language || 'javascript',
    description: config.description || 'No description',
    packages: config.packages || ['react', '@mui/material'],
    code: config.code || initCode,
    files: config.files || [],
  };
  const [userId, setUserId] = useState(null);
  const [formValue, setFormValue] = useState({ ...initForm });
  const [params, setParams] = useState(null);
  const executeResult = useExecuteCode(params || {});

  // init
  useEffect(() => {
    initUserId().then((userId) => {
      setUserId(userId);
      if (!config.author_id) {
        setConfig({ ...config, ...initForm, author_id: userId });
      } else {
        setConfig({ ...config, ...initForm });
      }
    });
    return () => {
      removeSession(flowId, id);
    };
  }, []);

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
    if (run && config.type !== 'interface') {
      setParams({
        sessionId: id,
        flowId: flowId,
        userName: flowAuthor,
        moduleCode: formValue.code.module,
        files: formValue.files,
        language: formValue.language,
        input: input,
        config: config,
        image: image,
      });
      //   setLoading(true);
      //   executeCode({ ...params })
      //     .then((res) => {
      //       response = res;
      //       const output = JSON.parse(res.output, null, 2);
      //       setOutput({ ...output });
      //       setLog(res.console);
      //     })
      //     .catch((err) => {
      //       setLog({ ...response });
      //     })
      //     .finally(() => {
      //       setLoading(false);
      //     });
    }
  }, [run, input, flowId]);

  useEffect(() => {
    if (executeResult?.isLoading) {
      setLoading(true);
    } else {
      setLoading(false);
    }

    if (executeResult?.data) {
      const res = executeResult.data;
      const output = res?.output && JSON.parse(res.output, null, 2);
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
        mapPackages={mapPackages}
        height={540}
      />
    </Box>
  );

  const assistantTab = (
    <Box hidden={tab !== 1}>
      <ChatBot
        language={formValue.language || 'javascript'}
        code={formValue.code[editorTabs[editor]]}
        editorTab={editorTabs[editor]}
        formValue={formValue}
        setFormValue={setFormValue}
        config={config}
        setConfig={setConfig}
        height={440}
      />
    </Box>
  );
  const dependencyTab = (
    <Box hidden={tab !== 2}>
      <Stack spacing={1} height={520}>
        <Typography variant="caption">Dependencies</Typography>
        <FileUploader
          formValue={formValue}
          setFormValue={setFormValue}
          height={320}
        />
        <Typography variant="caption">Logs</Typography>
        <TextField
          id="log"
          multiline
          className="nowheel"
          lable="Log"
          fullWidth
          value={log ? JSON.stringify(log) : ''}
          rows={6}
          sx={{ background: theme.palette.node.main }}
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
              setConfig={setConfig}
              config={config}
              formValue={formValue}
            />
            {editorTabs.map((tab, index) => (
              <Box hidden={editor !== index} key={tab}>
                <MonacoEditor
                  width="100%"
                  height="600px"
                  language={
                    tab === 'packages'
                      ? 'python'
                      : tab === 'interface'
                      ? 'javascript'
                      : 'python'
                  }
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
            {config.type !== 'interface' && (
              <Tab
                label="Dependency"
                sx={{ fontSize: 12, minHeight: 10, height: 10 }}
                id={2}
                disableRipple
              />
            )}
          </Tabs>
          <Box style={{ padding: 20 }} className="nowheel nodrag">
            {configTab}
            {assistantTab}
            {config.type !== 'interface' && dependencyTab}
          </Box>
        </Box>
      </Stack>
    </>
  );
}
