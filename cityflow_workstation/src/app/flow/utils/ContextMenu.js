// components/ContextMenu.js
import React, { useState, useCallback, useEffect } from 'react';
import { Menu, MenuItem } from '@mui/material';
import { useOnSelectionChange} from 'reactflow';
import {addNode,updateNode} from '@/store/actions';
import {connect} from 'react-redux';
import {nanoid} from 'nanoid';


const mapStateToProps = (state, ownProps) => ({
      nodes : state.nodes,
});
  
const mapDispatchToProps = (dispatch, ownProps) =>({
    addNode: (node) => dispatch(addNode(node)),
});

const ContextMenu = (props) => {
    // get selected nodes
    const [selectedNodeIds, setSelectedNodeIds] = useState([]);
    const onChange = useCallback(({ nodes, edges }) => {
        setSelectedNodeIds(nodes.map((node) => node.id));
      }, []);
    useOnSelectionChange({onChange});
   
    // context menu
    const [anchorPosition, setAnchorPosition] = useState(null);
    const addGroupNode = () => {
        const groupId = nanoid();
        const groupNode = {
            id: groupId,
            type: 'pack',
            data: { label: null },
            style: {
                zIndex:0,
            },
            position:{
                x:0,
                y:0
            },
            config:{
                title: "Group",
                width: null,
                height: null,
                input:["input"],
                output:["output"],
                run:true,
            },
            childNodeIds:selectedNodeIds
        };
        props.addNode(groupNode);
    }
    const options = [
    { label: 'Group', onClick: () => addGroupNode() }
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

    return (
    <>
    {
    selectedNodeIds.length > 0 &&
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
        <MenuItem key={index} onClick={option.onClick}>
            {option.label}
        </MenuItem>
        ))}
    </Menu>
    }
    </>
    );
    };

export default connect(mapStateToProps,mapDispatchToProps)(ContextMenu);
