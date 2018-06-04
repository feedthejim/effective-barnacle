import React from 'react';
import { Stage } from 'react-konva';
import GameMap from './GameMap';
import Background from './Background';
import { connect } from 'react-redux';

const mapStateToProps = state => {
  return {
    isGameRunning: state.canvas.isGameRunning,
  };
};
class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      this.props.isGameRunning && (
        <Stage
          width={window.innerWidth}
          height={window.innerHeight}
          listening={false}
        >
          <Background />
          <GameMap />
        </Stage>
      )
    );
  }
}

export default connect(mapStateToProps)(Canvas);
