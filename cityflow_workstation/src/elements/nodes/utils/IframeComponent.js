import { useState, useRef, useEffect } from 'react';
import theme from '@/theme';
import { nanoid } from 'nanoid';
import { getLocalStorage } from '@/utils/local';

const generateCSS = (typography) => {
  const cssRules = [];

  // Font family and general styles
  cssRules.push(`
    body {
      font-family: ${typography.fontFamily};
      font-size: ${typography.fontSize}px;
      font-weight: ${typography.fontWeightRegular};
    }
  `);

  // Header styles (h1 to h6)
  for (let i = 1; i <= 6; i++) {
    const h = typography[`h${i}`];
    if (h) {
      cssRules.push(`
        h${i} {
          font-weight: ${h.fontWeight};
          font-size: ${h.fontSize}px;
          letter-spacing: ${h.letterSpacing};
        }
      `);
    }
  }

  // Overline styles
  if (typography.overline) {
    cssRules.push(`
      .overline {
        font-weight: ${typography.overline.fontWeight};
      }
    `);
  }

  return cssRules.join('\n');
};

const cssString = generateCSS(theme.typography);
const IframeComponent = ({ config, input, setConfig, setOutput }) => {
  const [html, setHtml] = useState(config.html || null);
  const [iframeId, setIframeId] = useState(config.iframeId || nanoid());
  const [iframeConfig, setIframeConfig] = useState(config);
  const secrets = {
    MAPBOX_TOKEN: getLocalStorage('MAPBOX_TOKEN'),
    LLM_API_KEY: getLocalStorage('LLM_API_KEY'),
    LLM_BASE_URL: getLocalStorage('LLM_BASE_URL'),
    LLM_MODEL: getLocalStorage('LLM_MODEL'),
  };

  const iframeRef = useRef(null);

  const sendToIframe = ({ id, input, config }) => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow.postMessage({ id, input, config }, '*');
    }
  };
  const handleIframeMessage = (event) => {
    if (event?.data && event.data.id === iframeId) {
      event.data.config &&
        setIframeConfig &&
        setIframeConfig(event.data.config);
      event.data.output && setOutput && setOutput(event.data.output);
    }
  };

  // update iframe
  useEffect(() => {
    setConfig &&
      iframeId &&
      setConfig({
        ...config,
        iframeId,
      });
  }, [iframeId, setConfig]);

  //   Listen for messages from the iframe
  useEffect(() => {
    if (!window) return;
    window.addEventListener('message', handleIframeMessage);
    return () => {
      window.removeEventListener('message', handleIframeMessage);
    };
  }, [window]);

  // update when input change
  useEffect(() => {
    if (config?.html) {
      sendToIframe({ id: iframeId, input, config });
    }
  }, [input, config?.run, config?.html, iframeId]);

  // init
  useEffect(() => {
    // Prepare styles for the iframe content
    const head = `
    <style>
        ::-webkit-scrollbar {
            display: none;
        }
        html {
            scrollbar-width: none; /* For Firefox */
            -ms-overflow-style: none; /* For Internet Explorer and Edge */
        }
        body {
          color: #9E9E9E;
        }
        h1, h2, h3, h4, h5, h6, p, div, span {
            color: #9E9E9E;
        }
        ${cssString}
    </style>
    <script>
        const secrets = ${JSON.stringify(secrets)};
        window.iframeId = "${iframeId}";
    </script>
    `;
    if (config?.html) {
      setHtml(head + config?.html);
    } else {
      setHtml(
        head +
          `
        <div style="text-align:center">
          <h4>${config?.name || 'Unnamed Module'}</h4>
        </div>
    `
      );
    }
  }, [config?.html, config?.name, config?.author, iframeId]);

  return (
    <iframe
      ref={iframeRef}
      srcDoc={html}
      style={{
        border: 'none',
        backgroundColor: theme.palette.node.main,
        boxSizing: 'border-box',
        width: '100%',
        height: '100%',
      }}
    />
  );
};

export default IframeComponent;
