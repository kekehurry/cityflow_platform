import React, { useEffect, useState } from 'react';
import { DialogsProvider } from '@toolpad/core/useDialogs';
import './global.css';
import HomeBackground from './HomeBackground';
import Settings from './Settings';
import Footer from './Footer';
import TitleBar from './TitleBar';

const App = () => {
  const [newTabOpen, setNewTabOpen] = useState(false);
  return (
    <div className="app">
      <DialogsProvider>
        <TitleBar setNewTabOpen={setNewTabOpen} />
        {newTabOpen || <HomeBackground />}
        {newTabOpen || <Settings />}
        {newTabOpen || <Footer />}
      </DialogsProvider>
    </div>
  );
};

export default App;
