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
    let points = [];
    let wholeLength = this.props.length;
    if (this.props.movementQueue.length) {
      let i = this.props.movementQueue.length - 1;
      while (i) {
        const movement = this.props.movementQueue[i];
        let x = movement.x;
        let y = movement.y;
        if (wholeLength > 0 && wholeLength < movement.speed) {
          const lm = this.props.movementQueue[i + 1] || this;
          const ratio = wholeLength / movement.speed;
          x = lm.x - (lm.x - x) * ratio;
          y = lm.y - (lm.y - y) * ratio;
        } else if (wholeLength < 0) {
          break;
        }

        i--;
        wholeLength -= movement.speed;
        points.push(
          relativeX(x, this.props.gameMap),
          relativeY(y, this.props.gameMap)
        );
      }
    }
    return (
      <Line
        points={points}
        stroke={this.props.color || 'black'}
        tension={0.3}
        strokeWidth={relativeW(this.props.width, this.props.gameMap)}
      />
    );
  }
}

export default connect(mapStateToProps)(Snake);
