import React from 'react';
import { Stage, Layer, Text, Rect } from 'react-konva';
// import Konva from 'konva';
import * as R from 'ramda';
import { connect } from 'react-redux';
import { ADD_COLORED_RECT } from './actions/canvas';
import { WEBSOCKET_CONNECT } from './actions/websocket';

const mapStateToProps = state => {
  return {
    rectangles: state.canvas.entities,
    player: state.canvas.player,
  };
};


const mapDispatchToProps = dispatch => {
  return {
    insertNewRectangle: () => dispatch({ type: ADD_COLORED_RECT }),
    connect: () => dispatch({
      type: WEBSOCKET_CONNECT,
      url: 'ws://localhost:4242',
      username: 'jimmy',
    })
  };
};


const Rectangle = ({ color, x, y }) => (
  <Rect
    x={x}
    y={y}
    width={50}
    height={50}
    fill={color}
    shadowBlur={5}
  />
);

const App = ({ player, rectangles, connect }) => {
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Text onclick={connect} text="Try click on rect" />
        {R.map(Rectangle, rectangles)}
        {Rectangle(player)}
      </Layer>
    </Stage >
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);