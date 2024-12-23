import useSWR from 'swr';
import { initUserId } from './local';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const checkNode = async (nodeId) => {
  const api = '/api/dataset/checkNode';
  return fetch(basePath + api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nodeId }),
  })
    .then((response) => {
      if (response && response.ok) {
        return response.json();
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
};

export const saveWorkflow = async (flowData) => {
  const api = '/api/dataset/saveWorkflow';
  const userId = await initUserId();
  return fetch(basePath + api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ flowData, userId }),
  })
    .then(
      //if success alert the user
      (response) => {
        if (response && response.ok) {
          alert('Your workflow has been shared!');
          return response.json();
        } else {
          alert('Failed to share your workflow');
        }
      }
    )
    .catch((error) => {
      console.error('Error:', error);
    });
};

export const searchWorkflow = async (params, limit = 25) => {
  const api = '/api/dataset/searchWorkflow';
  const res = await fetch(basePath + api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ params, limit }),
  }).catch((error) => {
    console.error('Error:', error);
  });
  if (res && res.ok) {
    return await res.json();
  }
};

export const useSearchWorkflow = (params, limit = 25) => {
  const { data, error } = useSWR(
    ['/api/dataset/searchWorkflow', params, limit],
    () => searchWorkflow(params, limit)
  );

  return {
    data,
    error,
    isLoading: !data && !error,
  };
};

export const getWorkflow = async (flowId) => {
  if (!flowId) return;
  const api = '/api/dataset/getWorkflow';
  const res = await fetch(basePath + api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ flowId }),
  }).catch((error) => {
    console.error('Error:', error);
  });
  if (res && res.ok) {
    return await res.json();
  }
};

export const getModule = async (moduleId) => {
  const api = '/api/dataset/getModule';
  const res = await fetch(basePath + api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ moduleId }),
  }).catch((error) => {
    console.error('Error:', error);
  });
  if (res && res.ok) {
    return await res.json();
  }
};

export const searchModule = async (params, limit = 100) => {
  const api = '/api/dataset/searchModule';
  const res = await fetch(basePath + api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ params, limit }),
  }).catch((error) => {
    console.error('Error:', error);
  });
  if (res && res.ok) {
    return await res.json();
  }
};

export const getAuthor = async (authorId) => {
  const api = '/api/dataset/getAuthor';
  const res = await fetch(basePath + api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ authorId }),
  }).catch((error) => {
    console.error('Error:', error);
  });
  if (res && res.ok) {
    return await res.json();
  }
};

export const deleteWorkflow = async (flowId) => {
  const api = '/api/dataset/deleteWorkflow';
  return fetch(basePath + api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ flowId }),
  }).catch((error) => {
    console.error('Error:', error);
  });
};

//Search
export const fullTextSearch = async (query, limit = 25) => {
  const api = '/api/dataset/fulltextSearch';
  const res = await fetch(basePath + api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, limit }),
  }).catch((error) => {
    console.error('Error:', error);
  });
  if (res && res.ok) {
    return await res.json();
  }
};

export const semanticSearch = async (query, limit = 5) => {
  const api = '/api/dataset/semanticSearch';
  const res = await fetch(basePath + api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, limit }),
  }).catch((error) => {
    console.error('Error:', error);
  });
  if (res && res.ok) {
    return await res.json();
  }
};

export const useSemanticSearch = (query, limit = 5) => {
  const { data, error } = useSWR(
    ['/api/dataset/semanticSearch', query, limit],
    () => semanticSearch(query, limit)
  );

  return {
    data,
    error,
    isLoading: !data && !error,
  };
};

export const getGraphOverview = async () => {
  const api = '/api/dataset/getGraphOverview';
  const res = await fetch(basePath + api).catch((error) => {
    console.error('Error:', error);
  });
  if (res && res.ok) {
    return await res.json();
  }
};
