import { useState, useEffect } from 'react';
import { Box, SpeedDial, SpeedDialIcon, SpeedDialAction } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PublishIcon from '@mui/icons-material/Publish';

export default function ControlButtons({
  config,
  formValue,
  setConfig,
  setCodeSubmited,
}) {
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    const dateTime = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
    setConfig({
      ...config,
      ...formValue,
      time: dateTime,
    });
    setCodeSubmited(true);
  };

  const handleSave = () => {
    const dateTime = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
    //save to localStorage
    const newManifest = {
      ...config,
      ...formValue,
      run: false,
      time: dateTime,
      custom: true,
      basic: false,
    };
    window.dispatchEvent(
      new CustomEvent('localModulesChange', { detail: newManifest })
    );
  };

  const actions = [
    { icon: <PublishIcon />, name: 'Submit', action: handleSubmit },
    { icon: <SaveIcon />, name: 'Save', action: handleSave },
  ];

  return (
    <Box sx={{ position: 'absolute', top: 400, right: 330 }}>
      <SpeedDial
        ariaLabel="SpeedDial basic example"
        size="small"
        icon={<SpeedDialIcon sx={{ minHeight: 0, minWidth: 0 }} />}
        FabProps={{ size: 'small' }}
        open={open}
        onClick={() => setOpen(!open)}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.action}
          />
        ))}
      </SpeedDial>
    </Box>
  );
}
