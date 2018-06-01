import React from 'react';
import { Stage } from 'react-konva';
import GameMap from './GameMap';
import Background from './Background';

class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Background />
        <GameMap />
      </Stage>
    );
  }
}

export default Canvas;
