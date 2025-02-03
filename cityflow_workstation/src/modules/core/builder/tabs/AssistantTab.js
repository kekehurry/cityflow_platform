import { Box } from '@mui/material';
import CodeAssistant from '../utils/CodeAssistant';

export default function assistantTab({
  tab,
  config,
  formValue,
  setFormValue,
  editor,
  setConfig,
}) {
  return (
    <Box hidden={tab !== 1}>
      {config.expandHeight && (
        <CodeAssistant
          language={formValue.type == 'interface' ? 'javascript' : 'python'}
          editor={editor}
          formValue={formValue}
          setFormValue={setFormValue}
          config={config}
          setConfig={setConfig}
          height={config.expandHeight - 100}
        />
      )}
    </Box>
  );
}
