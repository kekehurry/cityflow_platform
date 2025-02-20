'use client';
import { useState } from 'react';
import SearchList from './utils/SearchList';
import GraphViewer from './utils/GraphViewer';
import { Box } from '@mui/material';
import theme from '@/theme';

export default function GraphSearch() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [results, setResults] = useState([]);

  return (
    <>
      <Box sx={{ width: '70%', background: theme.palette.graph.background }}>
        <GraphViewer
          setResults={setResults}
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
        />
      </Box>
      <Box
        sx={{
          width: '30%',
          pr: 2,
          background: theme.palette.graph.background,
        }}
      >
        <SearchList
          results={results}
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
        />
      </Box>
    </>
  );
}
