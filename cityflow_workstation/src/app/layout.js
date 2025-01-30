'use client';
import React from 'react';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@/theme';
import store from '@/store/store';
import { Provider } from 'react-redux';
import './global.css';

const RootLayout = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <title>CityFlow</title>
        <link rel="icon" href="/favicon.ico" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* Open Graph Meta Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="CityFlow" />
        <meta
          property="og:description"
          content="CityFlow is a versatile tool that allows users to design, evaluate, and visualize urban solutions through an llm-integrated, case-based system. Leveraging Python and JavaScript modules, CityFlow empowers urban analysts, city planners, and researchers to address real-world city challenges by creating customized workflows for urban problem-solving."
        />
        <meta
          property="og:image"
          content="https://raw.githubusercontent.com/kekehurry/cityflow_platform/refs/heads/main/cityflow_workstation/public/static/home.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content="http://cityflow.media.mit.edu/" />

        {/* Twitter Card Meta Tags for social sharing */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CityFlow" />
        <meta
          name="twitter:description"
          content="CityFlow is a versatile tool that allows users to design, evaluate, and visualize urban solutions through an llm-integrated, case-based system. Leveraging Python and JavaScript modules, CityFlow empowers urban analysts, city planners, and researchers to address real-world city challenges by creating customized workflows for urban problem-solving."
        />
        <meta
          name="twitter:image"
          content="https://raw.githubusercontent.com/kekehurry/cityflow_platform/refs/heads/main/cityflow_workstation/public/static/home.png"
        />

        {/* Canonical Link */}
        <link rel="canonical" href="http://cityflow.media.mit.edu/" />
      </head>
      <body>
        <main>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Provider store={store}>{children}</Provider>
          </ThemeProvider>
        </main>
      </body>
    </html>
  );
};

export default RootLayout;
