'use client';
import { useState } from 'react';
import SearchList from './utils/SearchList';
import GraphViewer from './utils/GraphViewer';
// import SearchList from './utils/SearchList';
import ResizableDrawer from '@/components/ResizableDrawer';
import SearchHeader from './utils/SearchHeader';

export default function GraphSearch() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [results, setResults] = useState([]);
  const graphViewer = (
    <GraphViewer
      setResults={setResults}
      selectedNode={selectedNode}
      setSelectedNode={setSelectedNode}
    />
  );
  const searchList = (
    <SearchList
      results={results}
      selectedNode={selectedNode}
      setSelectedNode={setSelectedNode}
    />
  );
  return (
    <>
      <SearchHeader />
      <div
        style={{
          width: '100vw',
          height: '100vh',
        }}
      >
        <ResizableDrawer
          direction="horizontal"
          childrenOne={searchList}
          childrenTwo={graphViewer}
        />
      </div>
    </>
  );
}
