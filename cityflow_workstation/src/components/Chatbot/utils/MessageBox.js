import React from 'react';
import { Avatar, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';

const buttonStyle = {
  marginRight: '8px',
  fontSize: '8px',
  cursor: 'pointer',
};

const MarkdownHeader = ({ code, sendCode }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'flex-end',
      backgroundColor: '#212121',
      top: '0',
      width: '100%',
      height: '20px',
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        className="markdown-button"
        style={buttonStyle}
        onClick={() => navigator.clipboard.writeText(code)}
      >
        COPY
      </div>
      {sendCode && (
        <div
          className="markdown-button"
          style={buttonStyle}
          onClick={() => sendCode && sendCode(code)}
        >
          SEND
        </div>
      )}
    </div>
  </div>
);
const CustomMarkdown = ({ markdown, sendCode }) => {
  return (
    <Markdown
      children={markdown}
      components={{
        code(props) {
          const { children, className, inline, node, ...rest } = props;
          const match = /language-(\w+)/.exec(className || '');
          return match ? (
            <>
              <MarkdownHeader code={children} sendCode={sendCode} />
              <SyntaxHighlighter
                {...rest}
                PreTag="div"
                children={String(children).replace(/\n$/, '')}
                language={match[1]}
                style={darcula}
                customStyle={{
                  maxWidth: '300px', // Optional: set a maximum width
                  margin: '0 auto', // Center the block
                }}
              />
            </>
          ) : (
            <code
              {...rest}
              className={className}
              style={{
                color: '#FFC400',
                backgroundColor: '#424242',
                padding: '1px',
                font: "300 .9em 'Open Sans', sans-serif",
                borderRadius: '3px',
              }}
            >
              {children}
            </code>
          );
        },
      }}
    />
  );
};

const MessageRowRight = styled(Box)({
  display: 'flex',
  justifyContent: 'flex-end',
  paddingLeft: '40px',
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

export const MessageRight = ({ message, name, avatar }) => {
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
};

export const MessageLeft = ({ message, name, avatar, sendCode }) => {
  return (
    <MessageNoFrame>
      <ChatAvatar alt={name} src={avatar || ''} />
      <CustomMarkdown markdown={message} sendCode={sendCode} />
    </MessageNoFrame>
  );
};
