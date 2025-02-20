'use client';
import FlowPanel from './FlowPanel';
import FlowStation from './FlowStation';
import ResizableDrawer from '@/components/ResizableDrawer';

export default function FlowPage() {
  const flowPanel = <FlowPanel />;
  const flowStation = <FlowStation />;

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
