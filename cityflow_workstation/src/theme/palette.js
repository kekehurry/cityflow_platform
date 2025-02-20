const black = 'rgba(22, 22, 25, 1)';
const secondaryBlack = 'rgba(22, 22, 25, 1)';
const thirdBlack = 'rgba(30, 31, 35, 1)';
const gray = 'rgba(40, 41, 45,1)';
const lightGray = 'rgba(117, 117, 117,1)';

const palette = {
  mode: 'dark',
  primary: {
    // linear gradient
    main: 'rgb(116, 63, 245)',
    dark: 'rgb(100, 44, 240)',
    hex: '#733ff5',
    border: `1.2px solid ${gray}`,
  },
  secondary: {
    main: 'rgb(184, 134, 198)',
    dark: 'rgb(174, 94, 196)',
    gray: gray,
  },
  flow: {
    main: black,
    grid: '#424242',
    background: thirdBlack,
    pinBoard: secondaryBlack,
  },
  community: {
    main: black,
    background: secondaryBlack,
  },
  graph: {
    link: '#607D8B',
    node: '#BBDEFB',
    highlight: 'rgba(116, 63, 245,1)',
    background: secondaryBlack,
  },
  user: {
    main: black,
    background: secondaryBlack,
  },
  assistant: {
    background: secondaryBlack,
  },
  node: {
    main: black,
    header: black,
    container: black,
    border: `0.5px solid ${gray}`,
  },
  edge: {
    main: 'rgb(149, 109, 248)',
    dark: 'rgba(116, 63, 245,1)',
  },
  pin: {
    main: black,
    header: black,
    container: black,
    border: `0.5px solid ${gray}`,
  },
  annotation: {
    main: lightGray,
  },
};

export default palette;
