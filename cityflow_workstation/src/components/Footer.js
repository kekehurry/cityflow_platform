import { Typography, Stack, Divider } from '@mui/material';
import theme from '@/theme';

export default function Footer() {
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
    </>
  );
}
