import React from 'react';
import { Line } from 'react-konva';
import { connect } from 'react-redux';

const mapStateToProps = state => {
  return {
    gameMap: state.canvas.gameMap,
  };
};

const relativeX = (x, gameMap) => {
  return x / gameMap.scale - gameMap.view.x;
};

const relativeY = (y, gameMap) => {
  return y / gameMap.scale - gameMap.view.y;
};

const relativeW = (width, gameMap) => {
  return width / gameMap.scale;
};

const relativeH = (height, gameMap) => {
  return height / gameMap.scale;
};

class Snake extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const points = [];
    this.props.points.forEach(({ x, y }) => {
      points.push(
        relativeX(x, this.props.gameMap),
        relativeY(y, this.props.gameMap)
      );
    });
    return (
      <Line
        points={points}
        stroke={this.props.color || 'black'}
        tension={0.3}
        listening={false}
        strokeWidth={relativeW(this.props.width, this.props.gameMap)}
      />
    );
  }
}

export default connect(mapStateToProps)(Snake);
