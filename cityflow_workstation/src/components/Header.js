import theme from '@/theme';
import { useState } from 'react';
import { Stack, IconButton, Tooltip, Box, Divider } from '@mui/material';

const Header = (props) => {
  const { actions, runButtons, width, height, bottom } = props;
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Stack
      direction="row"
      sx={{
        position: 'absolute',
        background: theme.palette.flow.main,
        height: height || '5.5vh',
        width: width || '50%',
        zIndex: 1111,
        bottom: bottom || '2vh',
        left: '50%',
        pl: 3,
        pr: 3,
        alignItems: 'center',
        justifyContent: 'center',
        border: `0.2px solid rgba(61,61,61,0.75)`,
        borderRadius: '5.5vh',
        transform: 'translateX(-50%)',
        boxShadow: '0px 0px 5px 0px rgba(21,21,21,0.75)',
      }}
    >
      {actions &&
        actions.length > 0 &&
        actions.map((action) => (
          <div key={action.name}>
            <Tooltip key={action.name} title={action.name}>
              <Box
                sx={{
                  display: 'flex',
                  width: '50px',
                  height: '35px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  '& :hover': {
                    color: theme.palette.primary.main,
                  },
                }}
                onClick={action.onClick}
              >
                {action.icon}
              </Box>
            </Tooltip>
            <Divider
              orientation="vertical"
              sx={{
                height: '80%',
                alignItems: 'center',
                opacity: 0.5,
              }}
            />
          </div>
        ))}
      <Box sx={{ flexGrow: 1 }} />
      {runButtons && runButtons}
    </Stack>
  );
};

export default Header;
