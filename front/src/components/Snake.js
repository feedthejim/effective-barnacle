import React from 'react';
import { Line, Label, Tag, Text } from 'react-konva';
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

class Snake extends React.PureComponent {
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
          shadowColor="white"
          shadowEnabled={this.props.isSpeedUp}
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
        <Label
          x={
            relativeX(this.props.x, this.props.gameMap) -
            (this.props.username.length / 2) * 9
          }
          y={relativeY(this.props.y, this.props.gameMap) + 30}
        >
          <Tag
            fill={this.props.fillColor}
            lineJoin="round"
            shadowColor="black"
            opacity={0.3}
          />
          <Text
            text={this.props.username}
            fontFamily="Calibri"
            fontSize={18}
            padding={5}
            fill="white"
          />
        </Label>
      </React.Fragment>
    );
  }
}

export default connect(mapStateToProps)(Snake);
