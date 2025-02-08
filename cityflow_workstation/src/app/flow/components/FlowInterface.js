import FlowPanel from './FlowPanel';
import FlowStation from './FlowStation';
import ResizableDrawer from '@/components/ResizableDrawer';
import { useSearchParams } from 'next/navigation';

export default function FlowInterface() {
  const searchParams = useSearchParams();
  const embed = searchParams.get('embed');

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
      }}
    >
      {embed ? (
        <>
          <FlowStation />
        </>
      ) : (
        <ResizableDrawer
          direction="horizontal"
          childrenOne={<FlowPanel />}
          childrenTwo={<FlowStation />}
        />
      )}
    </div>
  );
}
