import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ShareCard from '@/components/ShareCard';
import { useGetWorkflow, useGetModule } from '@/utils/dataset';

const WorkflowCard = ({ id, type }) => {
  const { data, error, isLoading } =
    type == 'module' ? useGetModule(id) : useGetWorkflow(id);
  const url = type == 'workflow' ? `/flow?id=${id}` : `/flow?module=${id}`;
  return isLoading ? (
    <div>{` Loading ${type} ${id} ... `}</div>
  ) : (
    <div style={{ display: 'flex', margin: '10px', justifyContent: 'center' }}>
      <ShareCard
        data={{ ...data, label: type }}
        width={'80%'}
        height={60}
        borderRadius={2}
        showInfo={true}
        titleSize="h6"
        onClick={() => window.open(url, '_self')}
        // selected={selectedNode === item.id}
      />
    </div>
  );
};

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
  const revisedMarkdown = markdown.replace(
    /<think>(.*?)<\/think>/gs,
    (match, content) => {
      const lines = content.split('\n').filter((line) => line.trim() !== '');
      return lines.map((line) => `<think>${line}</think>`).join('');
    }
  );
  return (
    <Markdown
      rehypePlugins={[rehypeRaw]}
      remarkPlugins={[remarkGfm]}
      children={revisedMarkdown}
      components={{
        code(props) {
          const { children, className, inline, node, ...rest } = props;
          const isMultiline = (content) => String(content).includes('\n');
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
                  margin: 0,
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
                display: isMultiline(children) ? 'block' : 'unset',
              }}
            >
              {children}
            </code>
          );
        },
        think({ node, children }) {
          return (
            <span
              style={{
                color: '#a0a0a0', // 浅灰色
                width: '100%',
                fontSize: '0.9em',
                fontStyle: 'italic',
                margin: '0px 10px',
                padding: '10px 12px 0px 12px',
                borderLeft: '2px solid rgb(168, 168, 168)',
                backgroundColor: 'none',
                display: 'block',
              }}
            >
              {children}
            </span>
          );
        },
        workflow({ node, children }) {
          return (
            <WorkflowCard
              id={node.properties.flow_id}
              type={node.properties.type}
            />
          );
        },
      }}
    />
  );
};

export default CustomMarkdown;
