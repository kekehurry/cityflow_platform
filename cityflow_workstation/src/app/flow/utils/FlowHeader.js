import React, { useState, useCallback, useEffect } from 'react';
import {
  Toolbar,
  AppBar,
  Menu,
  Typography,
  MenuItem,
  IconButton,
  ListItemText,
  ListItemIcon,
  Button,
  CircularProgress,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DownloadIcon from '@mui/icons-material/Download';
import { useReactFlow } from 'reactflow';
import { upload } from '@/utils/local';
import ShareBoard from './ShareBoard';
import Link from 'next/link';
import theme from '@/theme';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined';
import SearchIcon from '@mui/icons-material/Search';
import AppsIcon from '@mui/icons-material/Apps';
import HomeIcon from '@mui/icons-material/Home';
import { runAll, stopAll, initStore, updateMeta } from '@/store/actions';
import { connect } from 'react-redux';
import { setupExecutor, killExecutor } from '@/utils/executor';
import { saveUserFlow } from '@/utils/local';
import { saveWorkflow } from '@/utils/dataset';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const mapStateToProps = (state, ownProps) => {
  return {
    state: state,
    configs: state.nodes
      .filter((node) => node.type === 'base')
      .map((node) => node.config?.run),
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  runAll: () => dispatch(runAll()),
  stopAll: () => dispatch(stopAll()),
  updateStore: (state) => dispatch(initStore(state)),
  setMeta: (meta) => dispatch(updateMeta(meta)),
});

const FlowHeader = (props) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogName, setDialogName] = useState('Share');
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [globalRun, setGlobalRun] = useState(false);

  const { runAll, stopAll, setMeta } = props;

  const initAndRunALL = async () => {
    setMeta({ loading: true });
    if (!props.state.isAlive) {
      let logs = '';
      for await (const chunk of await setupExecutor(
        props.state?.flowId,
        props.state?.packages,
        props.state?.image
      )) {
        logs += chunk;
        setMeta({ logs });
      }
      setMeta({ isAlive: true, loading: false });
    }
    runAll();
  };

  const killContainerAndStopAll = () => {
    setMeta({ loading: true });
    killExecutor(props.state.flowId).then(() => {
      stopAll();
      setMeta({ loading: false });
    });
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const rfInstance = useReactFlow();

  const actions = [
    {
      icon: <SaveIcon />,
      name: 'Save',
      onClick: () => {
        saveUserFlow({ rfInstance, state: props.state });
      },
    },
    {
      icon: <DownloadIcon />,
      name: 'Download',
      onClick: () => {
        setDialogOpen(true);
        setDialogName('Download');
      },
    },
    {
      icon: <FileUploadIcon />,
      name: 'Upload',
      onClick: useCallback(
        () => upload(rfInstance, props.updateStore),
        [rfInstance, props.state]
      ),
    },
    {
      icon: <RestartAltIcon />,
      name: 'Reset',
      onClick: () => {
        window.location.href =
          process.env.NEXT_PUBLIC_BASE_PATH || '' + '/flow';
      },
    },
  ];

  useEffect(() => {
    if (props.configs.includes(false)) {
      setGlobalRun(false);
    }
  }, [props.configs]);

  return (
    <>
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
            background: theme.palette.flow.header,
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
          </>
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
            <IconButton aria-label="graph search">
              <SearchIcon />
            </IconButton>
          </Link>
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
          <IconButton
            color={props.state.isAlive ? 'primary' : 'secondary'}
            sx={{
              '&:hover': {
                color: props.state.isAlive
                  ? theme.palette.primary.dark
                  : theme.palette.secondary.dark,
              },
            }}
            onClick={() => {
              globalRun ? killContainerAndStopAll() : initAndRunALL();
              setGlobalRun(!globalRun);
            }}
          >
            {props.state.loading ? (
              <CircularProgress
                color={props.state.isAlive ? 'primary' : 'secondary'}
                size={30}
              />
            ) : globalRun ? (
              <StopCircleOutlinedIcon sx={{ fontSize: 35 }} />
            ) : (
              <PlayCircleIcon sx={{ fontSize: 35 }} />
            )}
          </IconButton>
          <Button
            variant="contained"
            color={props.state.isAlive ? 'primary' : 'secondary'}
            onClick={() => {
              setDialogOpen(true);
              setDialogName('Share');
            }}
            sx={{ width: 80, height: 30, borderRadius: 10 }}
          >
            Share
          </Button>
        </Toolbar>
      </AppBar>
      <ShareBoard
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        name={dialogName}
      />
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(FlowHeader);
