import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Typography,
  Paper,
  Box,
  Stack,
  List,
  ListItem,
  Divider,
} from '@mui/material';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import theme from '@/theme';

const maxSize = process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE;
const maxFiles = process.env.NEXT_PUBLIC_MAX_UPLOAD_FILES;

function fileValidator(file) {
  if (file.size > maxSize * 1024) {
    return {
      code: 'file-too-large',
      message: `File must smaller than ${maxSize} kb`,
    };
  }
  return null;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function FileUploader({ formValue, setFormValue, height }) {
  const [fileList, setFileList] = useState(formValue.files || []);

  const onDrop = useCallback((acceptedFiles) => {
    // Handle the files
    acceptedFiles.forEach((file) => {
      fileToBase64(file).then((data) => {
        setFileList((prevFiles) => [
          ...prevFiles,
          { path: file.path, size: file.size, data: data },
        ]);
      });
    });
  }, []);

  useEffect(() => {
    setFormValue({ ...formValue, files: fileList });
  }, [fileList]);

  const {
    acceptedFiles,
    fileRejections,
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop,
    maxFiles,
    validator: fileValidator,
    noClick: true,
  });

  const files = fileList.map((file, index) => (
    <div key={file.path}>
      <ListItem>
        <Stack
          direction="row"
          spacing={2}
          justifyContent="space-between"
          width="100%"
        >
          {file.path} - {(file.size / 1024).toFixed(2)} kb
          <RemoveCircleIcon
            size="small"
            sx={{ cursor: 'pointer', width: '12px', height: '12px' }}
            onClick={() => {
              setFileList((prevFiles) =>
                prevFiles.filter((f) => f.path !== file.path)
              );
            }}
          />
        </Stack>
      </ListItem>
      <Divider />
    </div>
  ));

  const fileRejectionItems = fileRejections.map(({ file, errors }) => {
    return (
      <ListItem key={file.path}>
        {file.path} - {(file.size / 1024).toFixed(2)} kb
        {errors.map((e) => (
          <li key={e.code}>{e.message}</li>
        ))}
      </ListItem>
    );
  });

  return (
    <Paper
      variant="outlined"
      {...getRootProps()}
      sx={{
        p: 2,
        border: '1px dashed #616161',
        textAlign: 'center',
        height: '320px',
        overflow: 'auto',
        height: height,
        backgroundColor: isDragActive
          ? theme.palette.primary.main
          : theme.palette.node.main,
      }}
    >
      <Stack>
        <List sx={{ fontSize: '10px' }}>{files}</List>
        <List sx={{ fontSize: '10px', color: '#B71C1C' }}>
          {fileRejectionItems}
        </List>
        <input {...getInputProps()} />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'gray',
          }}
        >
          {isDragActive ? (
            <Typography variant="body1">Drop the files here...</Typography>
          ) : (
            <Typography variant="body1">
              Drag and drop some files here
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}
