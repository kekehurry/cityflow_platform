import { Box, Typography } from '@mui/material';
import ConfigPanel from '../utils/ConfigPanel';
import IframeComponent from '../utils/IframeComponent';
import theme from '@/theme';
import { useRef, useEffect } from 'react';
import ReactAnsi from 'react-ansi';

export default function ConfigTab({
  tab,
  config,
  formValue,
  setFormValue,
  input,
  setOutput,
  log,
  setConfig,
}) {
  const logEndRef = useRef(null);
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [log]);
  return (
    <Box hidden={tab !== 0}>
      {config.expandHeight && (
        <ConfigPanel
          language={formValue.language || 'javascript'}
          code={formValue.code}
          formValue={formValue}
          setFormValue={setFormValue}
          config={config}
          setConfig={setConfig}
          height={config.expandHeight - 330}
        />
      )}
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
                    : 200 / (config.height || 600)
                }
              />
            </Box>
          </Box>
        </>
      ) : (
        <>
          <Typography variant="caption">Logs</Typography>
          <div
            style={{
              marginTop: 10,
              width: '100%',
              height: '100%',
              overflow: 'auto',
            }}
          >
            <ReactAnsi
              log={log || ''}
              showHeader={false}
              autoScroll={true}
              style={{
                borderRadius: '5px',
                border: theme.palette.node.border,
                backgroundColor: theme.palette.flow.main,
                cursor: 'text',
                userSelect: 'text',
              }}
              logStyle={{
                fontFamily: 'monospace',
                fontSize: 12,
              }}
              bodyStyle={{
                height: 190,
                width: '100%',
                backgroundColor: theme.palette.flow.main,
                borderRadius: '5px',
                color: theme.palette.text.secondary,
                overflow: 'auto',
              }}
            />
          </div>
        </>
      )}
    </Box>
  );
}
