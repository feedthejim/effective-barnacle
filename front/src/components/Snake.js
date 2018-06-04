import React from 'react';
import { Rect } from 'react-konva';
import { connect } from 'react-redux';
import { ADD_COLORED_RECT } from '../actions/canvas';

const mapStateToProps = state => {
  return {
    gameMap: state.canvas.gameMap,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    insertNewRectangle: () => dispatch({ type: ADD_COLORED_RECT }),
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
    const snakeConfig = {
      x: relativeX(this.props.x, this.props.gameMap),
      y: relativeY(this.props.y, this.props.gameMap),
      width: relativeW(50, this.props.gameMap),
      height: relativeH(50, this.props.gameMap),
    };

    return (
      <Rect
        {...snakeConfig}
        fill={this.props.color || 'black'}
        shadowBlur={5}
      />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Snake);
