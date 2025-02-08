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
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({});

const PinBoard = (props) => {
  const { nodes, demo } = props;
  const [pinNodes, setPinNodes] = useState([]);
  const [scale, setScale] = useState(demo ? 1 : 0.1);

  useEffect(() => {
    setPinNodes(nodes.filter((node) => node.config.pin));
  }, [nodes]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setScale(0.1);
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
          borderRadius: '20px',
          background: theme.palette.flow.pinBoard,
          position: 'fixed',
          bottom: scale === 1 ? '50%' : '2%',
          right: scale === 1 ? '50%' : '1%',
          zIndex: 1111,
          border:
            scale === 1
              ? 'none'
              : scale === 0.5
              ? '2px solid #424242'
              : '5px solid #424242',
          transition: '1s',
          transform:
            scale === 1
              ? `translate(50%, 50%) scale(${scale})`
              : `scale(${scale})`,
          transformOrigin: 'bottom right',
        }}
      >
        {scale === 1 || (
          <>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                setScale(1);
              }}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                cursor: 'pointer',
                transform: `scale(${1.5 / (scale * 0.2)})`,
                zIndex: 1,
              }}
            />
            {scale < 0.5 && (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setScale(0.5);
                }}
                sx={{
                  position: 'absolute',
                  bottom: '50%',
                  right: '50%',
                  cursor: 'pointer',
                  transform: `scale(${1.5 / (scale * 0.5)})`,
                  zIndex: 1,
                }}
              />
            )}
          </>
        )}
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            setScale(0.1);
          }}
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            cursor: 'pointer',
            transform: `scale(${1.5 / (scale * 0.2)})`,
            zIndex: 1,
            transition: 'transform 1s ease-in-out',
          }}
        />
        {scale &&
          pinNodes &&
          pinNodes.length > 0 &&
          pinNodes.map((nodeData, index) => {
            try {
              return <NodeType key={index} {...nodeData} />;
            } catch (e) {
              console.log(e);
            }
          })}
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
