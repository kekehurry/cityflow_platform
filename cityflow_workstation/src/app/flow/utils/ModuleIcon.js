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
    id: nanoid(),
  });
  const { data, error, isLoading } = useGetModule(manifest.config?.id);

  const latestPropsRef = useRef(props);

  const handleClick = (manifest) => {
    const node = { ...manifest };
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
    if (!data) return;
    setNewManifest({ ...newManifest, config: data });
  }, [data]);

  useEffect(() => {
    if (newManifest.module == 'builder' && !newManifest.config?.code) return;
    const draggableElement = document.getElementsByClassName(
      `${newManifest.id}`
    )[0];
    if (draggableElement) {
      draggableElement.addEventListener('dragend', (e) =>
        handleDragEnd(e, newManifest)
      );
    }
    return () => {
      if (draggableElement) {
        draggableElement.removeEventListener('dragend', (e) =>
          handleDragEnd(e, newManifest)
        );
      }
    };
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
        alignItems="center"
        spacing={1}
        sx={{
          p: 1,
          borderRadius: 2,
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        }}
      >
        <Avatar
          id={`${newManifest.id}`}
          className={`${newManifest.id}`}
          alt={newManifest.config.name}
          variant="rounded"
          src={newManifest.config.icon}
          sx={{ width: 30, height: 30 }}
          onDragEnd={(e) => handleDragEnd(e, newManifest)}
        />
        <Typography variant="caption" sx={{ userSelect: 'none' }}>
          {newManifest.config.name}
        </Typography>
      </Stack>
    </Box>
  );
};

export default memo(connect(mapStateToProps, mapDispatchToProps)(ModuleIcon));
