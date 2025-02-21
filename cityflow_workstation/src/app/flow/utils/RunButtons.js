import {
  Box,
  IconButton,
  Button,
  CircularProgress,
  Typography,
  Stack,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined';
import { runAll, stopAll, initStore, updateMeta } from '@/store/actions';
import theme from '@/theme';
import { connect } from 'react-redux';
import { setupExecutor, check } from '@/utils/executor';
import { useState } from 'react';
import { getLocalStorage } from '@/utils/local';

const defaultRunner = getLocalStorage('DEFAULT_RUNNER');

const mapStateToProps = (state, ownProps) => {
  return {
    state: state,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  runAll: () => dispatch(runAll()),
  stopAll: () => dispatch(stopAll()),
  updateStore: (state) => dispatch(initStore(state)),
  setMeta: (meta) => dispatch(updateMeta(meta)),
});

const RunButtons = (props) => {
  const {
    runAll,
    stopAll,
    setMeta,
    setDialogOpen,
    setDialogName,
    share,
    size,
  } = props;
  const [globalRun, setGlobalRun] = useState(false);

  const initAndRunALL = async () => {
    setMeta({ loading: true });
    if (!props.state.isAlive && props.state?.flowId) {
      let logs = '';
      for await (const chunk of await setupExecutor(
        props.state.flowId,
        props.state?.packages || '',
        props.state?.image || defaultRunner
      )) {
        logs += chunk;
        setMeta({ logs });
      }
    }
    while (true) {
      const data = await check(props.state.flowId);
      if (data?.alive) {
        runAll();
        setMeta({ loading: false });
        break;
      }
    }
  };

  return (
    <Stack
      direction="row"
      spacing={1}
      style={{ zIndex: 1110, display: 'flex', alignItems: 'center' }}
    >
      <IconButton
        color="primary"
        sx={{ zIndex: 1111, ml: 1 }}
        onClick={() => {
          globalRun && props.state.isAlive ? stopAll() : initAndRunALL();
          setGlobalRun(!globalRun);
        }}
      >
        {props.state.loading ? (
          <CircularProgress color="primary" size={30} />
        ) : globalRun && props.state.isAlive ? (
          <StopCircleOutlinedIcon sx={{ fontSize: 35 }} />
        ) : (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '50%',
              width: size || 30,
              height: size || 30,
              backgroundColor: theme.palette.primary.main,
              ':hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            <PlayArrowIcon
              sx={{
                color: 'white',
                fontSize: Math.floor(size * 0.9 || 30 * 0.9),
              }}
            />
          </Box>
        )}
      </IconButton>
      {share && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setDialogOpen(true);
            setDialogName('Share');
          }}
          sx={{
            width: 80,
            minWidth: 80,
            height: size || 30,
            borderRadius: 10,
            zIndex: 1111,
          }}
        >
          <Typography
            sx={{
              fontWeight: 'bold',
              fontSize: Math.floor(size * 0.45 || 30 * 0.45),
            }}
          >
            Share
          </Typography>
        </Button>
      )}
    </Stack>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(RunButtons);
