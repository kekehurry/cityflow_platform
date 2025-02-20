import theme from '@/theme';
import { Box, Stack, Typography, Divider, IconButton } from '@mui/material';
import React, { useState } from 'react';
import Link from 'next/link';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import ArticleIcon from '@mui/icons-material/Article';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SearchIcon from '@mui/icons-material/Search';
import MenuCard from './utils/MenuCard';
import MainSetting from './utils/MainSetting';
import CodeIcon from '@mui/icons-material/Code';

export default function Navigation({ menu, setMenu }) {
  const [open, setOpen] = useState(false);

  const handleClick = (name) => {
    setMenu(name);
  };

  return (
    <Stack spacing={1} sx={{ pl: 2 }}>
      <Stack direction="row" spacing={2} sx={{ pt: 5, pl: 3, width: '90%' }}>
        <img src="/static/cflogo.png" alt="logo" width="25px" height="25px" />
        <Typography variant="h2" sx={{ fontSize: 24 }}>
          CityFlow
        </Typography>
      </Stack>
      <Stack
        spacing={2}
        sx={{ pt: 3, pl: 0.5, width: '90%', height: '75vh', display: 'flex' }}
      >
        <MenuCard
          icon={<HomeIcon />}
          name="Home"
          onClick={handleClick}
          menu={menu}
        />
        <MenuCard
          icon={<LocalLibraryIcon />}
          name="Community"
          onClick={handleClick}
          menu={menu}
        />
        <MenuCard
          icon={<SearchIcon />}
          name="Search"
          onClick={handleClick}
          menu={menu}
        />
        <MenuCard
          icon={<SmartToyIcon />}
          name="Assistant"
          onClick={handleClick}
          menu={menu}
        />
        <Box sx={{ paddingTop: 1, flexGrow: 1 }} />
        <Link href="https://doc.cityflow.cn/" target="_blank">
          <MenuCard
            icon={<ArticleIcon />}
            name="Documents"
            height={35}
            onClick={handleClick}
            menu={menu}
          />
        </Link>
        <Link
          href="https://github.com/kekehurry/cityflow_platform/"
          target="_blank"
        >
          <MenuCard
            icon={<CodeIcon />}
            name="Repository"
            height={35}
            onClick={handleClick}
            menu={menu}
          />
        </Link>
      </Stack>
      <Divider sx={{ pb: 2 }} />
      <Stack direction="row" sx={{ pt: 2, pl: 1, opacity: 0.8 }}>
        <IconButton>
          <SettingsIcon onClick={() => setOpen(true)} />
        </IconButton>
      </Stack>
      <MainSetting open={open} setOpen={setOpen} />
    </Stack>
  );
}
