import { applyNodeChanges, applyEdgeChanges } from 'reactflow';
import { nanoid } from 'nanoid';
import { random } from 'lodash';

const initState = {
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  flowId: 'temp' + nanoid(),
  author: `test_user_${random(1000)}`,
  flowInited: false,
};

const getHandleKey = (handleID) => {
  return handleID.split('||')[1];
};

const clearLinkedNode = (state, nodeId, updatedNodes = []) => {
  const edges = state.edges.filter((edge) => edge.source === nodeId);
  // if the node has no edges, return the updated nodes
  if (edges.length === 0) {
    return updatedNodes;
  }
  // get the target nodes of the edges
  let targetNodes = edges.map((edge) =>
    state.nodes.find((node) => node.id === edge.target)
  );
  // clear the input && output of the target nodes
  targetNodes = targetNodes.map((targetNode) => {
    const updatedNode = {
      ...targetNode,
      data: {
        ...targetNode.data,
        input: null,
        output: null,
      },
    };
    updatedNodes.push(updatedNode);
    return updatedNode;
  });
  // recursively update linked nodes for each target node
  targetNodes.forEach((targetNode) =>
    clearLinkedNode(state, targetNode.id, updatedNodes)
  );

  return updatedNodes;
};

const reducer = (state = initState, action) => {
  switch (action.type) {
    case 'INIT_STORE':
      // initialize the store
      return {
        ...initState,
        ...action.payload,
      };
    case 'UPDATE_META':
      // update the meta data
      return {
        ...state,
        ...action.payload,
        nodes: state.nodes,
        edges: state.edges,
      };
    case 'UPDATE_OUTPUT':
      //update the data through the edges
      const edges = state.edges.filter(
        (edge) => edge.source === action.payload.id
      );
      const node = state.nodes.find((node) => node.id === action.payload.id);
      const targetData = edges.reduce((acc, edge) => {
        const targetID = edge.target;
        const targetNode = state.nodes.find((node) => node.id === targetID);
        if (!acc[targetID]) {
          acc[targetID] = targetNode.data.input;
        }
        // update the target node data with the linked input node data
        const sourceKey = getHandleKey(edge.sourceHandle);
        const targetKey = getHandleKey(edge.targetHandle);
        acc[targetID] = action.payload.data && {
          ...targetNode.data.input,
          [targetKey]: action.payload.data[sourceKey],
        };
        return acc;
      }, {});
      return {
        ...state,
        nodes: state.nodes.map((node) =>
          node.id === action.payload.id // update the node
            ? {
                ...node, // copy all other properties of the node
                data: {
                  // update the node data
                  ...node.data, // copy the node data except input
                  output: action.payload.id && action.payload.data, // update the output of current node
                },
              }
            : targetData[node.id] // update the target node
            ? {
                ...node,
                data: {
                  ...node.data, // copy the node data except output
                  input: targetData[node.id], // update the target node with updated data
                },
              }
            : node
        ),
      };
    case 'UPDATE_CONFIG':
      // update the node config
      return {
        ...state,
        nodes: state.nodes.map((node) =>
          node.id === action.payload.id // update the node
            ? {
                ...node, // copy all other properties of the node
                config: action.payload.config, // update the node config
              }
            : node
        ),
      };

    case 'UPDATE_ZINDEX':
      // update the node style
      return {
        ...state,
        nodes: state.nodes.map((node) =>
          node.id === action.payload.id // update the node
            ? {
                ...node, // copy all other properties of the node
                zIndex: action.payload.zIndex, // update the node config
                selected: true,
              }
            : {
                ...node,
                selected: false,
              }
        ),
      };

    case 'RUN_ALL':
      // run all the nodes
      return {
        ...state,
        nodes: state.nodes.map((node) => {
          return { ...node, config: { ...node.config, run: true } };
        }),
      };

    case 'STOP_ALL':
      // stop all the nodes
      return {
        ...state,
        nodes: state.nodes.map((node) => {
          return { ...node, config: { ...node.config, run: false } };
        }),
      };
    case 'ON_CONNECT':
      // flow the data from source node to target node
      const newEdge = { id: nanoid(6), ...action.payload, type: 'base' };
      const sourceData = state.nodes.find(
        (node) => node.id === action.payload.source
      ).data.output;
      const sourceKey = getHandleKey(action.payload.sourceHandle);
      const targetKey = getHandleKey(action.payload.targetHandle);
      return {
        ...state,
        edges: [...state.edges, newEdge],
        nodes: state.nodes.map((node) => {
          return node.id === action.payload.target // update the target node
            ? {
                ...node, // copy all other properties of the node
                // update node data
                data:
                  node.id === action.payload.target //update the target node
                    ? {
                        ...node.data, //copy the node data except input
                        input: sourceData &&
                          sourceData[sourceKey] && {
                            ...node.data.input,
                            [targetKey]: sourceData[sourceKey],
                          },
                      }
                    : node.data,
              }
            : node;
        }),
      };

    case 'ON_NODES_CHANGE':
      // apply the node changes
      return {
        ...state,
        nodes: applyNodeChanges(action.payload, state.nodes),
      };

    case 'ON_EDGES_CHANGE':
      // apply the edge changes
      return {
        ...state,
        edges: applyEdgeChanges(action.payload, state.edges),
      };

    case 'ADD_NODE':
      //add a new node
      return {
        ...state,
        nodes: [...state.nodes, action.payload],
      };

    case 'UPDATE_NODE':
      // update the node
      return {
        ...state,
        nodes: state.nodes.map((node) =>
          node.id === action.payload.id // update the node
            ? {
                ...node, // copy all other properties of the node
                ...action.payload.prop, // update the node data
              }
            : node
        ),
      };

    case 'REMOVE_NODE':
      // remove the node and clear the linked nodes
      const clearedNdoes = clearLinkedNode(state, action.payload, []);
      const clearedId = clearedNdoes.map((node) => node.id);
      const nonLinkedNodes = state.nodes.filter(
        (node) => !clearedId.includes(node.id) && node.id !== action.payload
      );
      return {
        ...state,
        nodes: [...clearedNdoes, ...nonLinkedNodes],
        edges: state.edges.filter(
          (edge) =>
            edge.source !== action.payload && edge.target !== action.payload
        ),
      };

    case 'ADD_EDGE':
      // add a new edge
      return {
        ...state,
        edges: [...state.edges, action.payload],
      };

    case 'UPDATE_EDGE':
      // update the edge
      return {
        ...state,
        edges: state.edges.map((edge) =>
          edge.id === action.payload.id ? { ...action.payload } : edge
        ),
      };

    case 'REMOVE_EDGE':
      // remove the edge and clear the linked nodes
      const edge = state.edges.find((edge) => edge.id === action.payload);
      let targetNode = state.nodes.find((node) => node.id === edge.target);
      const targetHandleKey = getHandleKey(edge.targetHandle);
      targetNode.data.input &&
        targetNode.data.input[targetHandleKey] &&
        delete targetNode.data.input[targetHandleKey];
      targetNode.data.output = null;
      const clearedTargetNodes = clearLinkedNode(state, edge.target, []);
      const clearedTargetIds = clearedTargetNodes.map((node) => node.id);
      const nonLinkedTargetNodes = state.nodes.filter(
        (node) => !clearedTargetIds.includes(node.id) && node.id !== edge.target
      );
      const updatedNodes = [
        targetNode,
        ...clearedTargetNodes,
        ...nonLinkedTargetNodes,
      ];
      const changes = updatedNodes.map((node) => {
        return { type: 'select', id: node.id, selected: false };
      });
      return {
        ...state,
        nodes: applyNodeChanges(changes, updatedNodes),
        edges: state.edges.filter((edge) => edge.id !== action.payload),
      };
    case 'UPDATE_VIEWPORT':
      return {
        ...state,
        viewport: action.payload,
      };
    default:
      return state;
  }
};

export default reducer;
