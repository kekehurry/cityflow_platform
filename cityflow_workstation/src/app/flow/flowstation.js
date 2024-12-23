'use client';
import ReactFlow, { Background } from 'reactflow';
import React, { useEffect } from 'react';

import {
  onConnect,
  onEdgesChange,
  onNodesChange,
  updateViewPort,
  runAll,
  initStore,
  updateMeta,
} from '@/store/actions';
import { connect } from 'react-redux';

import FlowPanel from './utils/FlowPanel';
import PinBoard from './utils/PinBoard';
import StyledControls from './utils/FlowControl';
import Header from './utils/Header';

// import ContextMenu from './utils/ContextMenu';

import ResizableDrawer from '@/components/ResizableDrawer';

import BaseNode from '@/elements/nodes/base';
import ExpandNode from '@/elements/nodes/expand';
import AnnotationNode from '@/elements/nodes/annotation';
import PinNode from '@/elements/nodes/pin';
// import PackNode from '@/elements/nodes/pack';
// import ConnectorNode from '@/elements/nodes/connector';
import ButtonEdge from '@/elements/edges/base';
import InvisibleEdge from '@/elements/edges/invisible';
import wrapper from '@/elements/nodes/wrapper';
import { debounce } from 'lodash';

import 'reactflow/dist/style.css';
import { useSearchParams } from 'next/navigation';
import theme from '@/theme';

import { getWorkflow, getModule } from '@/utils/dataset';
import { killExecutor } from '@/utils/executor';
import { preloadModules } from '@/utils/package';
import { setupExecutor } from '@/utils/executor';
import { nanoid } from 'nanoid';

const mapStateToProps = (state, ownProps) => {
  return {
    state: state,
    nodes: state.nodes,
    edges: state.edges,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  onConnect: (data) => dispatch(onConnect(data)),
  onNodesChange: debounce((changes) => dispatch(onNodesChange(changes))),
  onEdgesChange: debounce((changes) => dispatch(onEdgesChange(changes))),
  addNode: (node) => dispatch(addNode({ ...node })),
  addEdge: (edge) => dispatch(addEdge({ ...edge })),
  runAll: () => dispatch(runAll()),
  updateViewPort: (view) => dispatch(updateViewPort(view)),
  initStore: (state) => dispatch(initStore(state)),
  setMeta: (meta) => dispatch(updateMeta(meta)),
});

const nodeTypes = {
  base: wrapper(BaseNode),
  expand: wrapper(ExpandNode),
  annotation: wrapper(AnnotationNode),
  pin: PinNode,
  // "pack": PackNode,
  // "connector": ConnectorNode
};
const edgeTypes = { base: ButtonEdge, invisible: InvisibleEdge };

const FlowStation = (props) => {
  const {
    nodes,
    edges,
    onConnect,
    onNodesChange,
    onEdgesChange,
    updateViewPort,
    initStore,
    setMeta,
    runAll,
  } = props;
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const module = searchParams.get('module');
  const run = searchParams.get('run');
  const pinBoard = searchParams.get('pinBoard');

  const initAndRunALL = () => {
    if (props.state.packages == undefined) return;
    const packages = props.state.packages.split('\n');
    preloadModules().then(() => {
      // console.log('Initing environment...');
      setupExecutor(props.state.flowId, packages, props.state.image).then(
        (data) => {
          // console.log('Environment inited');
          setMeta({ flowInited: true });
          runAll();
        }
      );
    });
  };

  const initFlow = (flow, instance) => {
    if (!flow?.id) return;
    const { id, ndoes, edges, ...res } = flow;
    setMeta({
      ...res,
      flowId: id,
      flowInited: false,
      globalScale: 0.1,
      showcase: false,
    });
    instance.setViewport(flow.viewport);
    instance.setNodes(flow.nodes);
    instance.setEdges(flow.edges);
  };

  const fetchFlow = (instance) => {
    if (id) {
      console.log('fetching workflow', id);
      getWorkflow(id)
        .then((data) => {
          initFlow(data, instance);
        })
        .catch((err) => console.log(err));
    }
    // fetch module from server
    else if (module) {
      getModule(module)
        .then((moduleData) => {
          const flow = {
            id: nanoid(),
            nodes: [
              {
                id: module,
                type: 'expand',
                data: {
                  input: null,
                  output: null,
                  module: 'core/builder/index.js',
                },
                position: {
                  x: Math.random() * window.innerWidth * 0.3,
                  y:
                    Math.random() * window.innerHeight * 0.4 +
                    window.innerHeight * 0.1,
                },
                config: { ...moduleData },
              },
            ],
            edges: [],
            viewport: { x: 0, y: 0, zoom: 1 },
          };
          initFlow(flow, instance);
        })
        .catch((err) => console.log(err));
    }
  };

  const panOnDrag = [1, 2];

  const flow = (
    <div
      id="react-flow"
      style={{
        background: `radial-gradient(circle, ${theme.palette.home.flow}, rgba(0, 0, 0, 0.5))`,
        width: '100%',
        height: '100%',
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onConnect={onConnect}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        proOptions={{ hideAttribution: true }}
        onContextMenu={(e) => e.preventDefault()}
        onMove={(e, v) => updateViewPort(v)}
        onInit={(instance) => {
          fetchFlow(instance);
        }}
        deleteKeyCode={null}
        minZoom={0.1}
        panOnDrag={panOnDrag}
        selectionOnDrag
      >
        <Header />
        <PinBoard />
        {/* <ContextMenu /> */}
        <StyledControls />
        <Background />
      </ReactFlow>
    </div>
  );

  const flowPanel = <FlowPanel />;

  useEffect(() => {
    // initialize the store when the component is unmounted
    return () => {
      initStore(null);
      killExecutor(props.state.flowId);
    };
  }, []);

  useEffect(() => {
    if (pinBoard) {
      setMeta({ globalScale: 1 });
      initAndRunALL();
    } else if (run) {
      initAndRunALL();
    }
  }, [run, props.state.packages, pinBoard]);

  return (
    <>
      <div
        style={{
          width: '100vw',
          height: '100vh',
        }}
      >
        <ResizableDrawer
          direction="horizontal"
          childrenOne={flowPanel}
          childrenTwo={flow}
        />
      </div>
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(FlowStation);
