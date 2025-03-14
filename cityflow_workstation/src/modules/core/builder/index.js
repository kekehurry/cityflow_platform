import React, { useEffect, useState } from 'react';
import { Box, Stack, Tabs, Tab } from '@mui/material';
import _, { set } from 'lodash';
import {
  removeSession,
  executeCode,
  interuptCode,
  compileCode,
} from '@/utils/executor';
import { initUserId } from '@/utils/local';

import { useReactFlow } from 'reactflow';
import BuilderInterface from './interface';
import DependencyTab from './tabs/DependencyTab';
import AssistantTab from './tabs/AssistantTab';
import ConfigTab from './tabs/ConfigTab';
import CodeEditor, { initCode } from './tabs/CodeEditor';

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
    setLoading,
    updateInterface,
  } = props;

  const [tab, setTab] = useState(0);
  const [editor, setEditor] = useState(0);

  const initForm = {
    type: config.type || 'interface',
    author: config.author || 'Anonymous',
    author_id: config.author_id || null,
    category: config.category || 'Custom',
    name: config.name || 'Untitled Module',
    input: config.input || ['input'],
    output: config.output || ['output'],
    width: config.width || 150,
    height: config.height || 0,
    expandWidth: config.expandWidth || 800,
    expandHeight: config.expandHeight || 600,
    port: config.type === 'server' ? config.port || 8080 : null,
    language: config.language || 'javascript',
    description: config.description || 'No description',
    code: config?.code || initCode[config.type],
    files: config.files || [],
  };
  const [userId, setUserId] = useState(null);
  const [formValue, setFormValue] = useState({ ...initForm });
  const [codeSubmited, setCodeSubmited] = useState(false);
  const { setCenter } = useReactFlow();
  const [log, setLog] = useState(null);

  //helper functions
  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

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
      setCenter(
        position.x + config.expandWidth / 2,
        position.y + config.expandHeight / 2,
        {
          duration: 1000,
          zoom: 1,
        }
      );
  }, [expand]);

  // reset
  useEffect(() => {
    let language;
    if (formValue.type === 'interface') {
      language = 'javascript';
    } else {
      language = 'python';
    }
    setFormValue({
      ...initForm,
      language: language,
      type: formValue.type,
      code:
        config?.code &&
        config.code != initCode['interface'] &&
        config.code != initCode['module']
          ? config.code
          : initCode[formValue.type],
    });
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
    setLog('');
    const getResults = async () => {
      const newConfig = {
        ...config,
        ...formValue,
        code: formValue.code,
      };
      setConfig(newConfig);
      let logs = '';

      const handleResult = (chunk) => {
        if (chunk.console) {
          logs += chunk?.console;
          setLog(logs);
          setOutput({ logs: chunk?.console });
          setLoading(true);
        } else if (chunk.output) {
          setOutput({ ...chunk.output, logs: chunk?.console });
        }
      };

      try {
        if (formValue.language === 'python') {
          for await (const chunk of await executeCode({
            sessionId: id,
            flowId: flowId,
            userName: flowAuthor,
            files: formValue.files,
            language: formValue.language,
            input: input,
            config: newConfig,
            image: image,
          })) {
            chunk && handleResult(chunk);
          }
          setLoading(false);
          setCodeSubmited(false);
        } else {
          let logs = '';
          setConfig({ ...newConfig, html: null });
          const result = await compileCode({
            sessionId: id,
            flowId: flowId,
            userName: flowAuthor,
            files: formValue.files,
            language: formValue.language,
            input: input,
            config: newConfig,
            image: image,
          });
          if (result?.html) {
            setConfig({ ...newConfig, html: result.html });
          } else if (result?.console) {
            // result?.console.includes('success') &&
            setConfig({
              ...newConfig,
              html: `
              <pre id="error-message" style="color:red;">${result.console}</pre>
              <script>
                document.getElementById('error-message').style.fontSize = (12 / window.zoom) + 'px';
              </script>
            `,
            });
          } else {
            setConfig({
              ...newConfig,
              html: `<pre id="error-message" style="color:red;">compile failed</pre>
              <script>
                document.getElementById('error-message').style.fontSize = (12 / window.zoom) + 'px';
              </script>`,
            });
          }
          setLoading(false);
          setCodeSubmited(false);
        }
      } catch (e) {
        setLog(logs + e);
      }
    };

    if (
      (formValue.type === 'interface' && codeSubmited) ||
      (formValue.type === 'module' && config.run)
    ) {
      setLoading(true);
      getResults();
    }
  }, [codeSubmited, config.run, formValue.language, input]);

  useEffect(() => {
    if (config && !config.run) {
      console.log('interupt', flowId);
      interuptCode(flowId).then(() => {
        setLoading(false);
      });
    }
  }, [config?.run]);

  return (
    <>
      <Stack direction="row" spacing={0.1}>
        <Box className="nowheel" sx={{ width: '60%', height: '600px' }}>
          <CodeEditor
            sessionId={id}
            userId={userId}
            config={config}
            editor={editor}
            setEditor={setEditor}
            formValue={formValue}
            setFormValue={setFormValue}
            setConfig={setConfig}
            setCodeSubmited={setCodeSubmited}
          />
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
            <ConfigTab
              tab={tab}
              expand={expand}
              config={config}
              formValue={formValue}
              setFormValue={setFormValue}
              setConfig={setConfig}
              input={input}
              setOutput={setOutput}
              log={log}
            />
            <AssistantTab
              tab={tab}
              config={config}
              formValue={formValue}
              setFormValue={setFormValue}
              editor={editor}
              setConfig={setConfig}
            />
            <DependencyTab
              config={config}
              tab={tab}
              formValue={formValue}
              setFormValue={setFormValue}
            />
          </Box>
        </Box>
      </Stack>
    </>
  );
}
