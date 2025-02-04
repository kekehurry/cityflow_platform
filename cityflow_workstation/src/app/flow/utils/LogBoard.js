import { useState } from 'react';
import {
  Box,
  Stack,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import theme from '@/theme';
import { runCommand } from '@/utils/executor';
import Ansi from 'ansi-to-react';

const LogBoard = ({
  flowId,
  logOpen,
  setLogOpen,
  isAlive,
  terminalLogs,
  setTerminalLogs,
}) => {
  const [loading, setLoading] = useState(false);
  const [command, setCommand] = useState('');

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
  };

  return (
    <>
      <Dialog
        open={logOpen}
        onClose={handleClose}
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
            <div
              style={{
                maxWidth: '100%',
                width: '100%',
                height: '100%',
                margin: '0 auto',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                backgroundColor: theme.palette.flow.main,
                borderRadius: '5px',
                border: theme.palette.node.border,
                color: theme.palette.text.secondary,
                padding: '16px',
                overflow: 'auto',
              }}
            >
              <Ansi>{terminalLogs}</Ansi>
            </div>
            <TextField
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Enter command"
              variant="outlined"
              size="small"
              fullWidth
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
            disabled={!isAlive}
          >
            Run
          </LoadingButton>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LogBoard;
