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
  moduleCode,
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
    path: 'input',
  };
  const configFile = {
    data: JSON.stringify(rest),
    path: 'config',
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
      codeBlocks: [
        {
          files: [...(files || []), inputFile, configFile],
          // code: inputCode + moduleCode + outputCode,
          code: moduleCode,
          language: language,
        },
      ],
    }),
  }).catch((err) => {
    console.error(err);
  });
  if (res && res.ok) {
    return await res.json();
  }
};

export const useExecuteCode = ({
  flowId,
  sessionId,
  moduleCode,
  files,
  language,
  input,
  config,
  image,
}) => {
  const { data, error } = useSWR(
    [
      `${executorServer}/execute`,
      { flowId, sessionId, moduleCode, files, language, input, config, image },
    ],
    () =>
      executeCode({
        flowId,
        sessionId,
        moduleCode,
        files,
        language,
        input,
        config,
        image,
      })
  );
  return {
    data,
    error: config && error,
    isLoading: !data && !error,
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
