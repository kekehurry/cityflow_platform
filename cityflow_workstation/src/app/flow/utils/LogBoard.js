import React, { useEffect, useState } from 'react';
import {
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
import LogViewer from '@/components/Logger';

const enableCommand = process.env.NEXT_PUBLIC_ENABLE_COMMAND === 'true';

const LogBoard = ({ flowId, logOpen, setLogOpen, isAlive, logs }) => {
  const [loading, setLoading] = useState(false);
  const [command, setCommand] = useState('');
  const [terminalLogs, setTerminalLogs] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    let allLogs = '';
    for await (const chunk of await runCommand(flowId, command)) {
      allLogs += chunk;
      setTerminalLogs(allLogs);
    }
    setLoading(false);
  };

  const handleClose = () => {
    setLogOpen(false);
    setCommand('');
  };

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
            <LogViewer logs={terminalLogs} width={400} height={270} />
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
