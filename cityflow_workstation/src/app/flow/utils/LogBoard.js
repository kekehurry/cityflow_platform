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
import { runCommand, exportImage } from '@/utils/executor';
import LogViewer from '@/components/Logger';

const enableCommand = process.env.NEXT_PUBLIC_ENABLE_COMMAND === 'true';

const LogBoard = ({ flowId, logOpen, setLogOpen, isAlive, logs }) => {
  const [loading, setLoading] = useState(false);
  const [command, setCommand] = useState('');
  const [terminalLogs, setTerminalLogs] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    let allLogs = '';
    setTerminalLogs('');
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

  const handleExport = async () => {
    const imageName = await prompt('Enter image name');
    if (imageName) {
      setSaving(true);
      exportImage(flowId, imageName, 'latest')
        .then((res) => {
          if (res?.message) {
            alert('Image exported');
          } else {
            alert('Failed to export image');
          }
        })
        .finally(() => {
          setSaving(false);
        });
    } else {
      alert('Please enter image name');
    }
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
          <Stack width={400} spacing={2} alignItems={'center'}>
            <LogViewer
              key="terminal"
              logs={terminalLogs}
              width={400}
              height={260}
            />
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
          <div
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'flex-start',
              paddingLeft: 10,
            }}
          >
            <LoadingButton
              loading={saving}
              onClick={handleExport}
              style={{
                color: theme.palette.text.secondary,
              }}
              disabled={!isAlive}
            >
              {saving || 'SAVE IMAGE'}
            </LoadingButton>
          </div>

          <LoadingButton
            loading={loading}
            onClick={handleSubmit}
            color="primary"
            style={{
              color: !isAlive
                ? theme.palette.text.secondary
                : theme.palette.primary.main,
            }}
          >
            {loading || 'RUN'}
          </LoadingButton>
          <Button
            onClick={handleClose}
            style={{
              color: theme.palette.text.secondary,
            }}
          >
            CLOSE
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LogBoard;
