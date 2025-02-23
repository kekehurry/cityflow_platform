import React from 'react';
import { Typography, Stack, Divider } from '@mui/material';
import theme from './theme';

export default function Footer() {
  return (
    <>
      <Divider
        orientation="horizontal"
        sx={{ width: '100%', bottom: '6%', position: 'absolute' }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            justifyContent: 'center',
            cursor: 'pointer',
            textDecoration: 'none',
            color: theme.palette.text.secondary,
          }}
        >
          <Typography
            variant="h6"
            onClick={() => window.open('http://doc.cityflow.cn/', '_blank')}
          >
            Documents
          </Typography>
          <Divider orientation="vertical" flexItem />
          <Typography
            variant="h6"
            onClick={() =>
              window.open('https://youtu.be/vQ12teqOgdU', '_blank')
            }
          >
            Videos
          </Typography>
          <Divider orientation="vertical" flexItem />
          <a
            href="https://github.com/kekehurry"
            target="_blank"
            style={{
              color: theme.palette.text.secondary,
              textDecoration: 'none',
            }}
          >
            <Typography variant="h6">Github</Typography>
          </a>
          <Divider orientation="vertical" flexItem />
          <Typography
            variant="h6"
            onClick={() => window.open('http://arhukai.com/', '_blank')}
          >
            Contact
          </Typography>
        </Stack>
      </Divider>
    </>
  );
}
