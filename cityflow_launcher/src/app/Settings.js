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

const Settings = () => {
  const localSettings = localStorage.getItem('cityflowSettings') || '{}';
  const localSettingsParsed = JSON.parse(localSettings);

  const [formValue, setFormValue] = useState({
    runnerImage:
      localSettingsParsed?.runnerImage ||
      'ghcr.io/kekehurry/cityflow_runner:full',
    platformImage:
      localSettingsParsed?.platformImage ||
      'ghcr.io/kekehurry/cityflow_platform:latest',
    port: localSettingsParsed?.port || 3001,
    update: false,
  });
  const [log, setLog] = useState('');
  const [dockerStatus, setDockerStatus] = useState('');
  const [loading, setLoading] = useState(false);

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
    localStorage.setItem('cityflowSettings', JSON.stringify(formValue));
  }, [formValue]);

  useEffect(() => {
    if (window?.electronAPI) {
      window.electronAPI.checkDockerInstallation();
      window.electronAPI.onInstallLog((event, message) => {
        setLog(message);
      });
      window.electronAPI.onDockerStatus((event, status) => {
        setDockerStatus(status);
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
          <Typography
            id="docker-status"
            variant="subtitle1"
            color={dockerStatus ? '#626262' : 'red'}
          >
            {dockerStatus
              ? dockerStatus
              : 'Docker not found, please install docker first'}
          </Typography>
          {log}
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
        >
          {loading ? (
            <CircularProgress size={20} sx={{ color: 'white', opacity: 0.7 }} />
          ) : (
            'Start'
          )}
        </Button>

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
      </Box>
    </>
  );
};

export default Settings;
