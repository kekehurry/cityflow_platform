import { useRunner } from 'react-runner';
import { memo } from 'react';
import Markdown from 'react-markdown';
import { Stack, Button } from '@mui/material';

export const Runner = memo(
  ({ code, scope }) => {
    const { element, error } = useRunner({ code, scope });
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          userSelect: 'text',
          cursor: 'auto',
        }}
      >
        {element}
        {error && (
          <Stack>
            <Markdown>{error}</Markdown>
            <Button onClick={() => navigator.clipboard.writeText(error)}>
              Copy Error
            </Button>
          </Stack>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return _.isEqual(prevProps, nextProps);
  }
);

export default Runner;
