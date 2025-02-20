'use client';
import { useEffect, useState } from 'react';
import UserPage from './utils/UserPage';
import GraphPage from './utils/GraphPage';
import CommunityPage from './utils/CommunityPage';
import Navigation from './utils/Navigation';
import ResizableDrawer from '@/components/ResizableDrawer';
import AssistantPage from '@/components/Chatbot/AssistantPage';
import theme from '@/theme';

export default function Interface() {
  const [menu, setMenu] = useState('Home');
  const [childrenOne, setChildrenOne] = useState(null);
  const [childrenTwo, setChildrenTwo] = useState(null);

  const navigationBar = <Navigation menu={menu} setMenu={setMenu} />;
  const graphPage = <GraphPage />;
  const userPage = <UserPage />;
  const assistantPage = (
    <AssistantPage
      width="70%"
      background={theme.palette.assistant.background}
    />
  );
  const communityPage = <CommunityPage />;

  useEffect(() => {
    switch (menu) {
      case 'Home':
        setChildrenOne(navigationBar);
        setChildrenTwo(userPage);
        break;
      case 'Community':
        setChildrenOne(navigationBar);
        setChildrenTwo(communityPage);
        break;
      case 'Search':
        setChildrenOne(navigationBar);
        setChildrenTwo(graphPage);
        break;
      case 'Assistant':
        setChildrenOne(navigationBar);
        setChildrenTwo(assistantPage);
        break;
      default:
        break;
    }
  }, [menu]);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
      }}
    >
      <ResizableDrawer
        direction="horizontal"
        childrenOne={childrenOne}
        childrenTwo={childrenTwo}
      />
    </div>
  );
}
