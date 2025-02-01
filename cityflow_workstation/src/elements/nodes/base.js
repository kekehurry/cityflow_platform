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
import { updateOutput, updateConfig, removeNode } from '@/store/actions';
import _ from 'lodash';
import theme from '@/theme';
import LimitHandle from './utils/LimitHandle';
import ErrorBoundary from './utils/ErrorBoundary';
import PushPinIcon from '@mui/icons-material/PushPin';
import RemoveCircleOutlinedIcon from '@mui/icons-material/RemoveCircleOutlined';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import ErrorIcon from '@mui/icons-material/Error';

const mapStateToProps = (state, ownProps) => ({
  input: state.nodes.find((node) => node.id === ownProps.id)?.data.input,
  output: state.nodes.find((node) => node.id === ownProps.id)?.data.output,
  config: state.nodes.find((node) => node.id === ownProps.id)?.config,
  pinNodes: state.pinNodes,
  id: ownProps.id,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  setConfig: (config) => {
    dispatch(updateConfig(ownProps.id, { ...config }));
  },
  setGlobalOutput: (output) => {
    dispatch(updateOutput(ownProps.id, { ...output }));
  },
  removeNode: () => dispatch(removeNode(ownProps.id)),
});

class BaseNode extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      localOutput: null,
      loading: false,
      hover: false,
      error: false,
      warning: false,
    };

    this.setOutput = this.setOutput.bind(this);
    this.error = this.error.bind(this);
    this.warning = this.warning.bind(this);
  }

  setOutput = (output) => {
    if (_.isEqual(output, this.state.localOutput)) return;
    this.setState({ loading: false, localOutput: output });
  };

  componentDidUpdate(prevProps, prevState) {
    // child module only update the localOutput to prevent infinite loop
    // if localOutput has changed, update the glovalOutput
    if (!_.isEqual(prevState.localOutput, this.state.localOutput)) {
      this.props.setGlobalOutput(this.state.localOutput);
      if (
        this.state.localOutput &&
        Object.keys(this.state.localOutput).length > 0
      ) {
        this.props.setGlobalOutput(this.state.localOutput);
      } else {
        this.props.setGlobalOutput(null);
      }
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
    const { input, output, config, setConfig, children } = this.props;
    const margin = 8;
    const mapModule = () =>
      React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          input: input,
          config,
          setConfig,
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

    return (
      <>
        <Card
          sx={{
            minWidth: 50,
            minHeight: 50,
            padding: `${margin}px`,
            border: this.state.hover
              ? `1px solid ${theme.palette.edge.dark}`
              : `0.5px solid #424242`,
            borderRadius: '10px',
            background: theme.palette.node.main,
          }}
          onMouseEnter={() => {
            this.setState({ hover: true });
          }}
          onMouseLeave={() => {
            this.setState({ hover: false });
          }}
        >
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
                    setConfig({ ...config, run: !config.run });
                  }}
                />
              ) : (
                <PlayCircleIcon
                  fontSize="5px"
                  onClick={() => {
                    this.setState({ error: false, warning: false });
                    this.setState({ loading: true });
                    setConfig({ ...config, run: !config.run });
                  }}
                  sx={{
                    cursor: 'pointer',
                    color: config.run ? '#4bec13' : '#5c5d5d',
                    transform: 'scale(0.8)',
                  }}
                />
              )}
              <PushPinIcon
                fontSize="5px"
                onClick={() => {
                  setConfig({ ...config, pin: !config.pin });
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
                    <LimitHandle
                      key={item}
                      nodeId={this.props.id}
                      name={item}
                      max={1}
                      color={color}
                      type={'target'}
                    />
                  );
                })}
            </Stack>
            <Stack>
              {config?.output &&
                config.output.map((item, index) => {
                  const color = output && output[item] ? '#4bec13' : '#FFB300';
                  return (
                    <LimitHandle
                      key={item}
                      nodeId={this.props.id}
                      name={item}
                      max={1}
                      color={color}
                      type={'source'}
                    />
                  );
                })}
            </Stack>
          </Stack>
          <Paper
            variant="outlined"
            sx={{
              overflow: 'auto',
              scrollbarWidth: 'none',
              margin: `${margin}px`,
              background: theme.palette.node.container,
              width: config?.width || 150,
              height: config?.height || 10,
            }}
            className="nowheel nodrag"
          >
            {process.env.NODE_ENV === 'production' ? (
              <ErrorBoundary
                stop={this.stop}
                error={this.error}
                warning={this.warning}
              >
                {mapModule()}
              </ErrorBoundary>
            ) : (
              mapModule()
            )}
          </Paper>
        </Card>
      </>
    );
  }
}

export default memo(connect(mapStateToProps, mapDispatchToProps)(BaseNode));
