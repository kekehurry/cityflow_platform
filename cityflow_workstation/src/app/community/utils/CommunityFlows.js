import { ImageList, Box } from '@mui/material';
import ShareCard from '@/components/ShareCard';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchWorkflow } from '@/utils/dataset';

const CommunityFlows = () => {
  const [items, setItems] = useState([]);
  const { data, error, isLoading } = useSearchWorkflow({});
  const cardWidth = 300;
  const cardHeight = 200;

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
    <ImageList cols={4} gap={20}>
      {items?.map(
        (item, index) =>
          item && (
            <div
              key={index}
              style={{ display: 'inline-block', width: cardWidth }}
            >
              <Link
                href={{ pathname: '/flow', query: { id: item.id } }}
                style={{ textDecoration: 'none' }}
              >
                <ShareCard
                  data={item}
                  width={cardWidth}
                  height={cardHeight}
                  minWidth={300}
                  minHeight={300}
                />
              </Link>
            </div>
          )
      )}
    </ImageList>
  );
};

export default CommunityFlows;
