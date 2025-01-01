import { Typography, Stack, Divider } from '@mui/material';
import { getBeiAn } from '@/utils/local';
import theme from '@/theme';
import { useEffect, useState } from 'react';

export default function Footer({ showBeiAn = true }) {
  const [beiAn, setBeiAn] = useState(null);
  useEffect(() => {
    getBeiAn().then((res) => {
      setBeiAn(res);
    });
  }, []);
  return (
    <>
      <Divider orientation="horizontal" sx={{ width: '100%' }}>
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
          <a
            href=" http://doc.cityflow.cn/"
            style={{
              color: theme.palette.text.secondary,
              textDecoration: 'none',
            }}
          >
            <Typography variant="h6">Documents</Typography>
          </a>
          <Divider orientation="vertical" flexItem />
          <a
            href="https://youtu.be/vQ12teqOgdU"
            style={{
              color: theme.palette.text.secondary,
              textDecoration: 'none',
            }}
          >
            <Typography variant="h6">Videos</Typography>
          </a>
          <Divider orientation="vertical" flexItem />
          <a
            href="/"
            style={{
              color: theme.palette.text.secondary,
              textDecoration: 'none',
            }}
          >
            <Typography variant="h6">CityFlow</Typography>
          </a>
          <Divider orientation="vertical" flexItem />
          <a
            href="https://github.com/kekehurry"
            style={{
              color: theme.palette.text.secondary,
              textDecoration: 'none',
            }}
          >
            <Typography variant="h6">Github</Typography>
          </a>
          <Divider orientation="vertical" flexItem />
          <a
            href="http://arhukai.com/"
            style={{
              color: theme.palette.text.secondary,
              textDecoration: 'none',
            }}
          >
            <Typography variant="h6">Contact</Typography>
          </a>
        </Stack>
      </Divider>
      {showBeiAn && beiAn && (
        <div
          style={{
            width: '100%',
            marginTop: 10,
            justifyContent: 'center',
            display: 'flex',
          }}
        >
          <a
            href="https://beian.miit.gov.cn"
            style={{
              color: '#616161',
              textDecoration: 'none',
            }}
          >
            <Typography variant="h6">{beiAn}</Typography>
          </a>
        </div>
      )}
    </>
  );
}
