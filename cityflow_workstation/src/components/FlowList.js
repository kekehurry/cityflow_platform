import { ImageList } from '@mui/material';
import ShareCard from '@/components/ShareCard';
import { useState, useEffect } from 'react';
import { useSearchWorkflow } from '@/utils/dataset';

const FlowList = ({
  params,
  cardWidth = '14vw',
  cardHeight = '14vw',
  cols = 5,
  gap = 20,
}) => {
  const [items, setItems] = useState([]);
  const { data, error, isLoading } = useSearchWorkflow(params);
  const fallBackItems = useSearchWorkflow({ category: 'tutorial' });

  useEffect(() => {
    if (isLoading) {
      setItems(
        Array.from({ length: 4 }, (_, i) => i + 1).map((i) => {
          return {
            id: i,
            name: '',
            description: '',
            screenShot: '/static/fetching_large.gif',
          };
        })
      );
    }
    if (error) {
      setItems([
        {
          id: 1,
          name: 'Error',
          description: 'Error fetching workflows',
        },
      ]);
    }
    if (data) {
      const uniqueItems = data?.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t?.name === item?.name)
      );
      if (uniqueItems.length === 0) {
        fallBackItems?.data && setItems(fallBackItems.data.slice(0, 5));
      } else {
        setItems(uniqueItems);
      }
    }
  }, [
    data,
    error,
    isLoading,
    fallBackItems?.data,
    fallBackItems?.error,
    fallBackItems?.isLoading,
  ]);

  return (
    <ImageList cols={cols} gap={gap}>
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
                minWidth={80}
                minHeight={80}
                edit={true}
                onClick={() => {
                  window.location.href = `/flow?id=${item.id}`;
                }}
              />
            </div>
          )
      )}
    </ImageList>
  );
};

export default FlowList;
