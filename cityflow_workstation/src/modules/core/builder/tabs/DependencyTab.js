import { Box, Stack, Typography } from '@mui/material';
import FileUploader from '../utils/FileUploader';

export default function DependencyTab({
  config,
  tab,
  formValue,
  setFormValue,
}) {
  return (
    <Box hidden={tab !== 2}>
      <Stack spacing={1} height={config.expandHeigh || 600 - 100}>
        {config.expandHeight && (
          <>
            <Typography variant="caption">Dependencies</Typography>
            <FileUploader
              formValue={formValue}
              setFormValue={setFormValue}
              height={config.expandHeight - 110}
            />
          </>
        )}
      </Stack>
    </Box>
  );
}
