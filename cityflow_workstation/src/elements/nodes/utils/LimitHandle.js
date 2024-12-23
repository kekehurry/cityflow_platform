import React, { useMemo} from 'react';
import { getConnectedEdges, Handle,useReactFlow} from 'reactflow';
import {Typography,ListItem} from '@mui/material';

const LimitHandle = ({nodeId,name,color,max,type}) => {
    const handleSize = 10;
    const handleid = nodeId+`||${name}`
    const flowInstance = useReactFlow();
    const node = flowInstance.getNode(nodeId);
    const edges = flowInstance.getEdges();
    const isHandleConnectable = useMemo(() => {
        const connectedEdges = getConnectedEdges([node], edges);
        const connectedHandle = connectedEdges.filter(edge => 
            edge.targetHandle === handleid);
        return type==="target"? connectedHandle.length < max:true;
    }, [ node,edges,max,name]);

    const position = (type === "target") ? "left" : "right";
    const handleStyle = (position === "left") ? 
            {top:-9 ,left:25, position:"absolute"} 
            : {top:-9 ,right:25, position:"absolute"};
    return (
        <>
        <ListItem>
            <Handle id={handleid} type={type} position={position} style={{
                width:handleSize,height:handleSize, 
                background:color, top:0, left:handleSize}} 
                isConnectable={isHandleConnectable}
            />
            <Typography variant='caption'
                sx={handleStyle}
                >
                {name} 
            </Typography>
        </ListItem>
        </>
);
};

export default LimitHandle;