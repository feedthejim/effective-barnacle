import React from 'react';
import { Line} from 'react-konva';
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
      <React.Fragment>
        <Line
          points={points}
          stroke={this.props.fillColor}
          //tension={0.3}
          listening={false}
          lineCap="round"
          lineJoin="round"
          tension={0.3}
          strokeWidth={relativeW(this.props.width, this.props.gameMap)}
        />
        {/* {this.props.points.map((point, index) => (
          <Circle
            key={index}
            x={point.x}
            y={point.y}
            fillColor={this.props.fillColor}
            width={relativeW(this.props.width, this.props.gameMap)}
          />
        ))} */}
      </React.Fragment>
    );
  }
}

export default connect(mapStateToProps)(Snake);
