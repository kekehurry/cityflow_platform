import React, { PureComponent, memo } from 'react';
import { connect } from 'react-redux';
import { updateOutput, updateConfig, removeNode } from '@/store/actions';
import _ from 'lodash';
import theme from '@/theme';
import { NodeResizer, NodeToolbar } from 'reactflow';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import LoopIcon from '@mui/icons-material/Loop';

const mapStateToProps = (state, ownProps) => ({
  config: state.nodes.find((node) => node.id === ownProps.id)?.config,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  setConfig: (config) => {
    dispatch(updateConfig(ownProps.id, { ...config }));
  },
  removeNode: () => dispatch(removeNode(ownProps.id)),
});

class AnnotationNode extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      resizable: false,
      rotate: props.config.rotate || 0,
    };
    this.isRotating = false;
    this.startAngle = 0;
    this.center = { x: 0, y: 0 };
  }

  componentDidMount() {
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
  }

  setOutput = (output) => {
    this.setState({ localOutput: output });
  };

  handleDelete = () => {
    this.props.removeNode(this.props.id);
  };

  handleRotateStart = (e) => {
    const rect = e.target.getBoundingClientRect();
    this.center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    const dx = e.clientX - this.center.x;
    const dy = e.clientY - this.center.y;
    this.startAngle = Math.atan2(dy, dx);
    this.isRotating = true;
  };

  handleMouseMove = (e) => {
    if (this.isRotating) {
      const dx = e.clientX - this.center.x;
      const dy = e.clientY - this.center.y;
      const angle = Math.atan2(dy, dx);
      const rotate = (angle - this.startAngle) * (180 / Math.PI);
      this.setState({ rotate });
      this.props.setConfig({ ...this.props.config, rotate: rotate });
    }
  };

  handleMouseUp = () => {
    if (this.isRotating) {
      this.isRotating = false;
    }
  };

  render() {
    const { children, config, setConfig } = this.props;
    const fontSize = 12;
    return (
      <>
        <NodeResizer
          className="annotation"
          onResize={(e, params) => {
            setConfig({
              ...config,
              width: params.width,
              height: params.height,
            });
          }}
          isVisible={this.state.resizable}
          color={theme.palette.secondary.main}
        />
        <div
          style={{ transform: `rotate(${this.state.rotate}deg)` }}
          onKeyDown={(event) => {
            // Prevent this event from bubbling up to the parent
            event.stopPropagation();
          }}
        >
          <NodeToolbar style={{ position: 'absolute', top: 1, left: 1, mr: 2 }}>
            <LoopIcon
              sx={{ fontSize, color: '#5c5d5d', mr: 2, cursor: 'pointer' }}
              onMouseDown={this.handleRotateStart}
            />
            <AspectRatioIcon
              onClick={() =>
                this.setState({
                  resizable: !this.state.resizable,
                  ml: 2,
                  mr: 2,
                })
              }
              sx={{
                fontSize,
                color: this.state.resizable
                  ? theme.palette.secondary.main
                  : '#5c5d5d',
                cursor: 'pointer',
              }}
            />
            <RemoveCircleIcon
              onClick={this.handleDelete}
              sx={{ fontSize, color: '#5c5d5d', ml: 2, cursor: 'pointer' }}
            />
          </NodeToolbar>
          <div style={{ width: config.width, height: config.height }}>
            {React.Children.map(children, (child) => {
              return React.cloneElement(child, {
                config,
                setConfig,
              });
            })}
          </div>
        </div>
      </>
    );
  }
}

export default memo(
  connect(mapStateToProps, mapDispatchToProps)(AnnotationNode)
);
