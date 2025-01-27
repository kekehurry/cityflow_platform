import React, {PureComponent,memo} from 'react';
import { BaseEdge} from 'reactflow';

class InvisibleEdge extends PureComponent{

  render(){
    return (
      <div style={{dispaly:"none"}}>
        <BaseEdge />
      </div>
    )
  }
}

export default memo(InvisibleEdge);