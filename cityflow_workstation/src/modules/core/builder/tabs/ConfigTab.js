import { Box, TextField, Typography } from '@mui/material';
import ConfigPanel from '../utils/ConfigPanel';
import IframeComponent from '../utils/IframeComponent';
import theme from '@/theme';
import Ansi from 'ansi-to-react';

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
              maxWidth: '100%',
              width: '100%',
              height: '200px',
              margin: '0 auto',
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              backgroundColor: theme.palette.node.main,
              borderRadius: '5px',
              border: `1px solid ${theme.palette.secondary.grey}`,
              color: theme.palette.text.secondary,
              padding: '16px',
              marginTop: '8px',
              overflow: 'auto',
            }}
          >
            <Ansi>{log}</Ansi>
          </div>
          {/* <TextField
            id="log"
            multiline
            className="nowheel"
            lable="Log"
            fullWidth
            value={log || ''}
            rows={9}
            sx={{ background: theme.palette.node.main }}
          /> */}
        </>
      )}
    </Box>
  );
}
