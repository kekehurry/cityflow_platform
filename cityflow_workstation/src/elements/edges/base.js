import React, { PureComponent, memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useEdges,
  useReactFlow,
} from 'reactflow';
import { Box } from '@mui/material';
import RemoveCircleOutlinedIcon from '@mui/icons-material/RemoveCircleOutlined';
import { connect } from 'react-redux';
import { removeEdge } from '@/store/actions';
import theme from '@/theme';

const mapStateToProps = (state, ownProps) => ({});

const mapDispatchToProps = (dispatch, ownProps) => ({
  removeEdge: () => dispatch(removeEdge(ownProps.id)),
});

class ButtonEdge extends PureComponent {
  render() {
    const {
      id,
      markerEnd,
      style,
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      ...props
    } = this.props;
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    return (
      <>
        <BaseEdge
          path={edgePath}
          markerEnd={markerEnd}
          style={{
            stroke: theme.palette.edge.main,
            strokeWidth: '2px',
          }}
        />
        <EdgeLabelRenderer>
          <Box
            sx={{
              position: 'absolute',
              zIndex: 0,
              transform: `translate(-50%, -50%) translate(${labelX}px,${
                labelY + 1
              }px)`,
              // everything inside EdgeLabelRenderer has no pointer events by default
              // if you have an interactive element, set pointer-events: all
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <RemoveCircleOutlinedIcon
              onClick={props.removeEdge}
              sx={{ cursor: 'pointer', fontSize: 14 }}
            />
          </Box>
        </EdgeLabelRenderer>
      </>
    );
  }
}

export default memo(connect(mapStateToProps, mapDispatchToProps)(ButtonEdge));
