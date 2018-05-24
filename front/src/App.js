import React from 'react';
import { Stage, Layer, Text, Rect } from 'react-konva';
// import Konva from 'konva';
import * as R from 'ramda';
import { connect } from 'react-redux';
import { ADD_COLORED_RECT } from './actions/canvas';

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

const App = ({ player, rectangles, insertNewRectangle }) => {
  const stageRef = React.createRef();
  return (
    <Stage ref={stageRef} width={window.innerWidth} height={window.innerHeight}
      onMouseMove={() =>
        /* eslint-disable-next-line */
        console.log(stageRef.getStage().getPointerPosition())}>
      <Layer>
        <Text onclick={insertNewRectangle} text="Try click on rect" />
        {R.map(Rectangle, rectangles)}
        {Rectangle(player)}
      </Layer>
    </Stage >
  );
};

const mapStateToProps = state => {
  return {
    rectangles: state.canvas.entities,
    player: state.canvas.player,
  };
};


const mapDispatchToProps = dispatch => {
  return {
    insertNewRectangle: () => dispatch({ type: ADD_COLORED_RECT })
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);