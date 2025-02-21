import wrapper from '@/elements/nodes/wrapper';
import { connect } from 'react-redux';
import PinNode from '@/elements/nodes/pin';
import { useState, useEffect } from 'react';
import { Box, IconButton, Card, Button } from '@mui/material';
import theme from '@/theme';
import { updateMeta } from '@/store/actions';
import RunButtons from './RunButtons';

const NodeType = wrapper(PinNode);

const mapStateToProps = (state, ownProps) => {
  return {
    nodes: state.nodes,
    globalScale: state.globalScale,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  setGlobalScale: (scale) => {
    dispatch(updateMeta({ globalScale: scale }));
  },
});

const PinBoard = (props) => {
  const { nodes, demo, globalScale } = props;
  const [pinNodes, setPinNodes] = useState([]);
  const [scale, setScale] = useState(demo ? 1 : 0.01);

  useEffect(() => {
    setScale(globalScale);
  }, [globalScale]);

  useEffect(() => {
    setPinNodes(nodes.filter((node) => node.config.pin));
  }, [nodes]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setScale(0);
        props.setGlobalScale(0.01);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scale]);

  return (
    <>
      {scale === 1 && (
        <Box
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 1110,
          }}
        ></Box>
      )}
      <Card
        variant="outlined"
        elevation={0}
        onClick={() => {
          scale === 1 || setScale(0.5);
        }}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '10px',
          background: theme.palette.flow.pinBoard,
          position: 'fixed',
          bottom: '50%',
          right: '50%',
          opacity: scale === 1 ? 1 : 0,
          zIndex: scale === 1 ? 1111 : 0,
          border: scale === 1 ? 'none' : '2px solid #424242',
          transition: '1s',
          transform:
            scale === 1
              ? `translate(50%, 50%) scale(${scale})`
              : `scale(${scale})`,
          transformOrigin: 'bottom right',
        }}
      >
        <Box
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'auto',
          }}
        >
          {pinNodes &&
            pinNodes.length > 0 &&
            pinNodes.map((nodeData, index) => {
              try {
                return <NodeType key={index} {...nodeData} />;
              } catch (e) {
                console.log(e);
              }
            })}
        </Box>
        {scale === 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: 30,
              right: '50%',
              transform: 'translate(50%, 0)',
            }}
          >
            <RunButtons />
          </div>
        )}
      </Card>
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(PinBoard);
