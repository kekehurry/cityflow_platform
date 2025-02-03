'use client';
import {
  Box,
  Button,
  Typography,
  Stack,
  CircularProgress,
  IconButton,
  ToggleButtonGroup,
  Avatar,
  ToggleButton,
} from '@mui/material';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import CommunityShowcase from '@/app/community/utils/CommunityShowcase';
import CommunityFlows from '@/app/community/utils/CommunityFlows';
import CommunityModules from '@/app/community/utils/CommunityModules';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SearchIcon from '@mui/icons-material/Search';
import theme from '@/theme';
import { initStore } from '@/store/actions';
import { connect } from 'react-redux';

const mapStateToProps = (state, ownProps) => {
  return {
    state: state,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  initStore: (state) => dispatch(initStore(state)),
});

const Community = () => {
  const [homeLoading, setHomeLoading] = useState(false);
  const [flowLoading, setFlowLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showFlow, setShowFlow] = useState(true);

  const handleTabChange = (event, newValue) => {
    setShowFlow(newValue);
  };

  useEffect(() => {
    window.onscroll = () => {
      if (window.scrollY > window.innerHeight / 4) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    return () => {
      window.onscroll = null;
    };
  }, []);

  return (
    <>
      <Box sx={{ position: 'absolute', top: 80, right: 80, zIndex: 1 }}>
        <Link
          href="/graph"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
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
              alignItems: 'center',
              ':hover': { border: '2px solid #EA80FC' },
            }}
          >
            <SearchIcon sx={{ fontSize: 30, color: '#9E9E9E' }} />
            {/* <img
              src="/networks.png"
              alt="logo"
              style={{ width: '100%', height: '100%', padding: '12px' }}
            /> */}
          </Box>
        </Link>
      </Box>
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          p: 4,
          background: theme.palette.community.background,
        }}
      >
        <Stack
          spacing={4}
          sx={{ height: '95%', display: 'flex', justifyContent: 'center' }}
        >
          <Stack
            spacing={4}
            sx={{
              width: '40%',
              position: 'absolute',
              top: '20%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Typography variant="h1" textAlign="center">
              Community WorkFlows
            </Typography>
            <Typography variant="h5" textAlign="center">
              Sharing your methods of solving city problems and learn from each
              other.
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
                    setHomeLoading(true);
                  }}
                  sx={{ width: 200, height: 35, borderRadius: 10 }}
                >
                  {homeLoading ? (
                    <CircularProgress size={20} sx={{ color: '#fff' }} />
                  ) : (
                    'Back to Home'
                  )}
                </Button>
              </Link>
            </Stack>
          </Stack>
          <CommunityShowcase />
        </Stack>
        <Footer showBeiAn={!scrolled} />
        <IconButton
          sx={{
            position: 'absolute',
            bottom: scrolled ? '-85%' : -15,
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          onClick={() => {
            // setScrolled(!scrolled);
            window.scrollTo({
              top: scrolled ? 0 : window.innerHeight,
              behavior: 'smooth',
              zIndex: 1,
            });
          }}
        >
          {
            scrolled && <KeyboardArrowUpIcon sx={{ fontSize: 20 }} />
            // : (
            //   <KeyboardArrowDownIcon sx={{ fontSize: 20 }} />
            // )
          }
        </IconButton>
      </Box>
      <Box
        sx={{
          width: '100vw',
          height: '85vh',
          p: 10,
          pt: 0,
          overflow: 'auto',
          background: theme.palette.community.background,
        }}
      >
        <Box
          sx={{ display: 'flex', height: '30px', mb: 3 }}
          justifyContent="center"
        >
          <ToggleButtonGroup
            value={showFlow}
            exclusive
            onChange={handleTabChange}
            aria-label="text alignment"
          >
            <ToggleButton value={true} aria-label="show flows">
              Flows
            </ToggleButton>
            <ToggleButton value={false} aria-label="show modules">
              Modules
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        {showFlow ? <CommunityFlows /> : <CommunityModules />}
      </Box>
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Community);
