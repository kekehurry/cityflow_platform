import ShareCard from '@/components/ShareCard';
import { Stack } from '@mui/material';
import Link from 'next/link';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useSearchWorkflow } from '@/utils/dataset';

export const useInfiniteScroll = (callback) => {
  const observer = useRef();
  const lastElementRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          callback();
        }
      });
      if (node) observer.current.observe(node);
    },
    [callback]
  );

  return lastElementRef;
};

export default function CommunityFlows() {
  const [originalShowcase, setOriginalShowcase] = useState([]);
  const [showcase, setShowcase] = useState([]);
  const containerRef = useRef(null);
  const cardWidth = 400;
  const cardHeight = 300;
  const { data, error, isLoading } = useSearchWorkflow({ showcase: true });

  const loadMoreItemsAtBottom = useCallback(() => {
    setShowcase((prevItems) => [...prevItems, ...originalShowcase]);
  }, [originalShowcase, showcase]);

  const loadMoreItemsAtTop = useCallback(() => {
    setShowcase((prevItems) => [...originalShowcase, ...prevItems]);
    containerRef.current.scrollLeft = (cardWidth + 8) * originalShowcase.length;
  }, [originalShowcase, showcase]);

  const lastElementRef = useInfiniteScroll(loadMoreItemsAtBottom);
  const firstElementRef = useInfiniteScroll(loadMoreItemsAtTop);

  useEffect(() => {
    if (isLoading) {
      const loadingData = Array.from({ length: 4 }, (_, i) => i + 1).map(
        (i) => {
          return {
            id: i,
            name: '',
            description: '',
            screenShot: '/static/fetching_large.gif',
          };
        }
      );
      setOriginalShowcase(loadingData);
      setShowcase(loadingData);
    }
    if (error) {
      const errorData = [
        {
          id: 1,
          name: 'Error',
          description: 'Error fetching workflows',
        },
      ];
      setOriginalShowcase(errorData);
      setShowcase(errorData);
    }
    if (data) {
      setOriginalShowcase(data);
      setShowcase(data);
    }
  }, [isLoading, data, error]);

  return (
    <Stack
      direction="row"
      spacing={2}
      ref={containerRef}
      sx={{
        pt: 20,
        overflow: 'auto',
      }}
    >
      {showcase?.map(
        (item, index) =>
          item && (
            <div
              key={index}
              ref={
                index === showcase.length - 2
                  ? lastElementRef
                  : index === 0
                  ? firstElementRef
                  : null
              }
              style={{ display: 'inline-block', width: cardWidth }}
            >
              <Link
                href={{
                  pathname: '/flow',
                  query: { id: item.id },
                }}
                style={{ textDecoration: 'none' }}
              >
                <ShareCard data={item} width={cardWidth} height={cardHeight} />
              </Link>
            </div>
          )
      )}
    </Stack>
  );
}
