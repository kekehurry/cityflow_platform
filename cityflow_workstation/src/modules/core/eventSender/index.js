import { useEffect, useState } from 'react';
import { TextField, Stack } from '@mui/material';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';

export default function EventSender(props) {
  const { input, config, setConfig, setOutput } = props;

  const [eventType, setEventType] = useState(config?.eventType || '');

  const sendCustomEvent = (eventType, eventData) => {
    if (!eventType) {
      console.error('Event type is required');
      return;
    }
    const event = new CustomEvent(eventType, { detail: eventData });
    window.dispatchEvent(event);
  };

  useEffect(() => {
    setConfig({ ...config, eventType });
  }, [eventType]);

  useEffect(() => {
    if (config?.run && input?.message) {
      sendCustomEvent(eventType, input?.message);
      setOutput({ output: input?.message });
    } else {
      setOutput({ output: null });
    }
  }, [config?.run, input?.message]);

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
      <TextField
        label="event type"
        variant="outlined"
        size="small"
        fullWidth
        value={eventType}
        onChange={(e) => setEventType(e.target.value)}
      />
      <KeyboardDoubleArrowRightIcon />
    </Stack>
  );
}
