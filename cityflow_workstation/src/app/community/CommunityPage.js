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
import { useEffect, useState } from 'react';
import CommunityFlows from '@/app/community/utils/CommunityFlows';
import theme from '@/theme';
import { initStore } from '@/store/actions';
import { connect } from 'react-redux';
import CachedIcon from '@mui/icons-material/Cached';
import {
  getCommunityMenu,
  getCommunityFlow,
  useLocalStorage,
} from '@/utils/local';
import { saveWorkflow } from '@/utils/dataset';
import { set } from 'lodash';

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
        value.forEach((flowURL) => {
          const p = getCommunityFlow(flowURL).then((flow) => {
            if (flow) {
              flow.category = key;
              index += 1;
              setProgress(`Fetching ${index}/${totalLength} ...`);
              return saveWorkflow(flow);
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
    getCommunityMenu().then((menu) => {
      setMenu(menu);
      fetchFlows(menu).then(() => {
        setLoading(false);
      });
    });
  };

  useEffect(() => {
    if (!menu) {
      handleUpdate();
    }
  }, [menu]);

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
        <Typography variant="h3" sx={{ mt: 2, mb: 3 }}>
          Featured
        </Typography>
        <CommunityFlows
          params={{ category: 'featured' }}
          cardWidth={'36vw'}
          cardHeight={200}
          cols={2}
        />
      </Box>
      <Tabs
        value={tab}
        onChange={handleTabChange}
        aria-label="basic tabs example"
      >
        {Object.keys(menu)
          .filter((k) => k != 'basic' && k != 'featured')
          .map((key, index) => (
            <Tab key={key} label={key} />
          ))}
        <Tab key={'workflow'} label="Workflow" />
      </Tabs>
      <Box sx={{ pt: 2 }}>
        {Object.keys(menu)
          .filter((k) => k != 'basic' && k != 'featured')
          .map(
            (key, index) =>
              tab == index && (
                <CommunityFlows
                  key={index}
                  params={{ category: key }}
                  cardWidth={200}
                  cardHeight={200}
                  cols={5}
                />
              )
          )}
        {tab == Object.keys(menu).length + 1 && (
          <CommunityFlows
            params={{ private: false, category: null }}
            cardWidth={'36vw'}
            cardHeight={200}
            cols={2}
          />
        )}
      </Box>
      {loading ? (
        <Stack direction="row" spacing={2}>
          <Typography>{progress}</Typography>
          <CircularProgress size={25} sx={{ color: 'white' }} />
        </Stack>
      ) : (
        <Tooltip title="Update" aria-label="update">
          <IconButton
            sx={{
              position: 'fixed',
              bottom: 20,
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
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Community);
