import {
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
} from '@mui/material';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import theme from '@/theme';
import { useState } from 'react';

export default function ToggleControls({ tool, setTool }) {
  const handleChange = (event, newValue) => {
    setTool(tool == newValue ? null : newValue);
  };
  return (
    <ToggleButtonGroup size="small">
      <ToggleButton
        value="search"
        onChange={handleChange}
        sx={{
          borderRadius: 10,
          border: 'none',
          backgroundColor:
            tool == 'search'
              ? theme.palette.primary.main
              : theme.palette.secondary.gray,
          opacity: 1,
          height: 25,
          m: 0.5,
          pl: 1,
          pr: 1,
          '& :hover': {
            color: theme.palette.primary.main,
            background: theme.palette.secondary.gray,
          },
        }}
      >
        <Stack direction="row" spacing={1}>
          <BubbleChartIcon />
          <Typography variant="caption">Knowledge Graph</Typography>
        </Stack>
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
