import { ImageList } from '@mui/material';
import ShareCard from '@/components/ShareCard';
import { useState, useEffect } from 'react';
import { useSearchWorkflow } from '@/utils/dataset';

const CommunityFlows = ({
  params,
  cardWidth = 250,
  cardHeight = 250,
  cols = 4,
  gap = 20,
}) => {
  const [items, setItems] = useState([]);
  const { data, error, isLoading } = useSearchWorkflow(params);

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
      setItems(uniqueItems);
    }
  }, [data, error, isLoading]);

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
                minWidth={200}
                minHeight={200}
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

export default CommunityFlows;
