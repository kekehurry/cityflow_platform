import React from 'react';
import { Avatar, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import CustomMarkdown from './CumstomMarkdown';
import { memo } from 'react';

const MessageRowRight = styled(Box)({
  display: 'flex',
  justifyContent: 'flex-end',
  paddingLeft: '10px',
});
const MessageNoFrame = styled(Box)({
  position: 'relative',
  marginLeft: '20px',
  marginBottom: '10px',
  padding: '2px',
  paddingLeft: '10px',
  paddingRight: '10px',
  width: '100%',
  textAlign: 'left',
  font: "400 .9em 'Open Sans', sans-serif",
  pointer: 'text',
});

const MessageGreen = styled(Box)({
  position: 'relative',
  marginRight: '20px',
  marginBottom: '10px',
  padding: '2px',
  paddingLeft: '10px',
  paddingRight: '10px',
  backgroundColor: '#263238',
  width: '100%',
  textAlign: 'left',
  font: "400 .9em 'Open Sans', sans-serif",
  border: '1px solid #263238',
  borderRadius: '10px',
  pointer: 'text',
  '&:after': {
    content: "''",
    position: 'absolute',
    width: '0',
    height: '0',
    borderTop: '15px solid #263238',
    borderLeft: '15px solid transparent',
    borderRight: '15px solid transparent',
    top: '0',
    right: '-15px',
  },
  '&:before': {
    content: "''",
    position: 'absolute',
    width: '0',
    height: '0',
    borderTop: '17px solid #263238',
    borderLeft: '16px solid transparent',
    borderRight: '16px solid transparent',
    top: '-1px',
    right: '-17px',
  },
});

const MessageContent = styled(Box)({
  padding: 0,
  margin: 0,
});

const ChatAvatar = styled(Avatar)(({ theme }) => ({
  color: theme.palette.getContrastText('#FFC400'),
  // backgroundColor: "#FFC400",
  width: theme.spacing(4),
  height: theme.spacing(4),
}));

export const MessageRight = memo(({ message, name, avatar }) => {
  return (
    <MessageRowRight>
      <MessageGreen>
        <MessageContent>
          <CustomMarkdown markdown={message} />
        </MessageContent>
      </MessageGreen>
      <ChatAvatar alt={name} src={avatar || ''} />
    </MessageRowRight>
  );
});

export const MessageLeft = memo(({ message, name, avatar, sendCode }) => {
  return (
    <MessageNoFrame>
      <ChatAvatar alt={name} src={avatar || ''} />
      <CustomMarkdown markdown={message} sendCode={sendCode} />
    </MessageNoFrame>
  );
});
