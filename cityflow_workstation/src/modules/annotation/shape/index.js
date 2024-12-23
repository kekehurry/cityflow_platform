import React, { useEffect, useState} from 'react';
import theme from '@/theme';

const Shape = (props) => {
  const {config,setConfig} = props
  const [rect, setRect] = useState(config.rect);

  return (
    <div style={{ width: config.width, height: config.height, 
        position: 'relative'}} 
        onDoubleClick={() => {
          setRect(!rect);
          setConfig({...config,rect:!rect});
        }}
    >
      <svg style={{ position: 'absolute', top: 0, left: 0,
      width: "90%", height: "90%",
      overflow: 'visible'}}>
        {rect ?
        <rect x={0} y={0} width={config.width} height={config.height} rx={config.width/12} ry={config.height/12}
        stroke={theme.palette.annotation.main} fill='none' strokeWidth='2'/>
        :
        <ellipse cx={config.width/2} cy={config.height/2} rx={config.width/2} ry={config.height/2}
          stroke={theme.palette.annotation.main} fill='none' strokeWidth='2'/>
        }
      </svg>
    </div>
  );
};

export default Shape;
