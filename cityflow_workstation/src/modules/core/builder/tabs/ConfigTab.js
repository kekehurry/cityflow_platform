import { Box, Typography } from '@mui/material';
import ConfigPanel from '../utils/ConfigPanel';
import IframeComponent from '../utils/IframeComponent';
import theme from '@/theme';
import { useRef, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
            <SyntaxHighlighter
              language="bash"
              style={dark}
              lineProps={{
                style: { wordBreak: 'break-all', whiteSpace: 'pre-wrap' },
              }}
              wrapLongLines={true}
              wrapLines={true}
              customStyle={{
                width: '100%',
                height: 210,
                margin: '0 auto',
                fontFamily: 'monospace',
                fontSize: 10,
                backgroundColor: theme.palette.flow.main,
                borderRadius: '5px',
                border: theme.palette.node.border,
                color: theme.palette.text.secondary,
                padding: '16px',
                overflow: 'auto',
                boxShadow: 'none',
              }}
            >
              {log}
              <div ref={logEndRef} />
            </SyntaxHighlighter>
          </div>
        </>
      )}
    </Box>
  );
}
