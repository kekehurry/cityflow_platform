'use client';
import UserPage from './user/UserPage';
import SearchPage from './graph/SearchPage';
import CommunityPage from './community/CommunityPage';
import { useEffect, useState } from 'react';
import Navigation from './navigation/Navigation';

import ResizableDrawer from '@/components/ResizableDrawer';
import AssistantPage from '@/components/Chatbot/AssistantPage';
import theme from '@/theme';

export default function Interface() {
  const [menu, setMenu] = useState('Home');
  const [childrenOne, setChildrenOne] = useState(null);
  const [childrenTwo, setChildrenTwo] = useState(null);

  const navigationBar = <Navigation menu={menu} setMenu={setMenu} />;
  const searchPage = <SearchPage />;
  const userPage = <UserPage />;
  const assistantPage = (
    <AssistantPage width="70%" background={theme.palette.flow.background} />
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
        setChildrenTwo(searchPage);
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
