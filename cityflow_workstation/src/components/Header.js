import Link from 'next/link';
import theme from '@/theme';
import SearchIcon from '@mui/icons-material/Search';
import AppsIcon from '@mui/icons-material/Apps';
import HomeIcon from '@mui/icons-material/Home';
import { useState, useEffect } from 'react';
import {
  Toolbar,
  AppBar,
  Menu,
  Typography,
  MenuItem,
  IconButton,
  ListItemText,
  ListItemIcon,
} from '@mui/material';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const Header = (props) => {
  const { actions, runButtons } = props;
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div style={{ position: 'relative' }}>
      <AppBar
        position="fixed"
        variant="outlined"
        color="transparent"
        sx={{
          top: 0,
          bottom: 'auto',
          border: 'none',
          borderBottom: 0.1,
          borderColor: 'divider',
        }}
      >
        <Toolbar
          variant="dense"
          sx={{
            background: theme.palette.flow.main,
            minHeight: '6vh',
            p: 0,
            m: 0,
            paddingRight: 0,
            paddingLeft: 0,
          }}
        >
          <>
            <IconButton onClick={handleClick}>
              <img
                src={`${basePath}/static/cflogo.png`}
                alt="Community Logo"
                style={{ width: '13px', height: '13px' }}
              />
            </IconButton>
            {actions && actions.length > 0 && (
              <Menu
                anchorEl={anchorEl}
                onClose={handleClose}
                onClick={handleClose}
                transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                open={open}
              >
                {actions.map((action) => (
                  <MenuItem
                    key={action.name}
                    sx={{ paddingRight: 5 }}
                    onClick={action.onClick}
                  >
                    <ListItemIcon>{action.icon}</ListItemIcon>
                    <ListItemText primary={action.name} />
                  </MenuItem>
                ))}
              </Menu>
            )}
          </>
          <Link
            href="/author"
            style={{
              color: theme.palette.text.primary,
              textDecoration: 'none',
            }}
          >
            <IconButton aria-label="graph search">
              <HomeIcon />
            </IconButton>
          </Link>
          <Link
            href="/community"
            style={{
              color: theme.palette.text.primary,
              textDecoration: 'none',
            }}
          >
            <IconButton aria-label="community">
              <AppsIcon />
            </IconButton>
          </Link>
          <Link
            href="/graph"
            style={{
              color: theme.palette.text.primary,
              textDecoration: 'none',
            }}
          >
            <IconButton aria-label="community">
              <SearchIcon />
            </IconButton>
          </Link>
          <Typography
            variant="h5"
            component="div"
            sx={{ paddingLeft: 1, flexGrow: 1, fontWeight: 'bold' }}
          >
            <Link
              href="/"
              style={{
                color: theme.palette.text.primary,
                textDecoration: 'none',
              }}
            >
              CITY FLOW
            </Link>
          </Typography>
          {runButtons && runButtons}
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Header;
