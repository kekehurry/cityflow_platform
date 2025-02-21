import theme from '@/theme';
import {
  Box,
  Stack,
  Typography,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import ArticleIcon from '@mui/icons-material/Article';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SearchIcon from '@mui/icons-material/Search';
import CodeIcon from '@mui/icons-material/Code';

import MenuCard from './utils/MenuCard';
import MainSetting from './utils/MainSetting';

import { getLocalStorage } from '@/utils/local';

export default function Navigation({ menu, setMenu }) {
  const [open, setOpen] = useState(false);
  const llmConfig = getLocalStorage('LLM_CONFIG');
  const [showTooltip, setShowTooltip] = useState(
    llmConfig?.apiKey == '' || llmConfig?.apiKey == undefined
  );

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
        <Tooltip
          title="Set your API KEY here"
          open={showTooltip}
          onClose={() => setShowTooltip(false)}
          arrow
          placement="right"
          componentsProps={{
            arrow: { sx: { color: theme.palette.primary.main } },
            tooltip: {
              sx: {
                height: 30,
                backgroundColor: theme.palette.primary.main,
                fontSize: 12,
              },
            },
          }}
        >
          <IconButton>
            <SettingsIcon onClick={() => setOpen(true)} />
          </IconButton>
        </Tooltip>
      </Stack>
      <MainSetting open={open} setOpen={setOpen} />
    </Stack>
  );
}
