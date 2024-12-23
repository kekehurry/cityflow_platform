import {
  Box,
  ImageList,
  Stack,
  Typography,
  Avatar,
  Radio,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import theme from '@/theme';
import { searchModule } from '@/utils/dataset';

const ModuleIcon = ({ manifest }) => {
  const [hover, setHover] = useState(false);
  const [isSaved, setSaved] = useState(false);
  let data = localStorage.getItem('cs_flow');
  const localModuleList = data ? JSON.parse(data).customModules : [];

  useEffect(() => {
    setSaved(
      localModuleList &&
        localModuleList.some(
          (m) =>
            m.title === manifest.config.title &&
            m.category === manifest.config.category
        )
    );
  }, []);

  useEffect(() => {
    let data = localStorage.getItem('cs_flow');
    data = data ? JSON.parse(data) : {};
    data.customModules = data.customModules || [];
    data.customModules = data.customModules.filter(
      (m) =>
        !(
          m.title === manifest.config.title &&
          m.category === manifest.config.category
        )
    );
    if (isSaved) data.customModules.push(manifest.config);
    localStorage.setItem('cs_flow', JSON.stringify(data));
    // Dispatch the custom event to notify the app of the change
    window.dispatchEvent(new Event('localStorageChange'));
  }, [isSaved]);

  return (
    <Box position="relative">
      <Stack
        key={manifest.id}
        onDoubleClick={() => {
          window.location.href = '/flow?module=' + manifest.config.id;
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        display="flex"
        direction="column"
        justifyContent="center"
        alignItems="center"
        spacing={1}
        sx={{
          p: 1,
          height: 100,
          borderRadius: 2,
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        }}
      >
        <Avatar
          alt={manifest.config.title}
          variant="rounded"
          src={manifest.config.icon}
          sx={{ width: 30, height: 30 }}
        />
        <Typography variant="caption" sx={{ userSelect: 'none' }}>
          {manifest.config.title}
        </Typography>
        {hover && (
          <Radio
            size="small"
            sx={{
              position: 'absolute',
              top: -9,
              right: 0,
              zIndex: 1,
              '& .MuiSvgIcon-root': { fontSize: 10 },
              color: isSaved ? theme.palette.secondary.main : '#424242',
            }}
            onClick={() => setSaved(!isSaved)}
            checked={isSaved}
          />
        )}
      </Stack>
    </Box>
  );
};

const CommunityModules = () => {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const [communityModuleList, setCommunityModuleList] = useState([]);

  const moduleManifest = {
    type: 'expandUI',
    module: 'builder',
    version: '0.0.1',
  };

  // Fetches custom modules from server
  useEffect(() => {
    const params = { custom: true };
    searchModule(params).then((communityModuleList) => {
      communityModuleList.forEach((config) => {
        config.custom = false;
        config.expand = false;
        config.run = false;
      });
      const uniqueItems = communityModuleList?.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.title === item.title)
      );
      setCommunityModuleList(uniqueItems);
    });
  }, []);

  return (
    <Stack key={'custom'} direction="column" alignItems="left" spacing={1}>
      <ImageList cols={6}>
        {communityModuleList.map((config) => {
          const id = nanoid();
          const newManifest = { ...moduleManifest };
          newManifest.id = id;
          newManifest.config = { ...config };
          return <ModuleIcon key={id} manifest={newManifest} />;
        })}
      </ImageList>
    </Stack>
  );
};

export default CommunityModules;
