import ReactAnsi from 'react-ansi';
import theme from '@/theme';

export default function LogViewer({ logs, width, height }) {
  return (
    <ReactAnsi
      log={logs || ''}
      showHeader={false}
      autoScroll={true}
      style={{
        height: height || '100%',
        width: width || '100%',
        borderRadius: '5px',
        border: theme.palette.node.border,
        backgroundColor: theme.palette.flow.main,
        cursor: 'text',
        userSelect: 'text',
        padding: 1,
      }}
      logStyle={{
        fontFamily: 'monospace',
        fontSize: 12,
      }}
      bodyStyle={{
        height: height - 25 || '90%',
        backgroundColor: theme.palette.flow.main,
        borderRadius: '5px',
        color: theme.palette.text.secondary,
        overflow: 'auto',
      }}
    />
  );
}
