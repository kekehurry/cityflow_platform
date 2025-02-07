import {
  Box,
  Stack,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { connect } from 'react-redux';
import theme from '@/theme';
import { addNode } from '@/store/actions';
import { nanoid } from 'nanoid';
import { useRef, useEffect, useState, memo } from 'react';
import { useGetModule, deleteModule } from '@/utils/dataset';

const mapStateToProps = (state, ownProps) => ({
  state: state,
  viewport: state.viewport,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  setNode: (node) => dispatch(addNode({ ...node })),
});

const ModuleIcon = (props) => {
  const { manifest, edit, userModules, setUserModules } = props;
  const [newManifest, setNewManifest] = useState({
    ...manifest,
  });
  const { data, error, isLoading } = useGetModule(newManifest.config?.id);

  const latestPropsRef = useRef(props);

  const handleClick = (manifest) => {
    const node = { ...manifest };
    node.id = nanoid();
    node.config.category = 'custom';
    node.config.basic = false;
    node.position = {
      x: Math.random() * window.innerWidth * 0.3,
      y: Math.random() * window.innerHeight * 0.4 + window.innerHeight * 0.1,
    };
    props.setNode(node);
  };
  const handleDragEnd = (e, manifest) => {
    const node = { ...manifest };
    const { x, y, zoom } = latestPropsRef.current.viewport;
    const flowPanel = document.getElementById('FlowPanel');
    const newX = (e.clientX - flowPanel.offsetWidth - x) / zoom;
    const newY = (e.clientY - y) / zoom;
    node.id = nanoid();
    node.config.category = 'custom';
    node.config.basic = false;
    node.position = { x: newX, y: newY };
    props.setNode(node);
  };

  // delete user module
  const handleDelete = (manifest) => {
    const moduleId = manifest.config?.id;
    deleteModule(moduleId).then((res) => {
      setUserModules(userModules.filter((module) => module.id !== moduleId));
    });
  };

  useEffect(() => {
    latestPropsRef.current = props;
  }, [props]);

  useEffect(() => {
    data &&
      setNewManifest({
        ...newManifest,
        config: data,
      });
  }, [data]);

  return (
    <Box position="relative">
      {edit && newManifest.config.custom && !newManifest.config.basic && (
        <IconButton
          onClick={() => handleDelete(newManifest)}
          size="small"
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            zIndex: 1,
          }}
        >
          <RemoveCircleIcon fontSize="small" color="red" />
        </IconButton>
      )}
      <Stack
        key={newManifest.name}
        onClick={() => handleClick(newManifest)}
        onDragEnd={(e) => handleDragEnd(e, newManifest)}
        direction="column"
        spacing={1}
        sx={{
          display: 'flex',
          p: 1,
          width: 50,
          height: 50,
          borderRadius: 2,
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Tooltip title={newManifest.config.name} placement="top" arrow>
          <Avatar
            alt={newManifest.config.name}
            variant="rounded"
            src={newManifest.config.icon}
            sx={{ width: 30, height: 30 }}
          />
        </Tooltip>
      </Stack>
    </Box>
  );
};

export default memo(connect(mapStateToProps, mapDispatchToProps)(ModuleIcon));
