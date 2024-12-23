import { Box, Tabs, Tab } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { addNode, updateMeta } from '@/store/actions';
import { connect } from 'react-redux';

import theme from '@/theme';
import { keepAlive } from '@/utils/executor';
import FlowSetting from './FlowSetting';
import ModuleList from './ModuleList';

const mapStateToProps = (state, ownProps) => ({
  state: state,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  setNode: (node) => dispatch(addNode({ ...node })),
  setMeta: (meta) => dispatch(updateMeta(meta)),
});

export const FlowPanel = (props) => {
  const [tab, setTab] = useState(1);
  // change panel tab
  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };
  // Set the tab to modulePanel if the flow is inited
  useEffect(() => {
    if (props.state?.flowInited) {
      setTab(1);
    } else {
      setTab(0);
    }
  }, [props.state?.flowInited]);

  // Keep the flow container alive
  useEffect(() => {
    let interval;
    if (props.state?.flowInited) {
      interval = setInterval(
        () => keepAlive(props.state?.flowId, props.state?.image),
        1000 * 30
      );
    }
    return () => {
      interval && clearInterval(interval);
    };
  }, [props.state.flowId, props.state.flowInited]);

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
            minHeight: '150vh',
            height: 'auto',
            p: 1,
            pl: 2,
            pt: 10,
          }}
        >
          <FlowSetting tab={tab} />
          <ModuleList tab={tab} />
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
              height: 10,
              mt: 1,
              pb: 1,
            }}
          >
            <Tab label="flowSettings" />
            <Tab label="modulePanel" disabled={!props.state?.flowInited} />
          </Tabs>
        </Box>
      </Box>
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(FlowPanel);
