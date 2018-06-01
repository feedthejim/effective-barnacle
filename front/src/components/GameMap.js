import React from 'react';
import { Layer, Rect } from 'react-konva';
import { connect } from 'react-redux';
import { ADD_COLORED_RECT } from '../actions/canvas';
import Konva from 'konva';

const mapStateToProps = state => {
  return {
    players: state.canvas.players,
    player: state.canvas.player,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    insertNewRectangle: () => dispatch({ type: ADD_COLORED_RECT }),
  };
};

const Rectangle = ({ body }) => (
  <Rect
    x={body[0].x}
    y={body[0].y}
    width={50}
    height={50}
    fill={Konva.Util.getRandomColor()}
    shadowBlur={5}
  />
);

class GameMap extends React.Component {
  render() {
    return <Layer>{this.props.players.map(Rectangle)}</Layer>;
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GameMap);
