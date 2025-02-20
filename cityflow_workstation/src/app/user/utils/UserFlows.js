import { ImageList } from '@mui/material';
import ShareCard from '@/components/ShareCard';
import Link from 'next/link';

const UserFlows = ({ items }) => {
  const cardWidth = 250;
  const cardHeight = 250;

  return (
    <ImageList
      cols={4}
      gap={20}
      sx={{ height: cardHeight + 100, overflow: 'auto' }}
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

export default UserFlows;
