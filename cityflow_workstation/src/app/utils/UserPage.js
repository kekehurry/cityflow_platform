'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Stack,
  CircularProgress,
} from '@mui/material';

import theme from '@/theme';
import { initStore } from '@/store/actions';
import { connect } from 'react-redux';
import { saveWorkflow } from '@/utils/dataset';
import { initUserId } from '@/utils/local';
import AddToPhotosIcon from '@mui/icons-material/AddToPhotos';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FlowList from '@/components/FlowList';
import Link from 'next/link';

const mapStateToProps = (state, ownProps) => {
  return {
    state: state,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  initStore: (state) => dispatch(initStore(state)),
});

const UserPage = () => {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const handleUpload = () => {
    const upload = new Promise((resolve, reject) => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.oninput = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        setLoading(true);
        reader.onload = (e) => {
          const flow = JSON.parse(e.target.result);
          if (flow) {
            flow.author_id = userId;
            flow.private = true;
            resolve(flow);
          }
        };
        reader.readAsText(file);
      };
      fileInput.click();
    });
    upload.then((flow) => {
      saveWorkflow(flow).then((res) => {
        setLoading(false);
        window.open('/', '_self');
      });
    });
  };

  useEffect(() => {
    initUserId().then((id) => {
      setUserId(id);
    });
  });

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        p: 10,
        pt: 0,
        overflow: 'auto',
        background: theme.palette.user.background,
      }}
    >
      <Typography variant="h3" sx={{ mt: 5, mb: 2 }}>
        Create New Workflow
      </Typography>
      <Stack spacing={2} direction={'row'}>
        <Button
          variant="contained"
          sx={{
            background: theme.palette.secondary.gray,
            width: 150,
            height: 80,
            border: '1px solid #313131',
            borderRadius: 4,
          }}
          onClick={() => {
            window.open('/flow', '_blank');
          }}
        >
          <Stack direction="row" spacing={1}>
            <AddToPhotosIcon sx={{ width: 25, height: 25 }} />
            <Typography variant="caption">New Workflow</Typography>
          </Stack>
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          sx={{
            background: theme.palette.secondary.gray,
            width: 150,
            height: 80,
            border: '1px solid #313131',
            borderRadius: 4,
          }}
        >
          {loading ? (
            <CircularProgress size={20} sx={{ color: '#fff' }} />
          ) : (
            <Stack direction="row" spacing={1}>
              <FileUploadIcon sx={{ width: 25, height: 25 }} />
              <Typography variant="caption">{'Upload WorkFlow'}</Typography>
            </Stack>
          )}
        </Button>
      </Stack>
      <Typography variant="h3" sx={{ mt: 5, mb: 3 }}>
        My WorkFlows
      </Typography>
      <FlowList params={{ author_id: userId, private: true }} />
    </Box>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(UserPage);
