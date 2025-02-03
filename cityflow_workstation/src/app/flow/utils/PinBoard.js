import wrapper from '@/elements/nodes/wrapper';
import { connect } from 'react-redux';
import PinNode from '@/elements/nodes/pin';
import { useState, useEffect } from 'react';
import { Box, IconButton, Card, Button } from '@mui/material';
import SouthEastIcon from '@mui/icons-material/SouthEast';
import NorthWestIcon from '@mui/icons-material/NorthWest';
import theme from '@/theme';
import { updateMeta } from '@/store/actions';

const NodeType = wrapper(PinNode);

const mapStateToProps = (state, ownProps) => {
  return {
    nodes: state.nodes,
    globalScale: state?.globalScale || 0.1,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  setGlobalScale: (globalScale) => dispatch(updateMeta({ globalScale })),
});

const PinBoard = (props) => {
  const { nodes, globalScale, setGlobalScale } = props;
  const [pinNodes, setPinNodes] = useState([]);

  useEffect(() => {
    setPinNodes(nodes.filter((node) => node.config.pin));
  }, [nodes]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setGlobalScale(0.1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [globalScale, setGlobalScale]);

  return (
    <>
      {globalScale === 1 && (
        <Box
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: theme.palette.flow.main,
            zIndex: 1110,
          }}
        ></Box>
      )}
      <Card
        variant="outlined"
        elevation={0}
        onClick={() => {
          globalScale === 1 || setGlobalScale(0.5);
        }}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '20px',
          background: theme.palette.flow.main,
          position: 'fixed',
          bottom: globalScale === 1 ? '50%' : '2%',
          right: globalScale === 1 ? '50%' : '1%',
          zIndex: 1111,
          border:
            globalScale === 1
              ? 'none'
              : globalScale === 0.5
              ? '2px solid #424242'
              : '5px solid #424242',
          transition: '1s',
          transform:
            globalScale === 1
              ? `translate(50%, 50%) scale(${globalScale})`
              : `scale(${globalScale})`,
          transformOrigin: 'bottom right',
        }}
      >
        {globalScale === 1 || (
          <>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                setGlobalScale(1);
              }}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                cursor: 'pointer',
                transform: `scale(${1.5 / (globalScale * 0.2)})`,
                zIndex: 1,
              }}
            />
            {globalScale < 0.5 && (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setGlobalScale(0.5);
                }}
                sx={{
                  position: 'absolute',
                  bottom: '50%',
                  right: '50%',
                  cursor: 'pointer',
                  transform: `scale(${1.5 / (globalScale * 0.5)})`,
                  zIndex: 1,
                }}
              />
            )}
          </>
        )}
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            setGlobalScale(0.1);
          }}
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            cursor: 'pointer',
            transform: `scale(${1.5 / (globalScale * 0.2)})`,
            zIndex: 1,
            transition: 'transform 1s ease-in-out',
          }}
        />
        {globalScale &&
          pinNodes &&
          pinNodes.length > 0 &&
          pinNodes.map((nodeData, index) => {
            try {
              return (
                <NodeType key={index} {...nodeData} globalScale={globalScale} />
              );
            } catch (e) {
              console.log(e);
            }
          })}
      </Card>
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(PinBoard);
