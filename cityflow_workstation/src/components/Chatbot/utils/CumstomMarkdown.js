import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { debounce } from 'lodash';
import { useState, useEffect } from 'react';

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
  const [debouncedMarkdown, setDebouncedMarkdown] = useState(markdown);

  useEffect(() => {
    const debouncedUpdate = debounce(() => {
      const revisedMarkdown = markdown.replace(
        /<think>(.*?)<\/think>/gs,
        (match, content) => {
          const lines = content.split('\n');
          return `<div style="color: #a0a0a0; font-size: 0.9em; font-style: italic; margin: 12px 0; paddingLeft: 12px; border-left: 2px solid rgb(168, 168, 168);">${lines
            .map((line) => `<p>${line}</p>`)
            .join('')}</div>`;
        }
      );
      setDebouncedMarkdown(revisedMarkdown);
    }, 20);

    debouncedUpdate();

    return () => {
      debouncedUpdate.cancel();
    };
  }, [markdown]);

  return (
    <Markdown
      rehypePlugins={[rehypeRaw]}
      remarkPlugins={[remarkGfm]}
      children={debouncedMarkdown}
      components={{
        code(props) {
          const { children, className, inline, node, ...rest } = props;
          const match = /language-(\w+)/.exec(className || '');
          return match ? (
            <div style={{ width: '100%', overflow: 'hidden' }}>
              <SyntaxHighlighter
                {...rest}
                PreTag="div"
                children={String(children).replace(/\n$/, '')}
                language={match[1]}
                style={darcula}
                customStyle={{
                  maxWidth: '400px',
                  margin: '0 auto',
                }}
              />
              <MarkdownHeader code={children} sendCode={sendCode} />
            </div>
          ) : (
            <code
              {...rest}
              className={className}
              style={{
                color: '#FFC400',
                backgroundColor: '#424242',
                font: "300 .9em 'Open Sans', sans-serif",
                borderRadius: '3px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'monospace',
              }}
            >
              {children}
            </code>
          );
        },
        think({ node, children }) {
          return (
            <div
              style={{
                color: '#a0a0a0', // 浅灰色
                fontSize: '0.9em',
                fontStyle: 'italic',
                margin: '8px 0',
                padding: '12px',
                borderLeft: '2px solid rgb(168, 168, 168)',
                backgroundColor: 'none',
              }}
            >
              {children}
            </div>
          );
        },
      }}
    />
  );
};

export default CustomMarkdown;
