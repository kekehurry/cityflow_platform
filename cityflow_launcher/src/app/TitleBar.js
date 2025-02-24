import React, { useState, useEffect } from 'react';
import HomeIcon from '@mui/icons-material/Home';
import { Divider } from '@mui/material';

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
  const addTab = (url) => {
    const newTab = {
      id: Date.now(),
      title: getTitle(url),
      url,
    };
    setTabs((prevTabs) => [...prevTabs, newTab]);
    setActiveTab(newTab.id);
    setNewTabOpen(true);
    // create a new tab in the main process
    window?.electronAPI?.invoke('create-tab', { id: newTab.id, url });
  };

  const closeTab = (id) => {
    const newTabs = tabs.filter((tab) => tab.id !== id);
    setTabs(newTabs);
    // remove the tab in the main process
    window.electronAPI.invoke('close-tab', { id });
    // If the closed tab was active, switch activeTab to the last tab (if any)
    if (activeTab === id && newTabs.length > 0) {
      const newActiveId = newTabs[newTabs.length - 1].id;
      setActiveTab(newActiveId);
      // switch to the new active tab in the main process
      window?.electronAPI?.invoke('switch-tab', { id: newActiveId });
    }
  };

  const handleTabClick = (id) => {
    setActiveTab(id);
    window?.electronAPI?.invoke('switch-tab', { id });
  };

  useEffect(() => {
    if (tabs.length === 0) {
      setActiveTab(false);
    }
  }, [tabs, setNewTabOpen]);

  // Listen for new-window events from the main process
  useEffect(() => {
    window?.electronAPI?.onNewWindow((url) => {
      console.log(url);
      addTab(url);
    });
  }, []);

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
            <>
              <div
                className={`tab ${tab.id === activeTab ? 'active' : ''}`}
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
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
              <Divider orientation="vertical" flexItem />
            </>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TitleBar;
