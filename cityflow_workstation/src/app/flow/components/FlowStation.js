'use client';
import ReactFlow from 'reactflow';
import React, { useEffect, useState } from 'react';
import Loading from '@/components/Loading';
import {
  onConnect,
  onEdgesChange,
  onNodesChange,
  updateViewPort,
  initStore,
  updateMeta,
} from '@/store/actions';
import { connect } from 'react-redux';

import PinBoard from '../utils/PinBoard';
import StyledControls from '../utils/FlowControl';
import GridBackground from '../utils/GridBackground';
import RunButtons from '../utils/RunButtons';
import FlowHeader from '../utils/FlowHeader';
import ContextMenu from '../utils/ContextMenu';

import Header from '@/components/Header';

import BaseNode from '@/elements/nodes/base';
import ExpandNode from '@/elements/nodes/expand';
import AnnotationNode from '@/elements/nodes/annotation';
import PinNode from '@/elements/nodes/pin';
import ButtonEdge from '@/elements/edges/base';
import InvisibleEdge from '@/elements/edges/invisible';
import wrapper from '@/elements/nodes/wrapper';
import { debounce, set } from 'lodash';

import 'reactflow/dist/style.css';
import { useSearchParams } from 'next/navigation';
import theme from '@/theme';

import { useGetWorkflow, useGetModule } from '@/utils/dataset';
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
  updateViewPort: (view) => dispatch(updateViewPort(view)),
  initStore: (state) => dispatch(initStore(state)),
  setMeta: (meta) => dispatch(updateMeta(meta)),
});

const nodeTypes = {
  base: wrapper(BaseNode),
  expand: wrapper(ExpandNode),
  annotation: wrapper(AnnotationNode),
  pin: PinNode,
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
  } = props;

  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const module = searchParams.get('module');
  const demo = searchParams.get('demo');
  const embed = searchParams.get('embed');

  const [initData, setInitData] = useState(null);

  const workflowData = useGetWorkflow(id || null);
  const moduleData = useGetModule(module || null);

  const initFlow = (flow, instance) => {
    if (!flow?.id) return;
    const { id, ndoes, edges, ...res } = flow;
    setMeta({
      ...res,
      flowId: id,
      flowInited: false,
      showcase: false,
      loading: false,
      isAlive: false,
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

  useEffect(() => {
    if (workflowData?.data) {
      setInitData(workflowData.data);
    }
    if (moduleData?.data) {
      setInitData(precoessModule(moduleData.data));
    }
  }, [workflowData?.data, moduleData?.data]);

  useEffect(() => {
    return () => {
      initStore(null);
    };
  }, []);

  return (
    <div
      id="react-flow"
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      {(!id && !module) || initData ? (
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
          panOnDrag={[1]}
          selectionOnDrag
        >
          {embed || <FlowHeader />}
          {embed || <PinBoard demo={demo} />}
          {embed && (
            <div
              style={{
                position: 'absolute',
                top: 30,
                right: 30,
              }}
            >
              <RunButtons />
            </div>
          )}
          <ContextMenu />
          <StyledControls />
          <GridBackground />
        </ReactFlow>
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: theme.palette.flow.background,
          }}
        >
          {embed || <Header />}
          <Loading dotSize={15} />
        </div>
      )}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(FlowStation);
