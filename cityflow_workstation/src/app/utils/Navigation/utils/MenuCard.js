import { Card, Stack, Typography, Box } from '@mui/material';
import theme from '@/theme';

export default function MenuCard({
  icon,
  name,
  menu,
  onClick,
  height = 40,
  padding = 1,
}) {
  return (
    <Card
      variant="outlined"
      onClick={() => onClick(name)}
      sx={{
        p: padding,
        pl: 2,
        height: height,
        display: 'flex',
        border: 'none',
        background: menu == name ? theme.palette.primary.main : 'none',
        alignItems: 'center',
        borderRadius: '10px',
        transition: 'background-color 0.3s ease',
        '&:hover': {
          backgroundColor: theme.palette.secondary.gray,
        },
        cursor: 'pointer',
      }}
    >
      <Stack
        direction={'row'}
        justifyContent="space-between"
        sx={{ width: '40%' }}
      >
        <Box
          sx={{
            width: '30px',
            height: '30px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '5px',
          }}
        >
          {icon}
        </Box>
        <Typography
          sx={{
            pl: 2,
            display: 'flex',
            width: '80%',
            alignItems: 'center',
          }}
        >
          {name}
        </Typography>
      </Stack>
    </Card>
  );
}
