import { useState, useEffect } from 'react';
import { Typography, TextField } from '@mui/material';
import theme from '@/theme';
import Markdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css'; // `rehype-katex` does not import the CSS for you

function TextNode(props) {
  const { config, setConfig } = props;
  const [edit, setEdit] = useState(false);
  const [value, setValue] = useState(config.value || 'Double click to edit');

  useEffect(() => {
    if (!value) {
      setValue('Double click to edit');
    } else {
      setConfig({ ...config, value });
    }
  }, [value]);

  return (
    <>
      <div style={{ display: 'flex', margin: 0 }}>
        {edit ? (
          <TextField
            className="nowheel nodrag"
            autoFocus
            multiline
            variant="standard"
            onMouseLeave={() => setEdit(false)}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            sx={{ width: '100%', minHeight: 0, height: '100%' }}
            // InputProps={{ className: 'kalam-regular' }}
          />
        ) : (
          // <Typography
          // className='kalam-regular'
          // sx = {{width: '100%',marginTop:0,marginBottom:0,color:theme.palette.annotation.main}}
          // onDoubleClick={() => setEdit(true)}>
          //   {value}
          // </Typography>
          <div
            className="kalam-regular"
            sx={{
              width: '100%',
              marginTop: 0,
              marginBottom: 0,
              color: theme.palette.annotation.main,
            }}
            onDoubleClick={() => setEdit(true)}
          >
            <Markdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {value}
            </Markdown>
          </div>
        )}
      </div>
    </>
  );
}

export default TextNode;
