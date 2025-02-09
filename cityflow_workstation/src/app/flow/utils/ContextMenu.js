// components/ContextMenu.js
import React, { useState, useCallback, useEffect } from 'react';
import { Menu, MenuItem, Typography } from '@mui/material';
import { useOnSelectionChange } from 'reactflow';
import { addNode } from '@/store/actions';
import { connect } from 'react-redux';
import { nanoid } from 'nanoid';
import { saveModule } from '@/utils/dataset';

const mapStateToProps = (state, ownProps) => ({
  nodes: state.nodes,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  addNode: (node) => dispatch(addNode(node)),
});

const ContextMenu = (props) => {
  // get selected nodes
  const [selectedNodes, setSelectedNodes] = useState([]);
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
              x: node.position.x + Math.floor(Math.random() * 50),
              y: node.position.y + Math.floor(Math.random() * 50),
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

  useEffect(() => {
    const flowContainer = document.getElementById('react-flow');
    flowContainer.addEventListener('contextmenu', handleContextMenu);
    return () => {
      flowContainer.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // Add keyboard shortcuts for copy and paste
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
        event.preventDefault();
        copySelectedNode();
      } else if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        event.preventDefault();
        pasteSelectedNode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNodes]);

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
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ContextMenu);
