import React, { useEffect, useState } from 'react';
import theme from '@/theme';
import { TextField, Stack } from '@mui/material';
import DragHandleIcon from '@mui/icons-material/DragHandle';

const Previewer = (props) => {
  const { config, setConfig } = props;
  const [edit, setEdit] = useState(false);
  const [value, setValue] = useState(config.url || 'https://doc.cityflow.cn');

  return edit ? (
    <TextField
      className="nowheel nodrag"
      autoFocus
      variant="standard"
      onKeyDown={(e) => {
        if (e.shiftKey && e.key === 'Enter') {
          setEdit(false);
        }
      }}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      sx={{ width: '100%', minHeight: 0, height: '100%' }}
    />
  ) : (
    <Stack
      onDoubleClick={() => setEdit(true)}
      style={{
        display: 'flex',
        width: config.width,
        height: config.height,
        border: 'none',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <iframe
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          position: 'relative',
          background: 'white',
          zoom: (config.width * 3) / window.innerWidth,
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
        }}
        src={value}
      />
      <div
        style={{
          padding: 2,
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: '#424242',
          marginTop: 10,
        }}
      />
    </Stack>
  );
};

export default Previewer;
