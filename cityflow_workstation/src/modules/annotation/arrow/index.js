import React, { useState, useEffect } from 'react';
import theme from '@/theme';

const Arrow = (props) => {
    const {config,setConfig} = props
    const arrowHeadSize = 10; // Size of the arrowhead
    const [arrowPosition, setArrowPosition] = useState({
        startX: 0,
        startY: 0,
        endX: config.width*0.9,
        endY: config.height*0.9,
        controlX: config.controlX||config.width*0.1, // Initial control point X
        controlY: config.controlY||config.height*0.8, // Initial control point Y
    });

    const [dragging, setDragging] = useState(false);
    const [edit, setEdit] = useState(false);
    const [lastMousePosition, setLastMousePosition] = useState(null);

    useEffect(() => {
        setArrowPosition({
        ...arrowPosition,
        endX: config.width*0.9,
        endY: config.height*0.9,
        });
    }, [config.width, config.height]);

    useEffect(() => {
        const handleMouseMove = (e) => {
        if (dragging && lastMousePosition) {
            const dx = e.clientX - lastMousePosition.x;
            const dy = e.clientY - lastMousePosition.y;
            const rotate = config.rotate || 0;
            const dx_new = dx * Math.cos(rotate*Math.PI/180) + dy * Math.sin(rotate*Math.PI/180);
            const dy_new = dx * Math.sin(rotate*Math.PI/180) - dy * Math.cos(rotate*Math.PI/180);
            setArrowPosition((prev) => ({
            ...prev,
            controlX: prev.controlX + dx_new,
            controlY: prev.controlY - dy_new,
            }));
            setConfig({...config,controlX:arrowPosition.controlX,controlY:arrowPosition.controlY});
            setLastMousePosition({ x: e.clientX, y: e.clientY });
        }
        };

        const handleMouseUp = () => {
        setDragging(false);
        setLastMousePosition(null);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragging, lastMousePosition,config]);

    const getArrowHead = (x1, y1, x2, y2) => {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const arrowHeadAngle1 = angle + Math.PI / 7;
        const arrowHeadAngle2 = angle - Math.PI / 7;
        const arrowHeadPoint1 = {
        x: x2 - arrowHeadSize * Math.cos(arrowHeadAngle1),
        y: y2 - arrowHeadSize * Math.sin(arrowHeadAngle1),
        };
        const arrowHeadPoint2 = {
        x: x2 - arrowHeadSize * Math.cos(arrowHeadAngle2),
        y: y2 - arrowHeadSize * Math.sin(arrowHeadAngle2),
        };

        return (
        <polyline
            points={`${arrowHeadPoint1.x},${arrowHeadPoint1.y} ${x2},${y2} ${arrowHeadPoint2.x},${arrowHeadPoint2.y}`}
            fill="none"
            stroke={theme.palette.annotation.main}
            strokeWidth="2"
        />
        );
    };

    const getCurvedPath = (x1, y1, x2, y2, controlX, controlY) => {
        return `M ${x1} ${y1} Q ${controlX} ${controlY}, ${x2} ${y2}`;
    };

    const getTangentAngle = (x1, y1, controlX, controlY, x2, y2) => {
        // Calculate the derivative of the quadratic Bezier curve at t = 1
        const dx = 2 * (1 - 1) * (controlX - x1) + 2 * 1 * (x2 - controlX);
        const dy = 2 * (1 - 1) * (controlY - y1) + 2 * 1 * (y2 - controlY);
        return Math.atan2(dy, dx);
    };

    const arrowHeadAngle = getTangentAngle(
        arrowPosition.startX,
        arrowPosition.startY,
        arrowPosition.controlX,
        arrowPosition.controlY,
        arrowPosition.endX,
        arrowPosition.endY
    );

    const arrowHead = getArrowHead(
        arrowPosition.endX,
        arrowPosition.endY,
        arrowPosition.endX + Math.cos(arrowHeadAngle),
        arrowPosition.endY + Math.sin(arrowHeadAngle)
    );

    const handleMouseDown = (e) => {
        setDragging(true);
        setLastMousePosition({ x: e.clientX, y: e.clientY });
    };

  return (
    <div style={{ width: config.width, height: config.height, position: 'relative'}} 
        className={edit? 'nodrag':''}
        onDoubleClick={() => setEdit(!edit)}
    >
      <svg style={{ position: 'absolute', top: 0, left: 0,
      width: "90%", height: "90%",
      overflow: 'visible',cursor: edit?"pointer":"grab" }}>
        <path
          d={getCurvedPath(
            arrowPosition.startX,
            arrowPosition.startY,
            arrowPosition.endX,
            arrowPosition.endY,
            arrowPosition.controlX,
            arrowPosition.controlY
          )}
          stroke={theme.palette.annotation.main}
          strokeWidth="2"
          fill="none"
        />
        {arrowHead}
        {edit &&
        <>
        <line x1={arrowPosition.startX} y1={arrowPosition.startY} x2={arrowPosition.controlX} y2={arrowPosition.controlY} 
        stroke="grey" strokeWidth="1" strokeDasharray="5,5"/>
        <line x1={arrowPosition.endX} y1={arrowPosition.endY} x2={arrowPosition.controlX} y2={arrowPosition.controlY} 
        stroke="grey" strokeWidth="1" strokeDasharray="5,5"/>
        <circle
          cx={arrowPosition.controlX}
          cy={arrowPosition.controlY}
          r={5}
          fill="white"
          onMouseDown={handleMouseDown}
          style={{ cursor: 'pointer' }}
        />
        </>
        }
      </svg>
    </div>
  );
};

export default Arrow;
