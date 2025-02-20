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
import { getLocalStorage, useLocalStorage } from '@/utils/local';
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
  // const communityURL = getLocalStorage('COMMUNITY_URL');
  const [communityURL, setCommunityURL] = useLocalStorage(
    'COMMUNITY_URL',
    'https://raw.githubusercontent.com/kekehurry/cityflow_platform/refs/heads/dev/cityflow_database/json/community_workflows.json'
  );

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    console.log(newValue);
  };

  const handleUpdate = () => {
    if (!communityURL) return;
    setLoading(true);
    fetch(communityURL)
      .then((res) => res.json())
      .then((data) => {
        console.log('fetch basic data');
        Array.isArray(data?.basic) &&
          data.basic.forEach((item) =>
            fetch(item)
              .then((res) => res.json())
              .then((flow) => {
                flow.basic = true;
                flow.private = false;
                saveWorkflow(flow);
              })
          );
        console.log('fetch tutorial data');
        Array.isArray(data?.tutorial) &&
          data.tutorial.forEach((item) =>
            fetch(item)
              .then((res) => res.json())
              .then((flow) => {
                flow.tutorial = true;
                flow.private = false;
                saveWorkflow(flow);
              })
          );
        console.log('fetch showcase data');
        Array.isArray(data?.showcase) &&
          data.showcase.forEach((item) =>
            fetch(item)
              .then((res) => res.json())
              .then((flow) => {
                flow.showcase = true;
                flow.private = false;
                saveWorkflow(flow);
              })
          );
      })
      .finally(() => {
        setLoading(false);
      });
  };

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
          Tutorial
        </Typography>
        <CommunityFlows
          params={{ tutorial: true }}
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
        <Tab label="Showcase" />
        <Tab label="WorkFlows" />
      </Tabs>
      <Box sx={{ pt: 2 }}>
        {tab == 0 && <CommunityFlows params={{ showcase: true }} />}
        {tab == 1 && (
          <CommunityFlows
            params={{ private: false, showcase: false, tutorial: false }}
          />
        )}
      </Box>
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
          {loading ? (
            <CircularProgress size={25} />
          ) : (
            <CachedIcon
              sx={{
                width: 25,
                height: 25,
              }}
            />
          )}
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Community);
