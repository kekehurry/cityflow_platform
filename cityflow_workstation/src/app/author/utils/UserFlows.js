import { ImageList } from '@mui/material';
import ShareCard from '@/components/ShareCard';
import { useEffect, useState } from 'react';
import { useLocalStorage } from '@/utils/local';

const UserFlows = ({ items, edit }) => {
  const cardWidth = 300;
  const cardHeight = 200;
  const [localItems, setLocalItems] = useState([]);
  const [userFlows, setUserFlows] = useLocalStorage('userFlows', []);

  const handleClick = (item, local) => {
    if (edit) return;
    if (!local) {
      window.location.href = `/flow?id=${item.id}`;
    } else {
      window.location.href = `/flow?id=${item.id}&local=true`;
    }
  };

  useEffect(() => {
    window.addEventListener('localFlowsChange', (e) => {
      setUserFlows(e.detial);
    });
    return () => {
      window.removeEventListener('localFlowsChange', (e) => {
        setUserFlows(e.detial);
      });
    };
  }, []);

  useEffect(() => {
    const items = userFlows.map((item) => {
      return {
        id: item.id,
        name: item.name,
        author: item.author,
        description: item.description,
        screenShot: item.screenShot,
      };
    });
    setLocalItems(items);
  }, [userFlows]);

  return (
    <ImageList cols={4} gap={20}>
      {localItems?.map(
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
                onClick={(e) => handleClick(item, true)}
                local={true}
              />
            </div>
          )
      )}
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
