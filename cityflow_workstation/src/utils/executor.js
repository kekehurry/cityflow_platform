import { useState, useEffect } from 'react';
import { initUserId } from './local';
import useSWR from 'swr';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const executorServer = '/api/executor';

export async function* setupExecutor(flowId, packages, image) {
  const api = `${executorServer}/setup`;
  const userId = await initUserId();
  const res = await fetch(basePath + api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      flowId,
      userId,
      packages,
      image,
    }),
  }).catch((err) => {
    console.error(err);
  });
  if (res && res.ok) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      yield chunk;
    }
  }
}

export const executeCode = async ({
  flowId,
  sessionId,
  files,
  language,
  input,
  config,
  image,
}) => {
  const { code, icon, ...rest } = config;
  const userId = await initUserId();
  const inputFile = {
    data: JSON.stringify(input),
    path: 'input.json',
  };
  const configFile = {
    data: JSON.stringify(rest),
    path: 'config.json',
  };
  const api = `${executorServer}/execute`;
  const res = await fetch(api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      flowId,
      userId,
      sessionId,
      image,
      codeBlock: {
        files: [...(files || []), inputFile, configFile],
        code: code,
        language: language,
      },
    }),
  });
  if (res && res.ok) {
    return await res.json();
  }
};

export const useExecuteCode = ({
  flowId,
  sessionId,
  files,
  language,
  input,
  config,
  image,
}) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = async () => {
    setIsLoading(true);
    try {
      const result = await executeCode({
        flowId,
        sessionId,
        files,
        language,
        input,
        config,
        image,
      });
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    execute();
  }, [flowId, sessionId, files, language, input, config, image]);

  return {
    data,
    error: config && error,
    isLoading,
  };
};

export const removeSession = async (flowId, sessionId) => {
  const userId = await initUserId();
  const api = `${executorServer}/remove_session`;
  const res = await fetch(basePath + api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      flowId,
      userId,
      sessionId,
    }),
  }).catch((err) => {
    console.error(err);
  });
  if (res && res.ok) {
    return await res.json();
  }
};

export const killExecutor = async (flowId) => {
  const api = `${executorServer}/kill`;
  const userId = await initUserId();
  const res = await fetch(basePath + api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      flowId,
      userId,
    }),
  }).catch((err) => {
    console.error(err);
  });
  if (res && res.ok) {
    return await res.json();
  }
};

export const check = async (flowId) => {
  const api = `${executorServer}/check`;
  const userId = await initUserId();
  const res = await fetch(basePath + api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      flowId,
      userId,
    }),
  }).catch((err) => {
    console.error(err);
  });
  if (res && res.ok) {
    return await res.json();
  }
};
