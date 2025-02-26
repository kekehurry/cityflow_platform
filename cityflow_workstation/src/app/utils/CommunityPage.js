'use client';
import {
  Box,
  Typography,
  Stack,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { useState, useEffect } from 'react';
import FlowList from '@/components/FlowList';
import theme from '@/theme';
import { initStore } from '@/store/actions';
import { connect } from 'react-redux';
import CachedIcon from '@mui/icons-material/Cached';
import {
  getCommunityMenu,
  getCommunityFlow,
  useLocalStorage,
  getLocalStorage,
} from '@/utils/local';

const mapStateToProps = (state, ownProps) => {
  return {
    state: state,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  initStore: (state) => dispatch(initStore(state)),
});

const Community = () => {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [menu, setMenu] = useLocalStorage('COMMUNITY_MENU', null);
  const [showTooltop, setShowTooltip] = useState(false);
  const communityURL =
    getLocalStorage('COMMUNITY_URL') || 'https://community.cityflow.cn';
  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const fetchFlows = async (menu) => {
    const flowPromises = [];
    let index = 0;
    const totalLength = Object.entries(menu).reduce(
      (acc, [key, value]) => acc + value.length,
      0
    );
    Object.entries(menu).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((url) => {
          const p = getCommunityFlow(url).then((data) => {
            if (data) {
              index += 1;
              setProgress(`Fetching workflows ${index}/${totalLength} ...`);
            }
          });
          flowPromises.push(p);
        });
      }
    });
    await Promise.all(flowPromises);
  };

  const handleUpdate = () => {
    setLoading(true);
    setProgress(`Fetching menu ...`);
    getCommunityMenu(communityURL).then((menu) => {
      setMenu(menu);
      fetchFlows(menu).then(() => {
        setLoading(false);
        window.location.reload();
      });
    });
  };

  // useEffect(() => {
  //   if (!menu && !loading) {
  //     handleUpdate();
  //   }
  // }, [menu, loading]);

  return (
    <Stack
      sx={{
        width: '100%',
        height: '100%',
        p: 4,
        background: theme.palette.community.background,
        overflow: 'auto',
      }}
    >
      <Box>
        <Typography variant="h3" sx={{ pl: 2 }}>
          Featured
        </Typography>
        <FlowList
          params={{ category: 'featured' }}
          cardWidth={'36vw'}
          cardHeight={'14vw'}
          cols={2}
        />
      </Box>
      <Tabs
        value={tab}
        onChange={handleTabChange}
        aria-label="basic tabs example"
        sx={{ pl: 2 }}
      >
        {menu &&
          Object.keys(menu)
            .filter((k) => k != 'basic' && k != 'featured')
            .map((key, index) => <Tab key={key} label={key} />)}
        <Tab key={'workflow'} label="Workflow" />
      </Tabs>
      <Box sx={{ pt: 1, height: '100%', overflow: 'auto' }}>
        {menu &&
          Object.keys(menu)
            .filter((k) => k != 'basic' && k != 'featured')
            .map(
              (key, index) =>
                tab == index && (
                  <FlowList key={index} params={{ category: key }} cols={5} />
                )
            )}
        {menu && tab == Object.keys(menu).length + 1 && (
          <FlowList params={{ private: false }} cols={2} />
        )}
      </Box>
      <Stack
        direction={'row'}
        alignItems={'center'}
        justifyContent={'space-between'}
        sx={{
          width: '100%',
        }}
      >
        <Typography
          sx={{
            position: 'relative',
            opacity: 0.5,
            color: '#616161',
            fontSize: 12,
            cursor: 'pointer',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
          onClick={() => window.open(communityURL, '_blank')}
        >
          CityFlow Community
        </Typography>
        {loading ? (
          <Stack
            direction="row"
            spacing={2}
            sx={{
              position: 'absolute',
              right: 20,
              opacity: 0.5,
            }}
          >
            <Typography>{progress}</Typography>
            <CircularProgress size={25} sx={{ color: 'white' }} />
          </Stack>
        ) : (
          <Tooltip
            title="Update community workflows here"
            open={!menu || showTooltop}
            onClose={() => setShowTooltip(false)}
            arrow
            placement="left"
            componentsProps={{
              arrow: { sx: { color: theme.palette.primary.main } },
              tooltip: {
                sx: {
                  height: 30,
                  backgroundColor: theme.palette.primary.main,
                  fontSize: 12,
                },
              },
            }}
          >
            <IconButton
              sx={{
                position: 'absolute',
                right: 20,
                opacity: 0.5,
              }}
              onClick={handleUpdate}
            >
              <CachedIcon
                sx={{
                  width: 25,
                  height: 25,
                }}
              />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Stack>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Community);
