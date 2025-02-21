import { Box, Tabs, Tab, IconButton, Hidden } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { addNode, updateMeta } from '@/store/actions';
import { connect } from 'react-redux';

import theme from '@/theme';
import FlowSetting from './utils/FlowSetting';
import ModuleList from './utils/ModuleList';
import FlowAssistant from './utils/FlowAssistant';
import WestIcon from '@mui/icons-material/West';

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
    if (!props.state?.isAlive) {
      setTab(0);
    } else {
      setTab(1);
    }
  }, [props.state?.isAlive]);

  return (
    <>
      <Box sx={{ pl: 2, pt: 2 }}>
        <IconButton onClick={() => (window.location.href = '/')}>
          <WestIcon />
        </IconButton>
      </Box>
      <Box
        id="FlowPanel"
        onKeyDown={(event) => {
          // Prevent this event from bubbling up to the parent
          event.stopPropagation();
        }}
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
            width: '100%',
            height: 'auto',
            p: 1,
            pl: 2,
            pt: 2,
          }}
        >
          <FlowSetting tab={tab} />
          <ModuleList tab={tab} />
          <Box hidden={tab != 2}>
            <FlowAssistant height="75vh" width="100%" />
          </Box>
        </Box>

        <Box
          sx={{
            backgroundColor: theme.palette.flow.main,
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
            textColor="primary"
            indicatorColor="primary"
            sx={{
              width: '100%',
              height: 5,
              mt: 1,
              pb: 1,
            }}
          >
            <Tab
              label="Settings"
              sx={{
                fontSize: 12,
                width: '30%',
              }}
            />
            <Tab
              label="Modules"
              sx={{
                fontSize: 12,
                width: '30%',
              }}
              disabled={!props.state.isAlive}
            />
            <Tab
              label="Assistant"
              sx={{
                fontSize: 12,
                width: '30%',
              }}
            />
          </Tabs>
        </Box>
      </Box>
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(FlowPanel);
