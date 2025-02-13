'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Stack,
  CircularProgress,
  Tooltip,
  Avatar,
} from '@mui/material';
import UserFlows from './utils/UserFlows';
import theme from '@/theme';
import { initStore } from '@/store/actions';
import { connect } from 'react-redux';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getAuthor, useSearchWorkflow, getWorkflow } from '@/utils/dataset';
import { initUserId, useLocalStorage, download } from '@/utils/local';
import Footer from '@/components/Footer';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import multiavatar from '@multiavatar/multiavatar/esm';

const mapStateToProps = (state, ownProps) => {
  return {
    state: state,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  initStore: (state) => dispatch(initStore(state)),
});

const UserPage = () => {
  const [homeLoading, setHomeLoading] = useState(false);
  const [flowLoading, setFlowLoading] = useState(false);
  const [edit, setEdit] = useState(false);
  const [items, setItems] = useState([]);

  const [displayName, setDisplayName] = useState('');
  const [author, setAuthor] = useLocalStorage('author', null);
  const [authorId, setAuthorId] = useState(null);
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [userId, setUserId] = useState(null);
  const basicData = useSearchWorkflow({ tutorial: true });
  const { data, error, isLoading } = useSearchWorkflow({ author_id: userId });

  const handleDownload = () => {
    if (!data) return;
    data.map((flow) => {
      getWorkflow(flow.id).then((flowData) => {
        flowData && download(flowData);
      });
    });
  };

  useEffect(() => {
    initUserId().then((userId) => {
      setUserId(userId);
      author || setAuthor(`user_${userId.slice(0, 4)}`);
      setAuthorId(id || userId);
    });
  }, [id]);

  useEffect(() => {
    getAuthor(authorId)
      .then((data) => {
        data?.name && setAuthor(data?.name);
      })
      .catch((err) => console.log(err))
      .finally(() => {
        setDisplayName(author);
      });
  }, [authorId]);

  useEffect(() => {
    if (data && data.length > 0) {
      const uniqueItems = data?.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t?.name === item?.name)
      );
      setItems(uniqueItems);
    } else {
      basicData?.data && setItems(basicData.data.slice(0, 1));
    }
    if (isLoading) {
      setItems(
        Array.from({ length: 4 }, (_, i) => i + 1).map((i) => {
          return {
            id: i,
            name: '',
            description: '',
            screenShot: '/static/fetching_large.gif',
          };
        })
      );
    }
  }, [data, error, isLoading, basicData?.data, authorId]);

  return (
    <>
      <Box sx={{ position: 'absolute', top: 80, right: 80, zIndex: 1 }}>
        <Tooltip title="Download all your workflows">
          <Box
            sx={{
              width: 50,
              height: 50,
              border: '1px solid #424242',
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #212121 30%, #424242 90%)',
              textAlign: 'center',
              display: 'flex',
              justifyContent: 'center',
              cursor: 'pointer',
              alignItems: 'center',
              ':hover': { border: `2px solid ${theme.palette.primary.main}` },
            }}
            onClick={handleDownload}
          >
            <CloudDownloadIcon sx={{ fontSize: 30, color: '#9E9E9E' }} />
          </Box>
        </Tooltip>
      </Box>
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          p: 10,
          pt: 0,
          overflow: 'auto',
          background: theme.palette.user.background,
        }}
      >
        <Stack
          spacing={4}
          sx={{ height: '45%', display: 'flex', justifyContent: 'center' }}
        >
          <Stack
            spacing={4}
            sx={{
              width: '40%',
              position: 'absolute',
              top: '20%',
              left: '50%',
              alignItems: 'center',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Avatar
              sx={{ width: 100, height: 100, boxShadow: '0 0 10px 0 #9E9E9E' }}
            >
              <img
                style={{ width: 100, height: 100 }}
                src={
                  authorId &&
                  `data:image/svg+xml;utf8,${encodeURIComponent(
                    multiavatar(authorId)
                  )}`
                }
              />
            </Avatar>
            <Typography variant="h1" textAlign="center">
              {displayName}
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              sx={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Link href="/flow" style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setFlowLoading(true);
                  }}
                  sx={{ width: 150, height: 35, borderRadius: 10 }}
                >
                  {flowLoading ? (
                    <CircularProgress size={20} sx={{ color: '#fff' }} />
                  ) : (
                    'Get Start'
                  )}
                </Button>
              </Link>
              <Link href="/community" style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setHomeLoading(true);
                  }}
                  sx={{ width: 200, height: 35, borderRadius: 10 }}
                >
                  {homeLoading ? (
                    <CircularProgress size={20} sx={{ color: '#fff' }} />
                  ) : (
                    'Community Flows'
                  )}
                </Button>
              </Link>
              {authorId && authorId === userId && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setEdit(!edit);
                    if (edit) {
                      window.location.reload();
                    }
                  }}
                  sx={{ width: 150, height: 35, borderRadius: 10 }}
                >
                  {edit ? 'Stop Edit' : 'Manage Flows'}
                </Button>
              )}
            </Stack>
          </Stack>
        </Stack>
        <UserFlows items={items} edit={edit} />
        <Box
          sx={{
            position: 'absolute',
            bottom: 40,
            width: '90%',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <Footer />
        </Box>
      </Box>
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(UserPage);
