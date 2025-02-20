'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Divider, Box, Stack, Paper, IconButton } from '@mui/material';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import { Resizable } from 're-resizable';
import theme from '@/theme';

const ResizableDrawer = ({
  childrenOne,
  childrenTwo,
  direction = 'horizontal',
  drawerWidth = '22vw',
  drawerHeight = '22vh',
}) => {
  const handleWidth = 20;
  const [open, setOpen] = useState(true);
  const [width, setWidth] = useState(
    direction === 'horizontal' ? drawerWidth : '100vw'
  );
  const [height, setHeight] = useState(
    direction === 'vertical' ? drawerHeight : '100vh'
  );

  const boxRef = useRef(null);

  useEffect(() => {
    switch (direction) {
      case 'horizontal':
        parseInt(width) > handleWidth ? setOpen(true) : setOpen(false);
        break;
      case 'vertical':
        parseInt(height) > 0 ? setOpen(true) : setOpen(false);
        break;
    }
  }, [direction, width, height]);

  const handleDrawerOpen = () => {
    direction === 'horizontal'
      ? setWidth(drawerWidth)
      : setHeight(drawerHeight);
  };

  const handleDrawerClose = () => {
    direction === 'horizontal' ? setWidth(handleWidth) : setHeight('8vh');
  };

  const handleResizeStop = (event, dragDirection, ref, d) => {
    direction === 'horizontal'
      ? setWidth(`${parseInt(ref.style.width)}vw`)
      : setHeight(`${parseInt(ref.style.height)}vh`);
  };

  return (
    <>
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: direction === 'horizontal' ? 'row' : 'column',
          overflow: 'hidden',
        }}
      >
        <Resizable
          size={{
            width: width,
            height: height,
          }}
          style={{
            overflow: 'hidden',
            border: theme.palette.primary.border,
            borderLeft: '0',
            borderTop: '0',
            background: theme.palette.flow.main,
          }}
          enable={{
            top: direction === 'vertical',
            bottom: direction === 'vertical',
            right: direction === 'horizontal',
            left: direction === 'horizontal',
          }}
          onResizeStop={handleResizeStop}
        >
          <Box
            ref={boxRef}
            sx={{
              background: 'none',
              paddingRight: direction === 'horizontal' ? `${handleWidth}px` : 0,
              paddingBottom:
                direction === 'horizontal' ? 0 : `${handleWidth}px`,
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                right: direction === 'horizontal' ? 0 : '50%',
                top: direction === 'horizontal' ? '50%' : 'auto',
                bottom: direction === 'horizontal' ? 'auto' : 0,
                cursor: 'pointer',
                opacity: 0.2,
              }}
              onClick={open ? handleDrawerClose : handleDrawerOpen}
            >
              {direction === 'horizontal' ? (
                open ? (
                  <KeyboardDoubleArrowLeftIcon size="small" />
                ) : (
                  <KeyboardDoubleArrowRightIcon size="small" />
                )
              ) : open ? (
                <KeyboardDoubleArrowUpIcon size="small" />
              ) : (
                <KeyboardDoubleArrowDownIcon size="small" />
              )}
            </Box>
            {childrenOne}
          </Box>
        </Resizable>
        <Stack
          direction={direction === 'horizontal' ? 'row' : 'column'}
          sx={{ flexGrow: 1, background: theme.palette.flow.main, zIndex: 1 }}
        >
          <Divider orientation={direction} />
          {childrenTwo}
        </Stack>
      </Box>
    </>
  );
};

export default ResizableDrawer;
