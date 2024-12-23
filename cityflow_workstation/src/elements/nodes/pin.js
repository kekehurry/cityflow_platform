import React, { PureComponent, useEffect, memo } from 'react';
import { Resizable } from 're-resizable';
import { useDraggable } from 'use-draggable';
import {
  Typography,
  Stack,
  Box,
  Divider,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { connect } from 'react-redux';
import { updateOutput, updateConfig } from '@/store/actions';
import theme from '@/theme';
import RemoveIcon from '@mui/icons-material/Remove';

import Runner from './utils/CustomRunner';
import { preloadModules } from '@/utils/package';

const mapStateToProps = (state, ownProps) => ({
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
      pinWidth: this.props.config.pinWidth,
      pinHeight: this.props.config.pinHeight,
      pinTop: this.props.config.pinTop,
      pinLeft: this.props.config.pinLeft,
      scope: null,
    };
  }

  init = () => {
    try {
      let importScope = {};
      const props = {
        input: this.props.input,
        config: this.props.config,
        setConfig: this.props.setConfig,
        setOutput: this.setOutput,
        loading: this.state.loading,
        setLoading: (loading) => {
          this.setState({ loading: loading });
        },
      };
      if (!this.props.config.packages) {
        this.setState({ scope: { props, import: importScope } });
      } else {
        preloadModules().then((preloadedModules) => {
          this.props.config?.packages.forEach((p) => {
            const moduleName = p && p.trim();
            if (moduleName in preloadedModules) {
              importScope[moduleName] = preloadedModules[moduleName];
              this.setState({
                scope: { props, import: importScope },
              });
            }
          });
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

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
        this.setLoading(false);
      } else {
        this.props.setGlobalOutput(null);
      }
    }
    if (this.props.input && Object.keys(this.props.input).length > 0) {
      const key = Object.keys(this.props.input)[0];
      if (this.props.input[key]) {
        this.setLoading(false);
      }
    }
    if (!_.isEqual(prevProps.input, this.props.input)) {
      this.init();
    }
  }

  componentDidMount() {
    this.setLoading(true);
    this.init();
  }

  handleResize = (e, direction, ref, d) => {
    this.props.setConfig({
      ...this.props.config,
      pinWidth: ref.offsetWidth,
      pinHeight: ref.offsetHeight,
    });
  };

  render() {
    const { input, output, config, setConfig, targetRef, handleRef, children } =
      this.props;
    const headerHeight = 40;
    return (
      <Box
        ref={targetRef}
        sx={{
          display: 'flex',
          background: theme.palette.node.main,
          border: '1px solid #424242',
          borderRadius: '5px',
          position: 'absolute',
          top: this.state.pinTop || 100,
          left: this.state.pinLeft || 100,
        }}
      >
        <Resizable
          bounds="window"
          onResizeStop={this.handleResize}
          defaultSize={{
            width: config?.pinWidth || config?.width,
            height: config?.pinHeight || config?.height,
          }}
          enable={{ bottomRight: true }}
        >
          <Stack
            sx={{
              width: '100%',
              height: this.state.expanded ? '100%' : headerHeight,
              display: 'flex',
              flexGrow: 1,
              overflow: this.state.expanded ? 'auto' : 'hidden',
            }}
          >
            <CardContent
              ref={handleRef}
              // onClick={() => this.setState({expanded:!this.state.expanded})}
              sx={{
                height: headerHeight,
                display: 'flex',
                alignContent: 'center',
              }}
            >
              <Typography variant="caption"> {config?.title || ''} </Typography>
              <RemoveIcon
                fontSize="10px"
                sx={{ marginLeft: 'auto', cursor: 'pointer' }}
                onClick={() => {
                  this.props.setConfig({ ...config, pin: false });
                }}
              />
              {/* {this.state.loading ? ( */}

              {/* ) : null} */}
            </CardContent>
            <Divider />
            <CardContent
              variant="outlined"
              sx={{
                flexGrow: 1,
                width: config?.width,
                height: config?.height,
              }}
            >
              {this.state.loading ? (
                <CircularProgress
                  size={10}
                  sx={{ color: '#FFB300', cursor: 'pointer' }}
                  onClick={() => {
                    this.setState({ loading: false });
                    setConfig({ ...config, run: !config.run });
                  }}
                />
              ) : null}
              <Runner code={config?.code?.interface} scope={this.state.scope} />
            </CardContent>
          </Stack>
        </Resizable>
      </Box>
    );
  }
}

const DraggablePinNode = ({ ...props }) => {
  const { targetRef, handleRef, getTargetProps, delta } = useDraggable({
    controlStyle: true,
  });

  useEffect(() => {
    if ((delta.x || delta.y) && targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      props.setConfig({
        ...props.config,
        pinTop: rect.top * props.globalScale,
        pinLeft: rect.left * props.globalScale,
      });
    }
  }, [targetRef, delta]);

  return <PinNode {...props} targetRef={targetRef} handleRef={handleRef} />;
};

export default memo(
  connect(mapStateToProps, mapDispatchToProps)(DraggablePinNode)
);
