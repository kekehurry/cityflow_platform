import React, { useState, useEffect } from 'react';
import theme from './theme';
import HomeIcon from '@mui/icons-material/Home';

const TitleBar = ({ setNewTabOpen }) => {
  // Each tab now includes a url property
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const port = localStorage.getItem('port') || 3000;

  const getTitle = (url) => {
    console.log(url);
    if (url.includes(`/flow`)) {
      return 'Flow';
    } else if (url.includes(`/doc`)) {
      return 'Documents';
    } else if (url.includes(`localhost`)) {
      return 'Home';
    } else {
      return new URL(url).hostname;
    }
  };

  // Updated addTab accepts an optional URL parameter
  const addTab = (url = `http://localhost:${port}/flow`) => {
    const newTab = {
      id: Date.now(),
      title: getTitle(url),
      url,
    };
    setTabs([...tabs, newTab]);
    setActiveTab(newTab.id);
    setNewTabOpen(true);
  };

  const closeTab = (id) => {
    const newTabs = tabs.filter((tab) => tab.id !== id);
    setTabs(newTabs);
    // If the closed tab was active, switch activeTab to the last tab (if any)
    if (activeTab === id && newTabs.length > 0) {
      setActiveTab(newTabs[newTabs.length - 1].id);
    }
  };

  useEffect(() => {
    if (tabs.length === 0) {
      setNewTabOpen(false);
    }
  }, [tabs, setNewTabOpen]);

  //   Listen to electron new-window-open
  useEffect(() => {
    if (window?.electronAPI) {
      window.electronAPI.onNewWindowOpen((event, { url }) => {
        addTab(url);
      });
    }
  }, []);

  // Override window.open
  useEffect(() => {
    const originalWindowOpen = window.open;
    window.open = (url, name, features) => {
      addTab(url);
    };
    return () => {
      window.open = originalWindowOpen;
    };
  }, [addTab]);

  // Get the currently active tab
  const currentTab = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="titlebar-container">
      <div className="titlebar">
        <div className="window-controls">
          <button
            className="window-button close"
            onClick={() => window?.electronAPI?.closeWindow()}
          ></button>
          <button
            className="window-button minimize"
            onClick={() => window?.electronAPI?.minimizeWindow()}
          ></button>
          <button
            className="window-button maximize"
            onClick={() => window?.electronAPI?.maximizeWindow()}
          ></button>
        </div>
        <div className="tabs">
          {tabs.map((tab) => (
            <div
              className={`tab ${tab.id === activeTab ? 'active' : ''}`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.title == 'Home' ? (
                <HomeIcon sx={{ width: 15, height: 15 }} />
              ) : (
                <>
                  <span>{tab.title}</span>
                  <button
                    className="tab-close"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      {currentTab && (
        <div className="tab-content">
          <iframe
            title={currentTab.title}
            src={currentTab.url}
            style={{
              width: '100vw',
              height: '100vh',
              border: 'none',
              background: theme.palette.flow.background,
            }}
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default TitleBar;
