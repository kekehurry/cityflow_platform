import useSWR from 'swr';
import { initUserId } from './local';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const datasetServer = '/api/dataset';

export const checkNode = async (nodeId) => {
  const api = `${datasetServer}/check_node`;
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
  const api = `${datasetServer}/save_workflow`;
  const userId = await initUserId();
  return fetch(basePath + api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ flowData, userId }),
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

export const searchWorkflow = async (params, limit = 25) => {
  const api = `${datasetServer}/search_workflow`;
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
  const { data, error, mutate } = useSWR(
    [`${datasetServer}/search_workflow`, params, limit],
    () => searchWorkflow(params, limit)
  );

  return {
    data,
    error,
    isLoading: !data && !error,
    mutate,
  };
};

export const getWorkflow = async (flowId) => {
  if (!flowId) return;
  const api = `${datasetServer}/get_workflow`;
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

export const useGetWorkflow = (flowId) => {
  const { data, error } = useSWR(
    [`${datasetServer}/get_workflow`, flowId],
    () => getWorkflow(flowId)
  );
  return {
    data,
    error,
    isLoading: !data && !error,
  };
};

export const getModule = async (moduleId) => {
  const api = `${datasetServer}/get_module`;
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

export const useGetModule = (moduleId) => {
  const { data, error } = useSWR(
    [`${datasetServer}/get_module`, moduleId],
    () => getModule(moduleId)
  );
  return {
    data,
    error,
    isLoading: !data && !error,
  };
};

export const searchModule = async (params, limit = 100) => {
  const api = `${datasetServer}/search_module`;
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

export const useSearchModule = (params, limit = 100) => {
  const { data, error } = useSWR(
    [`${datasetServer}/search_module`, params, limit],
    () => searchModule(params, limit)
  );

  return {
    data,
    error,
    isLoading: !data && !error,
  };
};

export const saveModule = async (moduleData) => {
  const api = `${datasetServer}/save_module`;
  const userId = await initUserId();
  return fetch(basePath + api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ moduleData, userId }),
  })
    .then(
      //if success alert the user
      (response) => {
        if (response && response.ok) {
          alert(`Your module has been saved !`);
          return response.json();
        } else {
          alert(`Failed to save your module`);
        }
      }
    )
    .catch((error) => {
      console.error('Error:', error);
    });
};

export const getAuthor = async (authorId) => {
  const api = `${datasetServer}/get_author`;
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

export const useGetAuthor = (authorId) => {
  const { data, error } = useSWR(
    [`${datasetServer}/get_author`, authorId],
    () => getAuthor(authorId)
  );

  return {
    data,
    error,
    isLoading: !data && !error,
  };
};

export const deleteWorkflow = async (flowId) => {
  const api = `${datasetServer}/delete_workflow`;
  const userId = await initUserId();
  return fetch(basePath + api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ flowId, userId }),
  }).catch((error) => {
    console.error('Error:', error);
  });
};

export const deleteModule = async (moduleId) => {
  const api = `${datasetServer}/delete_module`;
  const userId = await initUserId();
  return fetch(basePath + api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ moduleId, userId }),
  }).catch((error) => {
    console.error('Error:', error);
  });
};

//Search
export const fullTextSearch = async (query, limit = 25) => {
  const api = `${datasetServer}/fulltext_search`;
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

export const useFullTextSearch = (query, limit = 25) => {
  const { data, error } = useSWR(
    [`${datasetServer}/fulltext_search`, query, limit],
    () => fullTextSearch(query, limit)
  );

  return {
    data,
    error,
    isLoading: !data && !error,
  };
};

export const semanticSearch = async (query, limit = 5) => {
  const api = `${datasetServer}/semantic_search`;
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
    [`${datasetServer}/semantic_search`, query, limit],
    () => semanticSearch(query, limit)
  );

  return {
    data,
    error,
    isLoading: !data && !error,
  };
};

export const getGraphOverview = async () => {
  const api = `${datasetServer}/get_graph_overview`;
  const res = await fetch(basePath + api).catch((error) => {
    console.error('Error:', error);
  });
  if (res && res.ok) {
    return await res.json();
  }
};
