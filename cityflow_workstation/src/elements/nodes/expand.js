import React, { PureComponent, memo } from 'react';
import {
  Card,
  Box,
  CircularProgress,
  Stack,
  Typography,
  Paper,
} from '@mui/material';
import { connect } from 'react-redux';
import {
  updateOutput,
  updateConfig,
  removeNode,
  updateZIndex,
  updateNode,
} from '@/store/actions';
import _, { debounce } from 'lodash';
import theme from '@/theme';

import LimitHandle from './utils/LimitHandle';
import ErrorBoundary from './utils/ErrorBoundary';

import RemoveCircleOutlinedIcon from '@mui/icons-material/RemoveCircleOutlined';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import PushPinIcon from '@mui/icons-material/PushPin';
import ErrorIcon from '@mui/icons-material/Error';

const mapStateToProps = (state, ownProps) => ({
  id: ownProps.id,
  input: state.nodes.find((node) => node.id === ownProps.id)?.data.input,
  output: state.nodes.find((node) => node.id === ownProps.id)?.data.output,
  config: state.nodes.find((node) => node.id === ownProps.id)?.config,
  interfaceComponent: state.nodes.find((node) => node.id === ownProps.id)
    ?.interfaceComponent,
  pinNodes: state.pinNodes,
  flowId: state.flowId,
  flowAuthor: state.author,
  image: state.image,
  position: state.nodes.find((node) => node.id === ownProps.id)?.position,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  setConfig: (config) => {
    dispatch(updateConfig(ownProps.id, { ...config }));
  },
  setGlobalOutput: (output) => {
    dispatch(updateOutput(ownProps.id, { ...output }));
  },
  removeNode: () => dispatch(removeNode(ownProps.id)),
  setIndex: (index) => {
    dispatch(updateZIndex(ownProps.id, { zIndex: index }));
  },
  updateInterface: (interfaceComponent) => {
    dispatch(updateNode(ownProps.id, { interfaceComponent }));
  },
});

