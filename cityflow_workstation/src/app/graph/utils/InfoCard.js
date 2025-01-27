import { Box, Card, CardContent, Typography, Stack, Fade } from '@mui/material';
import { useState } from 'react';
import theme from '@/theme';

export default function InfoCard({ width, height }) {
  const description = 'description';
  const author = 'author';
  const name = 'name';

  return (
    <Card
      sx={{
        position: 'fixed',
        top: 40,
        right: 50,
        minWidth: 100,
        minHeight: 300,
        maxHeight: 600,
        borderRadius: 2,
        height: height,
        width: width,
        cursor: 'pointer',
      }}
      style={{
        // backgroundImage: `url(${screenShot})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'left',
      }}
    >
      <CardContent
        sx={{
          backgroundColor: 'linear-gradient(45deg, #004D40 30%, #212121 90%)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {name}
        </Typography>
        <Fade in={true}>
          <Stack spacing={1}>
            <Typography variant="caption">{`${description}`}</Typography>
            <Typography
              variant="body1"
              sx={{ color: theme.palette.secondary.dark }}
            >{`@${author}`}</Typography>
          </Stack>
        </Fade>
      </CardContent>
    </Card>
  );
}
