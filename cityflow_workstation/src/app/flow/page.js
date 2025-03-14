'use client';
import FlowPanel from './FlowPanel';
import FlowStation from './FlowStation';
import ResizableDrawer from '@/components/ResizableDrawer';
import { useEffect } from 'react';

import { useDialogs } from '@toolpad/core/useDialogs';

export default function FlowPage() {
  const flowPanel = <FlowPanel />;
  const flowStation = <FlowStation />;

  const dialogs = useDialogs();
  useEffect(() => {
    window.alert = dialogs.alert;
    window.confirm = dialogs.confirm;
    window.prompt = dialogs.prompt;
  }, [dialogs]);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
      }}
    >
      <ResizableDrawer
        direction="horizontal"
        childrenOne={flowPanel}
        childrenTwo={flowStation}
      />
    </div>
  );
}