class ExpandNode extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      localOutput: null,
      loading: false,
      hover: false,
      expand: this.props.config?.expand || false,
      error: false,
      warning: false,
    };

    this.setOutput = this.setOutput.bind(this);
    this.error = this.error.bind(this);
    this.warning = this.warning.bind(this);
    // this.componentUpdate = debounce(this.update, 1);
    this.componentUpdate = this.update;
  }

  componentDidMount() {}
  // Call the throttled version of componentDidUpdate

  componentDidUpdate(prevProps, prevState) {
    this.componentUpdate(prevProps, prevState);
  }

  setOutput = (output) => {
    if (_.isEqual(output, this.state.localOutput)) return;
    this.setState({ loading: false, localOutput: output });
  };

  update(prevProps, prevState) {
    // child module only update the localOutput to prevent infinite loop
    // if localOutput has changed, update the globalOutput
    if (!_.isEqual(prevState.localOutput, this.state.localOutput)) {
      if (
        this.props.config.run &&
        this.state.localOutput &&
        Object.keys(this.state.localOutput).length > 0
      ) {
        this.props.setGlobalOutput(this.state.localOutput);
      } else {
        this.props.setGlobalOutput(null);
      }
    }
    if (!_.isEqual(prevProps.config.run, this.props.config.run)) {
      this.props.config.run
        ? this.props.setGlobalOutput(this.state.localOutput)
        : this.props.setGlobalOutput(null);
    }
  }

  handleDelete = () => {
    this.props.removeNode(this.props.id);
  };

  stop = () => {
    this.props.setConfig({ ...this.props.config, run: false });
  };

  error = () => {
    this.setState({ error: true });
  };

  warning = () => {
    this.setState({ warning: true });
  };

  render() {
    //load packages first
    const {
      id,
      flowId,
      flowAuthor,
      input,
      output,
      config,
      setConfig,
      image,
      interfaceComponent,
      position,
      children,
    } = this.props;
    const margin = 8;
    const mapModule = (children) =>
      React.isValidElement(children) &&
      React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          id,
          flowId,
          flowAuthor,
          input,
          output,
          config,
          setConfig,
          image,
          position,
          expand: this.state.expand,
          updateInterface: this.props.updateInterface,
          setOutput: this.setOutput,
          run: config?.run,
          setRun: (run) => {
            setConfig({ ...config, run: run });
          },
          loading: this.state.loading,
          setLoading: (loading) => {
            this.setState({ loading: loading });
          },
        });
      });

    const head = (
      <Box
        sx={{
          height: 20,
          backgroundColor: theme.palette.node.main,
          pl: `${margin}px`,
          pr: `${margin}px`,
          display: 'flex',
          position: 'relative',
        }}
      >
        <Typography variant="caption" sx={{ flexGrow: 1 }}>
          {config?.name || 'New Node'}
        </Typography>
        <Stack direction="row" spacing={0.5}>
          {(this.state.error || this.state.warning) && (
            <ErrorIcon
              fontSize="5px"
              sx={{
                color: this.state.error ? '#FF0000' : '#FFB300',
                transform: 'scale(0.8)',
              }}
            />
          )}
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
            <PlayCircleIcon
              fontSize="5px"
              onClick={() => {
                this.setState({ error: false, warning: false });
                // this.setState({loading:true});
                setConfig({ ...config, run: !config.run });
              }}
              sx={{
                cursor: 'pointer',
                color: config.run ? '#4bec13' : '#5c5d5d',
                transform: 'scale(0.8)',
              }}
            />
          )}
          <OpenInFullIcon
            fontSize="5px"
            onClick={() => {
              this.setState({ expand: !this.state.expand });
              this.props.setIndex({ zIndex: 1000 });
            }}
            sx={{
              cursor: 'pointer',
              color: this.state.expand ? '#FFB300' : '#5c5d5d',
            }}
          />
          <PushPinIcon
            fontSize="5px"
            onClick={() => {
              setConfig({
                ...config,
                pin: !config.pin,
              });
            }}
            sx={{
              cursor: 'pointer',
              color: config.pin ? '#FFB300' : '#5c5d5d',
              transform: config.pin
                ? 'rotate(0deg);scale(0.8)'
                : 'rotate(45deg);scale(0.8)',
            }}
          />
          <RemoveCircleOutlinedIcon
            fontSize="5px"
            onClick={this.handleDelete}
            sx={{
              cursor: 'pointer',
              color: '#5c5d5d',
              transform: 'scale(0.8)',
            }}
          />
        </Stack>
      </Box>
    );

    const handle = (
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ paddingTop: 1.5, width: '100%' }}
      >
        <Stack>
          {config?.input &&
            config.input.map((item) => {
              const color = input && input[item] ? '#4bec13' : '#FFB300';
              return (
                item && (
                  <LimitHandle
                    key={item}
                    nodeId={this.props.id}
                    name={item}
                    max={1}
                    color={color}
                    type={'target'}
                  />
                )
              );
            })}
        </Stack>
        <Stack>
          {config?.output &&
            config.output.length > 0 &&
            config.output.map((item, index) => {
              const color = output && output[item] ? '#4bec13' : '#FFB300';
              return (
                item && (
                  <LimitHandle
                    key={item}
                    nodeId={this.props.id}
                    name={item}
                    max={1}
                    color={color}
                    type={'source'}
                  />
                )
              );
            })}
        </Stack>
      </Stack>
    );
    return (
      <>
        <Stack
          direction="row"
          justifyContent="space-between"
          spacing={2}
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            position: 'relative',
          }}
        >
          <Card
            sx={{
              width: this.state.expand ? 50 : config.width + 4 * margin,
              height: this.state.expand
                ? 50
                : config.height +
                  6 * margin +
                  Math.max(
                    config.input?.length || 1,
                    config.output?.length || 1
                  ) *
                    16 +
                  20,
              padding: `${margin}px`,
              border: this.state.hover
                ? `1px solid ${theme.palette.edge.dark}`
                : theme.palette.node.border,
              borderRadius: '10px',
              zIndex: 1,
              background: theme.palette.node.main,
            }}
            onMouseEnter={() => {
              this.setState({ hover: true });
            }}
            onMouseLeave={() => {
              this.setState({ hover: false });
            }}
          >
            {head}
            {handle}
            <Paper
              variant="outlined"
              sx={{
                overflow: 'auto',
                scrollbarWidth: 'none',
                margin: `${margin}px`,
                background: theme.palette.node.container,
                width: config.width,
                height: config.height,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              className="nowheel nodrag"
            >
              {interfaceComponent && mapModule(interfaceComponent)}
            </Paper>
          </Card>
          <Card
            sx={{
              padding: `${margin}px`,
              zIndex: 1000, // Ensure it's on top of all elements
              background: theme.palette.node.main,
              width: config.expandWidth || 800,
              height: config.expandHeight || 600,
              display: this.state.expand ? 'block' : 'none',
              position: 'fixed', // Make it float
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)', // Adjust position to truly center
            }}
            className={this.state.expand ? 'expanded' : ''}
          >
            {head}
            <Paper
              variant="outlined"
              sx={{
                overflow: 'hidden',
                scrollbarWidth: 'none',
                background: theme.palette.node.container,
                width: '100%',
                height: config.expandHeight || 600 - 35,
              }}
            >
              {process.env.NODE_ENV === 'production' ? (
                <ErrorBoundary
                  stop={this.stop}
                  error={this.error}
                  warning={this.warning}
                >
                  {mapModule(children)}
                </ErrorBoundary>
              ) : (
                mapModule(children)
              )}
            </Paper>
          </Card>
        </Stack>
      </>
    );
  }
}

export default memo(connect(mapStateToProps, mapDispatchToProps)(ExpandNode));
