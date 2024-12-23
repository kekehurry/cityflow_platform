import { ImageList } from '@mui/material';
import ShareCard from '@/components/ShareCard';
import Link from 'next/link';
import { useState } from 'react';

const UserFlows = ({ items, edit }) => {
  const cardWidth = 300;
  const cardHeight = 200;
  return (
    <ImageList cols={4} gap={20}>
      {items?.map(
        (item, index) =>
          item && (
            <div
              key={index}
              style={{ display: 'inline-block', width: cardWidth }}
            >
              {edit ? (
                <ShareCard
                  data={item}
                  width={cardWidth}
                  height={cardHeight}
                  minWidth={300}
                  minHeight={300}
                  edit={edit}
                />
              ) : (
                <Link
                  href={{ pathname: '/flow', query: { id: item.id } }}
                  style={{ textDecoration: 'none' }}
                  disabled={edit}
                >
                  <ShareCard
                    data={item}
                    width={cardWidth}
                    height={cardHeight}
                    minWidth={300}
                    minHeight={300}
                    edit={edit}
                  />
                </Link>
              )}
            </div>
          )
      )}
    </ImageList>
  );
};

export default UserFlows;
