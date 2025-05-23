import { nanoid } from 'nanoid';
import { random } from 'lodash';

export const initStore = (state) => {
  if (state) {
    return {
      type: 'INIT_STORE',
      payload: {
        ...state,
        flowInited: false,
        logs: '',
        isAlive: false,
        loading: false,
      },
    };
  } else {
    return {
      type: 'INIT_STORE',
      payload: {
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
        flowId: 'temp' + nanoid(),
        author: null,
        flowInited: false,
        logs: '',
        isAlive: false,
        loading: false,
      },
    };
  }
};
export const updateMeta = (meta) => ({
  type: 'UPDATE_META',
  payload: meta,
});

export const updateOutput = (id, data) => ({
  type: 'UPDATE_OUTPUT',
  payload: { id, data },
});

export const updateConfig = (id, config) => ({
  type: 'UPDATE_CONFIG',
  payload: { id, config },
});

export const updateZIndex = (id, zIndex) => ({
  type: 'UPDATE_ZINDEX',
  payload: { id, zIndex },
});

export const runAll = () => ({
  type: 'RUN_ALL',
});

export const stopAll = () => ({
  type: 'STOP_ALL',
});

export const onConnect = (data) => ({
  type: 'ON_CONNECT',
  payload: data,
});

export const onNodesChange = (change) => ({
  type: 'ON_NODES_CHANGE',
  payload: change,
});

export const onEdgesChange = (change) => ({
  type: 'ON_EDGES_CHANGE',
  payload: change,
});

export const addNode = (data) => ({
  type: 'ADD_NODE',
  payload: data,
});

export const updateNode = (id, prop) => ({
  type: 'UPDATE_NODE',
  payload: { id, prop },
});

export const removeNode = (id) => ({
  type: 'REMOVE_NODE',
  payload: id,
});

export const addEdge = (data) => ({
  type: 'ADD_EDGE',
  payload: data,
});

export const updateEdge = (edge) => ({
  type: 'UPDATE_EDGE',
  payload: edge,
});

export const removeEdge = (id) => ({
  type: 'REMOVE_EDGE',
  payload: id,
});
export const updateViewPort = (view) => ({
  type: 'UPDATE_VIEWPORT',
  payload: view,
});
