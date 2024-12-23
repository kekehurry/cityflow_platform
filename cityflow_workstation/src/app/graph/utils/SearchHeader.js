import { Toolbar, AppBar, Typography, IconButton } from '@mui/material';
import Link from 'next/link';
import theme from '@/theme';
import SearchIcon from '@mui/icons-material/Search';
import AppsIcon from '@mui/icons-material/Apps';
import HomeIcon from '@mui/icons-material/Home';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const SearchHeader = (props) => {
  return (
    <div style={{ position: 'relative' }}>
      <AppBar
        position="fixed"
        variant="outlined"
        color="transparent"
        sx={{
          top: 0,
          bottom: 'auto',
          border: 'none',
          borderBottom: 0.1,
          borderColor: 'divider',
        }}
      >
        <Toolbar
          variant="dense"
          sx={{
            background: theme.palette.flow.header,
            minHeight: '6vh',
            p: 0,
            m: 0,
            paddingRight: 0,
            paddingLeft: 0,
          }}
        >
          <Link
            href="/flow"
            style={{
              color: theme.palette.text.primary,
              textDecoration: 'none',
            }}
          >
            <IconButton aria-label="workstation">
              <img
                src={`${basePath}/static/cflogo.png`}
                alt="Community Logo"
                style={{ width: '13px', height: '13px' }}
              />
            </IconButton>
          </Link>
          <Link
            href="/community"
            style={{
              color: theme.palette.text.primary,
              textDecoration: 'none',
            }}
          >
            <IconButton aria-label="community">
              <AppsIcon />
            </IconButton>
          </Link>
          <Link
            href="/graph"
            style={{
              color: theme.palette.text.primary,
              textDecoration: 'none',
            }}
          >
            <IconButton aria-label="community">
              <SearchIcon />
              {/* <img
                src="/networks_white.png"
                alt="Dataset"
                style={{ width: '15px', height: '15px' }}
              /> */}
            </IconButton>
          </Link>
          <Link
            href="/author"
            style={{
              color: theme.palette.text.primary,
              textDecoration: 'none',
            }}
          >
            <IconButton aria-label="graph search">
              <HomeIcon />
            </IconButton>
          </Link>
          <Typography
            variant="h5"
            component="div"
            sx={{ paddingLeft: 1, flexGrow: 1, fontWeight: 'bold' }}
          >
            <Link
              href="/"
              style={{
                color: theme.palette.text.primary,
                textDecoration: 'none',
              }}
            >
              CITY FLOW
            </Link>
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default SearchHeader;
