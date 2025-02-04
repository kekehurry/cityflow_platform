import { head } from 'lodash';
import typography from './typography';
import { createTheme } from '@mui/material/styles';
import PinBoard from '@/app/flow/utils/PinBoard';

const black = 'rgba(15, 17, 18, 1)';

const theme = createTheme({
  typography,
  palette: {
    mode: 'dark',
    primary: {
      // linear gradient
      main: 'rgb(116, 63, 245)',
      dark: 'rgb(100, 44, 240)',
      hex: '#733ff5',
    },
    secondary: {
      main: 'rgb(184, 134, 198)',
      dark: 'rgb(174, 94, 196)',
      grey: 'rgba(66, 66, 66,1)',
    },
    flow: {
      main: black,
      grid: '#424242',
      background: 'rgb(30, 31, 32)',
      pinBoard: 'rgba(20, 21, 22, 1)',
    },
    community: {
      main: black,
      background:
        'radial-gradient(circle, rgba(36, 38, 39,1),rgba(10, 10, 10, 1))',
    },
    graph: {
      link: '#607D8B',
      node: '#BBDEFB',
      highlight: 'rgba(116, 63, 245,1)',
    },
    user: {
      main: black,
      background:
        'radial-gradient(circle, rgba(36, 38, 39,1),rgba(10, 10, 10, 1))',
    },
    home: {
      background:
        'radial-gradient(circle, rgba(36, 38, 39,1),rgba(10, 10, 10, 1))',
    },
    node: {
      main: black,
      header: black,
      container: black,
      border: '0.5px solid rgb(50, 50, 50)',
    },
    edge: {
      main: 'rgb(149, 109, 248)',
      dark: 'rgba(116, 63, 245,1)',
    },
    pin: {
      main: black,
      header: black,
      container: black,
      border: '0.5px solid rgb(31, 31, 31)',
    },
    annotation: {
      main: 'rgba(117, 117, 117,1)',
    },
  },
});
export default theme;
