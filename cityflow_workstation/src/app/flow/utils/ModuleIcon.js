import { Box, Stack, Typography, Avatar, IconButton } from '@mui/material';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { connect } from 'react-redux';
import theme from '@/theme';
import { addNode } from '@/store/actions';
import { nanoid } from 'nanoid';
import { useRef, useEffect, useState } from 'react';
import { getModule } from '@/utils/dataset';

const mapStateToProps = (state, ownProps) => ({
  state: state,
  viewport: state.viewport,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  setNode: (node) => dispatch(addNode({ ...node })),
});

const ModuleIcon = (props) => {
  const { manifest, edit, userModules, setUserModules } = props;

  const latestPropsRef = useRef(props);

  const handleClick = (manifest) => {
    getModule(manifest.config.id).then((config) => {
      const newManifest = { ...manifest };
      newManifest.id = nanoid();
      newManifest.config = config;
      newManifest.config.category = 'custom';
      newManifest.config.basic = false;
      newManifest.config.custom = true;
      newManifest.position = {
        x: Math.random() * window.innerWidth * 0.3,
        y: Math.random() * window.innerHeight * 0.4 + window.innerHeight * 0.1,
      };
      props.setNode(newManifest);
    });
  };
  const handleDragEnd = (e, manifest) => {
    getModule(manifest.config.id).then((config) => {
      const { x, y, zoom } = latestPropsRef.current.viewport;
      const flowPanel = document.getElementById('FlowPanel');
      const newX = (e.clientX - flowPanel.offsetWidth - x) / zoom;
      const newY = (e.clientY - y) / zoom;
      const newManifest = { ...manifest };
      newManifest.id = nanoid();
      newManifest.config = config;
      newManifest.config.category = 'custom';
      newManifest.config.basic = false;
      newManifest.config.custom = true;
      newManifest.position = { x: newX, y: newY };
      props.setNode(newManifest);
    });
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

  return (
    <Box position="relative">
      {edit && manifest.config.custom && !manifest.config.basic && (
        <IconButton
          onClick={() => {
            handleDelete(manifest);
          }}
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
        key={manifest.id}
        onDragEnd={(e) => handleDragEnd(e, manifest)}
        onClick={() => handleClick(manifest)}
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
          alt={manifest.config.name || manifest.config.title}
          variant="rounded"
          src={manifest.config.icon}
          sx={{ width: 30, height: 30 }}
        />
        <Typography variant="caption" sx={{ userSelect: 'none' }}>
          {manifest.config.name || manifest.config.title}
        </Typography>
      </Stack>
    </Box>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ModuleIcon);
