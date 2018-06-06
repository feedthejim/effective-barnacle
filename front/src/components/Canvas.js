import React from 'react';
import { Stage, Layer } from 'react-konva';
import GameMap from './GameMap';
import Background from './Background';
import { connect } from 'react-redux';
// import LinearBackground from './LinearBackground';

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
          <Layer>
            <Background />
            <GameMap />
          </Layer>
        </Stage>
      )
    );
  }
}

export default connect(mapStateToProps)(Canvas);
