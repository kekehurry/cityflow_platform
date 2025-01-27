import { initUserId } from './local';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
import useSWR from 'swr';

const defaultRunner =
  process.env.NEXT_PUBLIC_DEFAULT_RUNNER ||
  'ghcr.io/kekehurry/cityflow_runner:latest';

export const setupExecutor = async (
  flowId,
  packages,
  image,
  language = 'python'
) => {
  const api = '/api/executor/setup';
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
      image: defaultRunner,
      language,
    }),
  }).catch((err) => {
    console.error(err);
  });
  if (res && res.ok) {
    return await res.json();
  }
};

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
  const api = '/api/executor/execute';
  const res = await fetch(api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      flowId,
      userId,
      sessionId,
      image: defaultRunner,
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
      '/api/executor/execute',
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
        image: defaultRunner,
      })
  );
  return {
    data,
    error,
    isLoading: !data && !error,
  };
};

export const removeSession = async (flowId, sessionId) => {
  const userId = await initUserId();
  const api = 'api/executor/removeSession';
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

export const killExecutor = async (flowId, image) => {
  const api = '/api/executor/kill';
  const userId = await initUserId();
  const res = await fetch(basePath + api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      flowId,
      userId,
      image: defaultRunner,
    }),
  }).catch((err) => {
    console.error(err);
  });
  if (res && res.ok) {
    return await res.json();
  }
};

export const keepAlive = async (flowId) => {
  const api = '/api/executor/keepAlive';
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
