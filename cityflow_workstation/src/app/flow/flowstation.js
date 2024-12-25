'use client';
import ReactFlow, { Background } from 'reactflow';
import React, { use, useEffect, useState } from 'react';

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
import FlowHeader from './utils/FlowHeader';
import Header from '@/components/Header';

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

import { useGetWorkflow, useGetModule } from '@/utils/dataset';
import { killExecutor } from '@/utils/executor';
import { usePreloadedModules } from '@/utils/package';
import { setupExecutor } from '@/utils/executor';
import { getUserFlow } from '@/utils/local';
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
  const local = searchParams.get('local');
  const pinBoard = searchParams.get('pinBoard');
  const [initData, setInitData] = useState(null);
  const [localFlowData, setLocalFlowData] = useState(null);
  const workflowData = useGetWorkflow(id || null);
  const moduleData = useGetModule(module || null);

  const { modules, isLoading, error } = usePreloadedModules();

  const initAndRunALL = () => {
    if (props.state.packages == undefined) return;
    const packages = props.state.packages.split('\n');
    // console.log('Initing environment...');
    modules &&
      setupExecutor(props.state.flowId, packages, props.state.image).then(
        (data) => {
          // console.log('Environment inited');
          setMeta({ flowInited: true });
          runAll();
        }
      );
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

  const precoessModule = (moduleData) => {
    return {
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
  };

  const panOnDrag = [1, 2];

  const flow = (
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
        initFlow(initData, instance);
      }}
      deleteKeyCode={null}
      minZoom={0.1}
      panOnDrag={panOnDrag}
      selectionOnDrag
    >
      <FlowHeader />
      <PinBoard />
      {/* <ContextMenu /> */}
      <StyledControls />
      <Background />
    </ReactFlow>
  );

  const workStation = (
    <div
      id="react-flow"
      style={{
        background: `radial-gradient(circle, ${theme.palette.home.flow}, rgba(0, 0, 0, 0.5))`,
        width: '100%',
        height: '100%',
      }}
    >
      {!id && !module ? (
        flow
      ) : initData ? (
        flow
      ) : (
        <>
          <Header />
          <img
            src="/static/fetching_2xlarge.gif"
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        </>
      )}
    </div>
  );

  const flowPanel = <FlowPanel />;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const flowData = getUserFlow(id);
      console.log(flowData);
      setLocalFlowData(flowData);
    }
  }, []);

  useEffect(() => {
    if (workflowData?.data) {
      setInitData(workflowData.data);
    }
    if (moduleData?.data) {
      setInitData(precoessModule(moduleData.data));
    }
    if (localFlowData) {
      setInitData(localFlowData);
    }
  }, [workflowData?.data, moduleData?.data, localFlowData]);

  useEffect(() => {
    // initialize the store when the component is unmounted
    return () => {
      initStore(null);
      killExecutor(props.state.flowId);
    };
  }, []);

  useEffect(() => {
    if (pinBoard && modules) {
      setMeta({ globalScale: 1 });
      initAndRunALL();
    } else if (run && modules) {
      initAndRunALL();
    }
  }, [run, props.state.packages, pinBoard, modules]);

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
          childrenTwo={workStation}
        />
      </div>
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(FlowStation);
