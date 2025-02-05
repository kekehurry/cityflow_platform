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
import { searchModule, useSearchModule } from '@/utils/dataset';

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
            m.name === manifest.config.name &&
            m.category === manifest.config.category
        )
    );
  }, []);

  return (
    <Box position="relative">
      <Stack
        key={manifest.id}
        onClick={() => {
          window.location.href = '/flow?module=' + manifest.id;
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
          alt={manifest.config.name}
          variant="rounded"
          src={manifest.config.icon}
          sx={{ width: 30, height: 30 }}
        />
        <Typography variant="caption" sx={{ userSelect: 'none' }}>
          {manifest.config.name}
        </Typography>
        {/* {hover && (
          <Radio
            size="small"
            sx={{
              position: 'absolute',
              top: -9,
              right: 0,
              zIndex: 1,
              '& .MuiSvgIcon-root': { fontSize: 10 },
              color: isSaved
                ? theme.palette.secondary.main
                : theme.palette.secondary.gray,
            }}
            checked={isSaved}
          />
        )} */}
      </Stack>
    </Box>
  );
};

const CommunityModules = () => {
  const [communityModuleList, setCommunityModuleList] = useState([]);
  const { data, error, isLoading } = useSearchModule({ custom: true });

  const moduleManifest = {
    type: 'expandUI',
    module: 'builder',
    version: '0.0.1',
  };

  // Fetches custom modules from server
  useEffect(() => {
    if (data) {
      data.forEach((config) => {
        config.custom = false;
        config.expand = false;
        config.run = false;
      });
      const uniqueItems = data?.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.name === item.name)
      );
      setCommunityModuleList(uniqueItems);
    }
  }, [data]);

  return (
    <Stack key={'custom'} direction="column" alignItems="left" spacing={1}>
      <ImageList cols={6}>
        {communityModuleList.map((config) => {
          const { id, ...info } = config;
          const newManifest = { ...moduleManifest };
          newManifest.id = id;
          newManifest.config = { ...info };
          return <ModuleIcon key={id} manifest={newManifest} />;
        })}
      </ImageList>
    </Stack>
  );
};

export default CommunityModules;
