// components/ContextMenu.js
import React, { useState, useCallback, useEffect } from 'react';
import { Menu, MenuItem, Typography } from '@mui/material';
import { useOnSelectionChange } from 'reactflow';
import { addNode } from '@/store/actions';
import { connect } from 'react-redux';
import { nanoid } from 'nanoid';
import { saveModule } from '@/utils/dataset';
import { saveWorkflow } from '@/utils/dataset';
import { getFlowData } from '@/utils/local';
import { useReactFlow } from 'reactflow';
import Loading from '@/components/Loading';

const mapStateToProps = (state, ownProps) => ({
  state: state,
  nodes: state.nodes,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  addNode: (node) => dispatch(addNode(node)),
});

const ContextMenu = (props) => {
  // get selected nodes
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [saving, setSaving] = useState(false);
  const rfInstance = useReactFlow();

  const onChange = useCallback(({ nodes, edges }) => {
    setSelectedNodes(nodes);
  }, []);
  useOnSelectionChange({ onChange });

  // context menu
  const [anchorPosition, setAnchorPosition] = useState(null);
  const copySelectedNode = () => {
    if (selectedNodes.length > 0) {
      const nodesData = JSON.stringify(selectedNodes);
      navigator.clipboard
        .writeText(nodesData)
        .then(() => {
          setAnchorPosition(null);
        })
        .catch((err) => {
          console.error('Failed to copy nodes: ', err);
        });
    }
  };
  const pasteSelectedNode = async () => {
    try {
      const clipboardData = await navigator.clipboard.readText();
      const nodes = JSON.parse(clipboardData);
      if (Array.isArray(nodes)) {
        nodes.forEach((node) => {
          const pastedNode = {
            ...node,
            id: nanoid(),
            position: {
              x: node.position.x,
              y: node.position.y,
            },
            local: false,
            basic: false,
          };
          props.addNode(pastedNode);
        });
      } else {
        console.error('Clipboard data is not valid nodes array');
      }
      setAnchorPosition(null);
    } catch (err) {
      console.error('Failed to paste nodes: ', err);
    }
  };

  const saveSelectedNode = () => {
    if (!selectedNodes.length > 0) return;
    const dateTime = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
    //save to  module Panel
    const nodeData = {
      ...selectedNodes[0],
      run: false,
      time: dateTime,
      custom: true,
      basic: false,
      local: true,
    };
    saveModule(nodeData);
    window.dispatchEvent(new CustomEvent('userModulesChange'));
  };

  const options = [
    { label: 'Copy', onClick: () => copySelectedNode() },
    { label: 'Paste', onClick: () => pasteSelectedNode() },
    { label: 'Save', onClick: () => saveSelectedNode() },
  ];

  const handleContextMenu = (event) => {
    event.preventDefault();
    setAnchorPosition({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
  };

  const handleClose = () => {
    setAnchorPosition(null);
  };

  const handleSave = async ({ fetchSource = true }) => {
    const { name, nodes, edges, ...res } = props.state;
    setSaving(true);
    const flowData = await getFlowData({
      rfInstance,
      state: {
        ...res,
        private: true,
        basic: false,
        name: name || 'Temp',
      },
      fetchSource,
    });
    const flowId = await saveWorkflow(flowData).then((flowId) => {
      setSaving(false);
      return flowId;
    });
  };

  const handleKeyDown = (event) => {
    // if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
    //   if (event.target.querySelector('.allow-copy')) {
    //     event.preventDefault();
    //     copySelectedNode();
    //   }
    // } else if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
    //   if (event.target.querySelector('.allow-copy')) {
    //     event.preventDefault();
    //     pasteSelectedNode();
    //   }
    // } else
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      handleSave();
    }
  };

  useEffect(() => {
    if (props.state?.autoSave) {
      // autoSave every 5 minutes
      const intervalId = setInterval(
        () => {
          handleSave({ fetchSource: false });
        },
        60 * 1000 * 5
      );

      return () => clearInterval(intervalId);
    }
  }, [handleSave, props.state?.autoSave]);

  useEffect(() => {
    // const flowContainer = document.getElementById('react-flow');
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [props.state]);

  return (
    <>
      <Menu
        open={!!anchorPosition}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          anchorPosition !== null
            ? { top: anchorPosition.mouseY, left: anchorPosition.mouseX }
            : undefined
        }
      >
        {options.map((option, index) => (
          <MenuItem key={index} onClick={option.onClick} sx={{ width: 80 }}>
            <Typography variant="caption" color="text.secondary">
              {option.label}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
      {saving && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '30px',
            transform: 'translateX(-50%)',
            zIndex: 1111,
          }}
        >
          <Loading dotSize={5} />
        </div>
      )}
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ContextMenu);
