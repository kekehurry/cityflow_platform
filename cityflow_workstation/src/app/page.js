'use client';
import { Box, Button, Typography, Stack, Divider } from '@mui/material';
import HomeBackground from '@/components/HomeBackgound';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import theme from '@/theme';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const Home = () => {
  const [flowLoading, setFlowLoading] = useState(false);
  const [authorLoading, setAuthorLoading] = useState(false);
  const [communityLoading, setCommunityLoading] = useState(false);
  return (
    <>
      <Box
        sx={{
          background: theme.palette.home.background,
        }}
      >
        <HomeBackground />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          zIndex: 1,
          p: 4,
        }}
      >
        <Stack spacing={4} sx={{ height: '95%' }}>
          <Stack
            spacing={4}
            sx={{ width: '40%', position: 'absolute', top: '30%' }}
          >
            <Stack direction="row" spacing={4} alignItems="flex-end">
              <img
                src={`${basePath}/static/cflogo.png`}
                alt="Community Logo"
                style={{ width: '90px', height: '90px' }}
              />
              <Typography variant="h1">City Flow</Typography>
            </Stack>
            <Typography variant="h5">
              CityFlow provides a low code environment for building your own
              workflow to discover, evaluate and create solutions for city
              problems.
            </Typography>
            <Stack direction="row" spacing={2}>
              <Link href="/flow" style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => {
                    setFlowLoading(true);
                  }}
                  sx={{ width: 150, height: 35, borderRadius: 10 }}
                >
                  {flowLoading ? (
                    <CircularProgress size={20} sx={{ color: '#fff' }} />
                  ) : (
                    'Get Started'
                  )}
                </Button>
              </Link>
              <Link href="/author" style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => {
                    setAuthorLoading(true);
                  }}
                  sx={{ width: 150, height: 35, borderRadius: 10 }}
                >
                  {authorLoading ? (
                    <CircularProgress size={20} sx={{ color: '#fff' }} />
                  ) : (
                    'Home Page'
                  )}
                </Button>
              </Link>
              <Link href="/community" style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => {
                    setCommunityLoading(true);
                  }}
                  sx={{ width: 200, height: 35, borderRadius: 10 }}
                >
                  {communityLoading ? (
                    <CircularProgress size={20} sx={{ color: '#fff' }} />
                  ) : (
                    'Community WorkFlows'
                  )}
                </Button>
              </Link>
            </Stack>
          </Stack>
        </Stack>
        <Footer />
      </Box>
    </>
  );
};

export default Home;
