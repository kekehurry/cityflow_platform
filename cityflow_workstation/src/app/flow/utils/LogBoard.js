import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Stack,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Fade,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import theme from '@/theme';
import { runCommand } from '@/utils/executor';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const enableCommand = process.env.NEXT_PUBLIC_ENABLE_COMMAND === 'true';

const LogBoard = ({ flowId, logOpen, setLogOpen, isAlive, logs }) => {
  const [loading, setLoading] = useState(false);
  const [command, setCommand] = useState('');
  const [terminalLogs, setTerminalLogs] = useState(logs || '');
  const logEndRef = useRef(null);

  const handleSubmit = async () => {
    setLoading(true);
    setTerminalLogs('');
    for await (const chunk of await runCommand(flowId, command)) {
      setTerminalLogs((logs) => logs + chunk);
    }
    setLoading(false);
  };

  const handleClose = () => {
    setLogOpen(false);
    setCommand('');
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [terminalLogs]);

  useEffect(() => {
    setTerminalLogs(logs);
  }, [logs]);

  return (
    <>
      <Dialog
        open={logOpen}
        onClose={handleClose}
        TransitionComponent={Fade}
        transitionDuration={{ enter: 500, exit: 500 }}
        variant="outlined"
        maxWidth="xs"
        PaperProps={{
          component: 'form',
          style: {
            border: theme.palette.node.border,
            background: theme.palette.flow.background,
          },
        }}
      >
        <DialogTitle sx={{ fontSize: 20 }}>Terminal</DialogTitle>
        <DialogContent>
          <Stack width={400} height={300} spacing={2}>
            <SyntaxHighlighter
              language="bash"
              style={dark}
              wrapLongLines={true}
              wrapLines={true}
              lineProps={{
                style: { wordBreak: 'break-all', whiteSpace: 'pre-wrap' },
              }}
              customStyle={{
                maxWidth: '100%',
                width: '100%',
                height: 260,
                margin: '0 auto',
                fontFamily: 'monospace',
                backgroundColor: theme.palette.flow.main,
                borderRadius: '5px',
                border: theme.palette.node.border,
                color: theme.palette.text.secondary,
                padding: '16px',
                overflow: 'auto',
                boxShadow: 'none',
              }}
            >
              {terminalLogs}
              <div ref={logEndRef} />
            </SyntaxHighlighter>
            <TextField
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder={`Enter command ${enableCommand ? '' : '(Disabled)'}`}
              variant="outlined"
              size="small"
              fullWidth
              disabled={!enableCommand}
              sx={{
                background: theme.palette.flow.main,
                fontFamily: 'monospace',
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions variant="outlined">
          <LoadingButton
            loading={loading}
            onClick={handleSubmit}
            color="primary"
            disabled={!isAlive || !enableCommand}
          >
            RUN
          </LoadingButton>
          <Button onClick={handleClose} color="primary">
            CLOSE
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LogBoard;
