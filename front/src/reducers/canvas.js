import Konva from 'konva';
import { ADD_COLORED_RECT } from '../actions/canvas';
import * as R from 'ramda';

export default (state = {
  entities: [
  ],
  player: {
    id: 0,
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    color: Konva.Util.getRandomColor()
  },
  currentAngle: 0,
}, action) => {
  switch (action.type) {
    case ADD_COLORED_RECT:
      return R.evolve(
        {
          entities: R.prepend({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            color: Konva.Util.getRandomColor()
          })
        },
        state);
  }
  return state;
};