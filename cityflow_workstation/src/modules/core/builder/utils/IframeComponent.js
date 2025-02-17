import { useState, useRef, useEffect, memo } from 'react';
import typography from '@/theme/typography';
import palette from '@/theme/palette';
import theme from '@/theme';
import { nanoid } from 'nanoid';
import { getLocalStorage } from '@/utils/local';
import Loading from '@/components/Loading';
import useSWR from 'swr';

const IframeComponent = ({ config, input, setConfig, setOutput, zoom }) => {
  const [html, setHtml] = useState(null);
  const [newHtml, setNewHtml] = useState(null);
  const [loading, setLoading] = useState(false);
  const [iframeId, setIframeId] = useState(nanoid());
  const [iframeConfig, setIframeConfig] = useState(config);
  const llmConfig = getLocalStorage('LLM_CONFIG');
  const secrets = {
    MAPBOX_TOKEN: getLocalStorage('MAPBOX_TOKEN'),
    LLM_API_KEY: llmConfig?.apiKey,
    LLM_BASE_URL: llmConfig?.baseUrl,
    LLM_MODEL: llmConfig?.model,
  };

  const iframeRef = useRef(null);
  const fetcher = (url) =>
    fetch(url)
      .then((res) => {
        if (!res.ok || res.status === 404) return null;
        return res.text();
      })
      .catch((e) => null);
  const {
    data: fetchedHtml,
    error,
    isLoading,
  } = useSWR(
    config?.html && config.html.startsWith('/api/dataset/source')
      ? config.html
      : null,
    fetcher,
    { revalidateOnFocus: false }
  );

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

  //   Listen for messages from the iframe
  useEffect(() => {
    if (!window) return;
    window.addEventListener('message', handleIframeMessage);
    return () => {
      window.removeEventListener('message', handleIframeMessage);
    };
  }, [window]);

  useEffect(() => {
    setConfig && setConfig({ ...config, ...iframeConfig });
  }, [iframeConfig]);

  // update when input change
  useEffect(() => {
    if (config?.html) {
      sendToIframe({ id: iframeId, input, config });
      config?.run || setOutput(null);
    }
  }, [input, config?.run, config?.html, iframeId]);

  useEffect(() => {
    const placehoderHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <script />
        </head>
        <body>
          <div style="text-align:center;color:${
            theme.palette.text.secondary
          };height:100%;align-items:center;display:flex;justify-content:center">
              <p style="font-size:${15 / (zoom || 1)}px">${
      config?.name || 'Unnamed Module'
    }</p>
          </div>
        </body>
      </html>
    `;
    // fetch html from server if startswith /api/dataset/source
    if (config?.html && config?.type == 'interface') {
      if (config.html.startsWith('/api/dataset/source')) {
        setLoading(isLoading);
        fetchedHtml ? setHtml(fetchedHtml) : setHtml(placehoderHtml);
      } else {
        setHtml(config?.html);
      }
    } else {
      setHtml(placehoderHtml);
    }
  }, [config?.html, config?.name, fetchedHtml, isLoading]);

  // init
  useEffect(() => {
    if (!html) return;
    const injectScript = `
    <style>
      ::-webkit-scrollbar {
          display: none;
      }
      html {
          scrollbar-width: none; /* For Firefox */
          -ms-overflow-style: none; /* For Internet Explorer and Edge */
      }
      body {
      font-family: 'Roboto Mono', 'Arial', 'Kalam', sans-serif;
      }
    </style>
    <script>
        window.secrets = ${JSON.stringify(secrets)};
        window.iframeId = "${iframeId}";
        window.zoom = ${zoom || 1};
        window.typography = ${JSON.stringify(typography)};
        window.palette = ${JSON.stringify(palette)};
        window.theme = {
        ...window.typography,
        ...window.palette
        };
        window.addEventListener('error', function(event) {
          document.body.innerHTML = \`
            <div style="text-align:center; height:100%">
              <p style="color:red; font-size:${
                10 / zoom
              }px">\$\{event.message\}</p>
            </div>
          \`;
        });
    </script>
    `;
    //inject scripts
    setNewHtml(html.replace(/<script(\b|>)/i, `${injectScript}\n<script$1`));
  }, [html, iframeId, secrets]);

  return loading ? (
    <Loading dotSize={10} />
  ) : (
    newHtml && (
      <iframe
        ref={iframeRef}
        srcDoc={newHtml}
        style={{
          border: 'none',
          backgroundColor: theme.palette.node.main,
          boxSizing: 'border-box',
          width: '100%',
          height: '100%',
          minHeight: '50px',
          minWidth: '50px',
          zoom: zoom || 1,
        }}
      />
    )
  );
};

export default memo(IframeComponent);
