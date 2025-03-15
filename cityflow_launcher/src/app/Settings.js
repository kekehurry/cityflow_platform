import React, { useEffect, useState } from 'react';
import {
  Box,
  Stack,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useDialogs } from '@toolpad/core/useDialogs';

const useLocalStorage = (key, defaultValue) => {
  const [localValue, setLocalValue] = useState(() => {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    const data = localStorage.getItem('cs_settings') || '{}';
    const cs_data = JSON.parse(data);
    let value = cs_data[key];
    value = value ? value : defaultValue;
    return value;
  });
  const setValue = (value) => {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    setLocalValue(value);
    const data = localStorage.getItem('cs_settings') || '{}';
    const cs_data = JSON.parse(data);
    cs_data[key] = value;
    localStorage.setItem('cs_settings', JSON.stringify(cs_data));
  };

  return [localValue, setValue];
};

const Settings = () => {
  const [defaultSettings, setDefaultSettings] = useLocalStorage(
    'DEFAULT_SETTINGS',
    {
      runnerImage: 'ghcr.io/kekehurry/cityflow_runner:full',
      platformImage: 'ghcr.io/kekehurry/cityflow_platform:latest',
      port: 3001,
      update: false,
    }
  );
  const [formValue, setFormValue] = useState({
    runnerImage: defaultSettings?.runnerImage,
    platformImage: defaultSettings?.platformImage,
    port: defaultSettings?.port,
    update: defaultSettings?.update,
  });
  const [log, setLog] = useState('');
  const [time, setTime] = useState('');
  const [dockerStatus, setDockerStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const dialogs = useDialogs();

  const handleValueChange = (e) => {
    setFormValue({
      ...formValue,
      [e.target.id]: e.target.value,
    });
  };

  const handleStart = () => {
    setLoading(true);
    window?.electronAPI &&
      window.electronAPI.sendStart({
        runnerImage: formValue.runnerImage,
        platformImage: formValue.platformImage,
        port: formValue.port,
        update: formValue.update,
      });
  };

  useEffect(() => {
    setDefaultSettings(formValue);
  }, [formValue]);

  useEffect(() => {
    if (window?.electronAPI) {
      window.electronAPI.onInstallLog((event, message) => {
        setLog(message);
      });
      window.electronAPI.onInstallTime((event, message) => {
        setTime(message);
      });
      window.electronAPI.onDockerStatus((event, status) => {
        setDockerStatus(status);
      });
      window.electronAPI.onUpdateAvailable(() => {
        setFormValue({
          ...formValue,
          update: true,
        });
      });
    }
  }, []);

  return (
    <>
      <Box
        sx={{
          p: 6,
          width: '55%',
          position: 'absolute',
          top: '45%',
          left: 0,
          transform: 'translate(0, -50%)',
        }}
      >
        <Typography variant="h1">CityFlow Platform</Typography>
        <Typography variant="subtitle1">
          CityFlow is a low-code AI platform that helps urban planners create,
          evaluate, and visualize solutions using natural language and
          collaborative tools, accessing a shared knowledge base to streamline
          urban problem-solving.
        </Typography>
        <Box
          id="log"
          sx={{
            whiteSpace: 'pre-wrap',
            border: 'none',
            p: 1,
            mt: 9,
            userSelect: false,
            height: 50,
            color: '#626262',
            overflowY: 'auto',
          }}
        >
          <Typography id="docker-status" variant="subtitle1" color="#626262">
            {dockerStatus}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Typography variant="subtitle1" width="80%">
              {log}
            </Typography>
            <Typography variant="subtitle1" width="20%" color="#E6EE9C">
              {time && `${time}s`}
            </Typography>
          </Stack>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          p: 2,
          width: '30%',
          left: '60%',
          position: 'absolute',
          top: '50%',
          transform: 'translate(0, -50%)',
        }}
      >
        <FormControl fullWidth>
          <InputLabel id="runnerImage-label">CityFlow Runner Image</InputLabel>
          <Select
            labelId="runnerImage-label"
            id="runnerImage"
            value={formValue.runnerImage}
            label="Select CityFlow Runner Image"
            onChange={(e) =>
              handleValueChange({
                target: {
                  id: 'runnerImage',
                  value: e.target.value,
                },
              })
            }
          >
            <MenuItem value="ghcr.io/kekehurry/cityflow_runner:latest">
              cityflow_runner:latest
            </MenuItem>
            <MenuItem value="ghcr.io/kekehurry/cityflow_runner:full">
              cityflow_runner:full
            </MenuItem>
            <MenuItem value="ghcr.io/kekehurry/cityflow_runner:dev">
              cityflow_runner:dev
            </MenuItem>
            <MenuItem value="ghcr.nju.edu.cn/kekehurry/cityflow_runner:latest">
              cityflow_runner:latest (南京大学加速镜像)
            </MenuItem>
            <MenuItem value="ghcr.nju.edu.cn/kekehurry/cityflow_runner:full">
              cityflow_runner:full (南京大学加速镜像)
            </MenuItem>
            <MenuItem value="ghcr.nju.edu.cn/kekehurry/cityflow_runner:dev">
              cityflow_runner:dev (南京大学加速镜像)
            </MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="platformImage-label">
            CityFlow Platform Image
          </InputLabel>
          <Select
            labelId="platformImage-label"
            id="platformImage"
            value={formValue.platformImage}
            label="Select CityFlow Platform Image"
            onChange={(e) =>
              handleValueChange({
                target: {
                  id: 'platformImage',
                  value: e.target.value,
                },
              })
            }
          >
            <MenuItem value="ghcr.io/kekehurry/cityflow_platform:latest">
              cityflow_platform:latest
            </MenuItem>
            <MenuItem value="ghcr.io/kekehurry/cityflow_platform:dev">
              cityflow_platform:dev
            </MenuItem>
            <MenuItem value="ghcr.nju.edu.cn/kekehurry/cityflow_platform:latest">
              cityflow_platform:latest (南京大学加速镜像)
            </MenuItem>
            <MenuItem value="ghcr.nju.edu.cn/kekehurry/cityflow_platform:dev">
              cityflow_platform:dev (南京大学加速镜像)
            </MenuItem>
          </Select>
        </FormControl>

        <TextField
          type="number"
          id="port"
          label="Port (default 3001)"
          value={formValue.port}
          onChange={handleValueChange}
          inputProps={{ min: 1024, max: 65535 }}
          fullWidth
        />

        <Button
          variant="contained"
          id="start_button"
          onClick={handleStart}
          sx={{ height: 40 }}
          disabled={!dockerStatus}
        >
          {loading ? (
            <CircularProgress size={20} sx={{ color: 'white', opacity: 0.7 }} />
          ) : (
            'Start'
          )}
        </Button>

        <Stack
          direction={'row'}
          spacing={1}
          justifyContent={'space-between'}
          alignItems={'center'}
        >
          <Stack direction={'row'} spacing={1}>
            <Typography
              variant="subtitle1"
              sx={{
                fontSize: 12,
                color: 'text.secondary',
                cursor: 'pointer',
                '&:hover': { color: 'primary.main' },
              }}
              onClick={() => {
                window?.electronAPI?.invoke('stop-server', {
                  runnerImage: formValue.runnerImage,
                  platformImage: formValue.platformImage,
                });
              }}
            >
              Stop /
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                fontSize: 12,
                color: 'text.secondary',
                cursor: 'pointer',
                '&:hover': { color: 'primary.main' },
              }}
              onClick={() => {
                window?.electronAPI?.invoke('reset-machine', {});
              }}
            >
              Reset /
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                fontSize: 12,
                color: 'text.secondary',
                cursor: 'pointer',
                '&:hover': { color: 'primary.main' },
              }}
              onClick={() => {
                window?.electronAPI?.invoke('prune-machine', {});
              }}
            >
              Prune /
            </Typography>
          </Stack>
          <FormControlLabel
            control={
              <Checkbox
                id="update"
                size="small"
                checked={formValue.update}
                onChange={() => {
                  setFormValue({
                    ...formValue,
                    update: !formValue.update,
                  });
                }}
                sx={{
                  '& .MuiSvgIcon-root': { fontSize: 12 },
                }}
              />
            }
            label="Check Update"
            labelPlacement="start"
            sx={{
              marginLeft: 'auto',
              '& .MuiFormControlLabel-label': {
                fontSize: 12,
                color: 'text.secondary',
              },
            }}
          />
        </Stack>
      </Box>
    </>
  );
};

export default Settings;
