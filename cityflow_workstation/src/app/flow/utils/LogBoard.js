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
import { set } from 'lodash';

const enableCommand = process.env.NEXT_PUBLIC_ENABLE_COMMAND === 'true';

const LogBoard = ({ flowId, logOpen, setLogOpen, isAlive, logs }) => {
  const [loading, setLoading] = useState(false);
  const [command, setCommand] = useState('');
  const [terminalLogs, setTerminalLogs] = useState('');
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [imageName, setImageName] = useState('');

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
    if (imageName != '') {
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
          setExporting(false);
        });
    } else {
      alert('Please enter image name');
    }
  };

  useEffect(() => {
    setTerminalLogs(logs);
  }, [logs]);

  useEffect(() => {
    setExporting(false);
    setImageName('');
  }, [logOpen]);

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
        <DialogTitle sx={{ fontSize: 20 }}>
          {!exporting ? 'Terminal' : 'Export'}
        </DialogTitle>
        <DialogContent>
          <Stack width={400} spacing={2} alignItems={'center'}>
            {!exporting ? (
              <>
                <LogViewer
                  key="terminal"
                  logs={terminalLogs}
                  width={400}
                  height={260}
                />
                <TextField
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder={`Enter command ${
                    enableCommand ? '' : '(Disabled)'
                  }`}
                  variant="outlined"
                  size="small"
                  fullWidth
                  disabled={!enableCommand}
                  sx={{
                    background: theme.palette.flow.main,
                    fontFamily: 'monospace',
                  }}
                />
              </>
            ) : (
              <TextField
                value={imageName}
                onChange={(e) => setImageName(e.target.value)}
                placeholder={`Enter image name`}
                variant="outlined"
                size="small"
                fullWidth
                disabled={!exporting}
                sx={{
                  background: theme.palette.flow.main,
                  fontFamily: 'monospace',
                }}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions variant="outlined">
          {!exporting ? (
            <>
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  justifyContent: 'flex-start',
                  paddingLeft: 10,
                }}
              >
                <Button
                  onClick={() => setExporting(true)}
                  style={{
                    color: theme.palette.text.secondary,
                  }}
                  disabled={!isAlive}
                >
                  SAVE IMAGE
                </Button>
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
                RUN
              </LoadingButton>
              <Button
                onClick={handleClose}
                style={{
                  color: theme.palette.text.secondary,
                }}
              >
                CLOSE
              </Button>
            </>
          ) : (
            <LoadingButton
              onClick={handleExport}
              loading={saving}
              style={{
                color: theme.palette.text.secondary,
              }}
            >
              {saving || 'Export IMAGE'}
            </LoadingButton>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LogBoard;
