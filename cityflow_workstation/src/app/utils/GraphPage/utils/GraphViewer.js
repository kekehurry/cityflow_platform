'use client';
import React, { useEffect, useState } from 'react';
import { Box, TextField, Stack } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import SearchIcon from '@mui/icons-material/Search';
import theme from '@/theme';

import { useSemanticSearch } from '@/utils/dataset';

import ForceGraph2D from './ForceGraph';

export default function GraphViewer(props) {
  const { selectedNode, setSelectedNode, setResults } = props;
  const [graphData, setGraphdata] = useState(null);
  const [value, setValue] = useState(
    'How to calculate amenity density in cambridge?'
  );
  const [query, setQuery] = useState(
    'How to calculate amenity density in cambridge?'
  );
  const { data, error, isLoading } = useSemanticSearch(query);

  const nodeFillColorMap = {
    Author: '#80D8FF',
    Module: '#64B5F6',
    Workflow: '#00ACC1',
  };

  const handleSearch = () => {
    setQuery(value);
  };

  useEffect(() => {
    if (data && data[1].length > 0) {
      const [graph, ids, nodes] = data;
      setResults(nodes);
      setGraphdata(graph);
    }
    if (error) {
      // console.log(error);
    }
    if (isLoading) {
      // console.log('loading');
    }
  }, [data, error, isLoading]);

  return (
    <>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            position: 'absolute',
            top: 100,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 600,
            height: 45,
            zIndex: 10,
          }}
        >
          <TextField
            fullWidth
            id="outlined-basic"
            size="small"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 5,
              },
            }}
            inputProps={{
              sx: {
                color: 'black',
                height: 25,
                backgroundColor: 'white',
                borderRadius: 5,
              },
            }}
          />
          <LoadingButton
            variant="contained"
            size="small"
            loading={isLoading}
            onClick={handleSearch}
            sx={{
              width: 100,
              backgroundColor: theme.palette.primary.main,
              borderRadius: 10,
            }}
          >
            {isLoading || <SearchIcon sx={{ color: 'white' }} />}
          </LoadingButton>
        </Stack>
        {graphData && (
          <div
            id="graph-3d"
            style={{
              width: '100%',
              height: '100%',
              cursor: 'pointer',
            }}
          >
            <ForceGraph2D
              isLoading={isLoading}
              graphData={graphData}
              nodeFillColorMap={nodeFillColorMap}
              nodeAutoColorBy={'type'}
              linkWidth={0.5}
              nodeLabel={'name'}
              linkColor={theme.palette.graph.link}
              nodeStrokeColor={theme.palette.graph.node}
              nodeHighlightColor={theme.palette.graph.highlight}
              selectedNode={selectedNode}
              setSelectedNode={setSelectedNode}
            />
          </div>
        )}
      </Box>
    </>
  );
}
