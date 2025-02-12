import React, { PureComponent, useEffect, memo } from 'react';
import { Resizable } from 're-resizable';
import { Typography, Box, CircularProgress, Paper } from '@mui/material';
import { connect } from 'react-redux';
import { updateOutput, updateConfig } from '@/store/actions';
import theme from '@/theme';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RemoveIcon from '@mui/icons-material/Remove';
import DragHandleIcon from '@mui/icons-material/DragHandle';

import Loading from '@/components/Loading';

const mapStateToProps = (state, ownProps) => ({
  state: state,
  input: state.nodes.find((node) => node.id === ownProps.id)?.data.input,
  output: state.nodes.find((node) => node.id === ownProps.id)?.data.output,
  config: state.nodes.find((node) => node.id === ownProps.id)?.config,
  id: ownProps.id,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  setConfig: (config) => {
    dispatch(updateConfig(ownProps.id, { ...config }));
  },
  setGlobalOutput: (output) => {
    dispatch(updateOutput(ownProps.id, { ...output }));
  },
});

class PinNode extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      localOutput: null,
      expanded: true,
      loading: false,
      pinWidth: props.config?.pinWidth,
      pinHeight: props.config?.pinHeight,
      pinTop: props.config?.pinTop,
      pinLeft: props.config?.pinLeft,
      currentX: props.config?.pinLeft || 100 + Math.floor(Math.random() * 200),
      currentY: props.config?.pinTop || 100 + Math.floor(Math.random() * 200),
      isDragging: false,
      isAnimating: false,
      dragStartX: 0,
      dragStartY: 0,
    };

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
  }

  setOutput = (output) => {
    this.setState({ localOutput: output });
  };

  setLoading = (loading) => {
    this.setState({ loading: loading });
  };

  componentDidUpdate(prevProps, prevState) {
    // child module only update the localOutput to prevent infinite loop
    // if localOutput has changed, update the globalOutput
    if (!_.isEqual(prevState.localOutput, this.state.localOutput)) {
      if (
        this.state.localOutput &&
        Object.keys(this.state.localOutput).length > 0
      ) {
        this.props.setGlobalOutput(this.state.localOutput);
      } else {
        this.props.setGlobalOutput(null);
      }
    }
    if (this.props.config?.html) {
      this.setLoading(false);
    }
  }

  componentDidMount() {
    this.setLoading(true);
    if (this.handleRef) {
      this.handleRef.addEventListener('mousedown', this.handleMouseDown);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
  }

  handleResize = (e, direction, ref, d) => {
    this.props.setConfig({
      ...this.props.config,
      pinWidth: ref.offsetWidth,
      pinHeight: ref.offsetHeight,
    });
  };

  handleMouseDown(e) {
    if (e.target.closest(`.drag-handle-${this.props.id}`)) {
      this.setState({
        isDragging: true,
        dragStartX: e.clientX,
        dragStartY: e.clientY,
      });
      window.addEventListener('mousemove', this.handleMouseMove);
      window.addEventListener('mouseup', this.handleMouseUp);
      document.body.style.userSelect = 'none'; // 防止选中文本
    }
  }

  handleMouseMove(e) {
    if (!this.state.isDragging) return;

    // 计算鼠标移动的距离
    const deltaX = e.clientX - this.state.dragStartX;
    const deltaY = e.clientY - this.state.dragStartY;

    // 使用 requestAnimationFrame 控制拖拽更新
    if (!this.state.isAnimating) {
      this.setState({ isAnimating: true });
      window.requestAnimationFrame(() => {
        this.setState((prevState) => ({
          currentX: prevState.currentX + deltaX,
          currentY: prevState.currentY + deltaY,
          dragStartX: e.clientX,
          dragStartY: e.clientY,
          isAnimating: false,
        }));
      });
    }
  }

  handleMouseUp() {
    if (!this.state.isDragging) return;
    this.props.setConfig({
      ...this.props.config,
      pinTop: this.state.currentY,
      pinLeft: this.state.currentX,
    });

    this.setState({ isDragging: false });
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
    document.body.style.userSelect = '';
  }

  render() {
    const {
      input,
      output,
      config,
      setConfig,
      targetRef,
      handleRef,
      interfaceComponent,
      children,
    } = this.props;
    const headerHeight = 40;
    const mapModule = (children) =>
      React.isValidElement(children) &&
      React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          input,
          output,
          config,
          setOutput: this.setOutput,
        });
      });
    return (
      <Box
        ref={targetRef}
        onKeyDown={(event) => {
          // Prevent this event from bubbling up to the parent
          event.stopPropagation();
        }}
        sx={{
          display: 'flex',
          background: theme.palette.pin.main,
          border: theme.palette.pin.border,
          borderRadius: '5px',
          position: 'absolute',
          top: this.state.currentY,
          left: this.state.currentX,
          cursor: this.state.isDragging ? 'grabbing' : 'default',
        }}
      >
        <Resizable
          bounds="window"
          onResizeStop={this.handleResize}
          defaultSize={{
            width: config?.pinWidth || config?.width,
            height: config?.pinHeight || config?.height,
          }}
          // enable={{ bottomRight: true, right: true, bottom: true }}
        >
          <Paper
            variant="outlined"
            sx={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              width: config?.pinWidth || config?.width,
              height: config?.pinHeight || config?.height,
              p: 0,
              m: 0,
              border: 'none',
            }}
          >
            <Box
              // ref={handleRef}
              sx={{
                width: '100%',
                height: 20,
                display: 'flex',
                top: 0,
                alignContent: 'center',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'none',
                position: 'relative',
              }}
            >
              <Typography variant="caption"> {config?.title || ''} </Typography>
              <DragHandleIcon
                className={`drag-handle-${this.props.id}`}
                ref={(ref) => (this.handleRef = ref)}
                // ref={handleRef}
                fontSize="10px"
                sx={{
                  color: '#5c5d5d',
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  cursor: 'grab',
                  ':active': { cursor: 'grabbing' },
                }}
              />
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  position: 'absolute',
                  right: 10,
                }}
              >
                {this.state.loading ? (
                  <CircularProgress
                    size={10}
                    sx={{ color: '#FFB300', cursor: 'pointer' }}
                    onClick={() => {
                      this.setState({ loading: false });
                      setConfig({ ...config, run: false });
                    }}
                  />
                ) : (
                  <PlayArrowIcon
                    fontSize="1px"
                    onClick={() => {
                      this.setState({ error: false, warning: false });
                      setConfig({ ...config, run: !config?.run });
                    }}
                    sx={{
                      cursor: 'pointer',
                      color: config?.run ? '#4bec13' : '#5c5d5d',
                      transform: 'scale(0.8)',
                    }}
                  />
                )}
                <RemoveIcon
                  fontSize="10px"
                  sx={{ cursor: 'pointer', marginLeft: 1, color: '#5c5d5d' }}
                  onClick={() => {
                    this.props.setConfig({ ...config, pin: false });
                  }}
                />
              </Box>
            </Box>
            {this.state.loading ? (
              <Loading dotSize={10} />
            ) : (
              interfaceComponent &&
              this.props.state.globalScale >= 0.5 &&
              !this.state.isDragging &&
              mapModule(interfaceComponent)
            )}
          </Paper>
        </Resizable>
      </Box>
    );
  }
}

export default memo(connect(mapStateToProps, mapDispatchToProps)(PinNode));
