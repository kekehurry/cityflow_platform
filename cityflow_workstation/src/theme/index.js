import { head } from "lodash";
import typography from "./typography";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography,
  palette: {
    mode: "dark",
    // secondary: {
    //   main: "#AEEA00",
    //   dark: "#C6FF00",
    // },
    flow:{
      main: "rgba(64, 64, 64, 0.1)",
      header: "#0a0a0a",
      panel: "#0a0a0a",
      pinBoard: {
        main: "#0a0a0a",
        secondary: "#0a0a0a",
      },
      shareBoard: "#0a0a0a",
    },
    community:{
      main: "rgba(128, 128, 128, 0.1)",
    },
    home:{
      main: "rgba(64, 64, 64, 0.05)",
    },
    node:{
      main: "#0a0a0a",
      header: "#0a0a0a",
      container: "#0a0a0a",
    },
    edge:{
      main: "#CE93D8",
      dark: "rgba(171, 71, 188, 1)",
    },
    pin:{
      main: "#212121",
      header: "#0a0a0a",
      container: "#0a0a0a",
    },
    annotation:{
      main: "#757575",
    },
  },
});
export default theme;
