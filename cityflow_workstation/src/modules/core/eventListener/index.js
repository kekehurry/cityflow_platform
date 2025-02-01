//entrypoint.js

import { useEffect, useState } from 'react';
import { TextField, Stack } from '@mui/material';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';

// main function
export default function EventListener(props) {
  const { config, setOutput } = props;
  const [eventType, setEventType] = useState('');

  // Effect to listen for the custom event
  useEffect(() => {
    const handleEvent = (event) => {
      setOutput({ message: event.detail });
    };

    if (eventType && config?.run) {
      window.addEventListener(eventType, handleEvent);
    } else {
      window.removeEventListener(eventType, handleEvent);
      setOutput({ message: null });
    }
    // Cleanup function to remove the event listener
    return () => {
      if (eventType) {
        window.removeEventListener(eventType, handleEvent);
      }
    };
  }, [eventType, setOutput, config?.run]);

  return (
    <Stack
      direction="row"
      style={{
        padding: 3,
        alignItems: 'center',
        width: '100%',
        height: '100%',
      }}
      spacing={1}
    >
      <KeyboardDoubleArrowRightIcon />
      <TextField
        label="event type"
        variant="outlined"
        size="small"
        fullWidth
        value={eventType}
        onChange={(e) => setEventType(e.target.value)}
      />
    </Stack>
  );
}
