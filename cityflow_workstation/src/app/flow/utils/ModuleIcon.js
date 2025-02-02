import { Box, Stack, Typography, Avatar, IconButton } from '@mui/material';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { connect } from 'react-redux';
import theme from '@/theme';
import { addNode } from '@/store/actions';
import { nanoid } from 'nanoid';
import { useRef, useEffect, useState, memo } from 'react';
import { useGetModule } from '@/utils/dataset';

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
    id: null,
  });
  const { data, error, isLoading } = useGetModule(newManifest.config?.id);

  const latestPropsRef = useRef(props);

  const handleClick = (manifest) => {
    const node = { ...manifest };
    if (!node.config?.custom) {
      node.id = nanoid();
    }
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
    if (!node.config?.custom) {
      node.id = nanoid();
    }
    node.config.category = 'custom';
    node.config.basic = false;
    node.position = { x: newX, y: newY };
    props.setNode(node);
  };

  // delete user module
  const handleDelete = (manifest) => {
    const config = manifest.config;
    let newModules = userModules.filter(
      (m) => !(m.name === config.name && m.category === config.category)
    );
    setUserModules && setUserModules(newModules);
  };

  useEffect(() => {
    latestPropsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (isLoading) return;
    setNewManifest({
      ...newManifest,
      config: data ? data : newManifest.config,
      id: nanoid(),
    });
  }, [isLoading]);

  useEffect(() => {
    const draggableElement = document.getElementById(newManifest.id);
    if (draggableElement) {
      draggableElement.addEventListener('dragend', (e) =>
        handleDragEnd(e, newManifest)
      );
      return () => {
        draggableElement.removeEventListener('dragend', (e) =>
          handleDragEnd(e, newManifest)
        );
      };
    }
  }, [newManifest]);

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
        key={newManifest.id}
        onClick={() => handleClick(newManifest)}
        direction="column"
        spacing={1}
        sx={{
          display: 'flex',
          p: 1,
          width: 65,
          height: 65,
          borderRadius: 2,
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Avatar
          id={newManifest.id}
          alt={newManifest.config.name}
          variant="rounded"
          src={newManifest.config.icon}
          sx={{ width: 30, height: 30 }}
          onDragEnd={(e) => !newManifest.id && handleDragEnd(e, newManifest)}
        />
        <Typography
          variant="caption"
          sx={{
            userSelect: 'none',
            fontSize: 8,
            textAlign: 'center',
            width: 65,
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {newManifest.config.name}
        </Typography>
      </Stack>
    </Box>
  );
};

export default memo(connect(mapStateToProps, mapDispatchToProps)(ModuleIcon));
