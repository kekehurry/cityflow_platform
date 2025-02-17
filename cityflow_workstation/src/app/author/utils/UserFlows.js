import { ImageList } from '@mui/material';
import ShareCard from '@/components/ShareCard';

const UserFlows = ({ items, edit }) => {
  const cardWidth = 300;
  const cardHeight = 200;

  const handleClick = (item, local) => {
    if (edit) return;
    if (!local) {
      window.location.href = `/flow?id=${item.id}`;
    } else {
      window.location.href = `/flow?id=${item.id}&local=true`;
    }
  };

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
                minWidth={300}
                minHeight={300}
                edit={edit}
                onClick={(e) => handleClick(item, false)}
              />
            </div>
          )
      )}
    </ImageList>
  );
};

export default UserFlows;
