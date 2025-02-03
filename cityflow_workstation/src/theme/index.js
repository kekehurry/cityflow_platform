import { head } from 'lodash';
import typography from './typography';
import { createTheme } from '@mui/material/styles';

const black = 'rgba(10, 10, 10, 1)';

const theme = createTheme({
  typography,
  palette: {
    mode: 'dark',
    primary: {
      main: 'rgba(144, 202, 249,1)',
      dark: 'rgb(48, 140, 216)',
    },
    secondary: {
      main: 'rgba(206, 147, 216,1)',
      dark: 'rgba(171, 71, 188, 1)',
      grey: 'rgba(66, 66, 66,1)',
    },
    flow: {
      main: black,
      background: 'rgba(75, 75, 75, 0.2)',
    },
    community: {
      main: black,
      background:
        'radial-gradient(circle, rgb(46, 46, 46,0.5),rgba(10, 10, 10, 1))',
    },
    user: {
      main: black,
      background:
        'radial-gradient(circle, rgb(46, 46, 46,0.5),rgba(10, 10, 10, 1))',
    },
    home: {
      background: black,
    },
    node: {
      main: black,
      header: black,
      container: black,
      border: '0.5px solid #424242',
    },
    edge: {
      main: 'rgba(206, 147, 216,1)',
      dark: 'rgba(171, 71, 188, 1)',
    },
    pin: {
      main: black,
      header: black,
      container: black,
      border: '0.5px solid #424242',
    },
    annotation: {
      main: 'rgba(117, 117, 117,1)',
    },
  },
});
export default theme;
