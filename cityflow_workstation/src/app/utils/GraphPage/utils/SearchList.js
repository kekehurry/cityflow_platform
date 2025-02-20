import { ImageList } from '@mui/material';
import ShareCard from '@/components/ShareCard';
import { useState, useEffect } from 'react';

const SearchList = ({
  results,
  selectedNode,
  setSelectedNode,
  cardWidth = '100%',
  cardHeight = 100,
}) => {
  const [items, setItems] = useState(results || []);

  const handleNodeClick = (e, id, label) => {
    setSelectedNode(id);
    if (typeof window !== 'undefined' && id === selectedNode) {
      label === 'Module'
        ? window.open(`/flow?module=${id}`, '_blank')
        : window.open(`/flow?id=${id}`, '_blank');
    }
  };

  useEffect(() => {
    if (results && results.length > 0) {
      setItems(results);
      setSelectedNode(results[0].id);
    } else {
      const data = Array.from({ length: 4 }, (_, i) => i + 1).map((i) => {
        return {
          id: i,
          name: '',
          description: '',
          screenShot: '/static/fetching_large.gif',
        };
      });
      setItems(data);
      setSelectedNode(null);
    }
  }, [results]);

  return (
    <>
      {/* <Box sx={{ pl: 2, pt: 2 }}>
        <h2>Search Results</h2>
      </Box> */}
      <ImageList
        cols={1}
        gap={10}
        sx={{
          p: 1,
          pt: 10,
          overflowY: 'auto',
          height: 'calc(100vh - 100px)',
        }}
      >
        {items?.map(
          (item, index) =>
            item && (
              <div
                key={index}
                style={{ display: 'inline-block', width: cardWidth }}
              >
                <ShareCard
                  data={item}
                  width={cardWidth}
                  height={cardHeight}
                  borderRadius={2}
                  showInfo={true}
                  titleSize="h6"
                  onClick={(e) => handleNodeClick(e, item.id, item.label)}
                  selected={selectedNode === item.id}
                />
              </div>
            )
        )}
      </ImageList>
    </>
  );
};

export default SearchList;
