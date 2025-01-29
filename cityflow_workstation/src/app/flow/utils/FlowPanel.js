import { Box, Tabs, Tab } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { addNode, updateMeta } from '@/store/actions';
import { connect } from 'react-redux';

import theme from '@/theme';
import FlowSetting from './FlowSetting';
import ModuleList from './ModuleList';
import ChatAssistant from './ChatAssistant';

const mapStateToProps = (state, ownProps) => ({
  state: state,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  setNode: (node) => dispatch(addNode({ ...node })),
  setMeta: (meta) => dispatch(updateMeta(meta)),
});

export const FlowPanel = (props) => {
  const [tab, setTab] = useState(0);
  // change panel tab
  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };
  // Set the tab to modulePanel if the flow is inited
  useEffect(() => {
    if (!props.state?.flowInited) {
      setTab(0);
    } else {
      setTab(1);
    }
  }, [props.state?.flowInited]);

  return (
    <>
      <Box
        id="FlowPanel"
        sx={{
          width: '100%',
          height: '100vh',
          scrollbarWidth: 'none',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <Box
          variant="outlined"
          sx={{
            scrollbarWidth: 'none',
            minHeight: '100vh',
            height: 'auto',
            p: 1,
            pl: 2,
            pt: 10,
          }}
        >
          <FlowSetting tab={tab} />
          <ModuleList tab={tab} />
          <ChatAssistant tab={tab} />
        </Box>
        <Box
          sx={{
            backgroundColor: theme.palette.flow.panel,
            position: 'absolute',
            width: '100%',
            height: 100,
            bottom: 0,
            p: 1,
            pl: 2,
          }}
        >
          <Tabs
            value={tab}
            onChange={handleTabChange}
            centered
            sx={{
              width: '100%',
              height: 5,
              mt: 1,
              pb: 1,
            }}
          >
            <Tab label="Settings" sx={{ fontSize: 12, width: '30%' }} />
            <Tab label="Modules" sx={{ fontSize: 12, width: '30%' }} />
            <Tab label="Assistant" sx={{ fontSize: 12, width: '30%' }} />
          </Tabs>
        </Box>
      </Box>
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(FlowPanel);
