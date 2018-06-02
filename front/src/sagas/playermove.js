import { MOUSE_MOVE, playerMove } from '../actions/mousemove';
import { select, take, put } from 'redux-saga/effects';

export const getGameMap = state => state.canvas.gameMap;

export default function* playerMoveSaga() {
  while (true) {
    const mouseMove = yield take(MOUSE_MOVE);
    const gameMap = yield select(getGameMap);
    console.log(mouseMove, gameMap);
    yield put(
      playerMove(
        (mouseMove.x + gameMap.view.x) * gameMap.scale,
        (mouseMove.y + gameMap.view.y) * gameMap.scale
      )
    );
  }
}
