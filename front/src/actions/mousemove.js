export const MOUSE_MOVE = 'MOUSE_MOVE';
export const PLAYER_MOVE = 'PLAYER_MOVE';
export const PLAYER_SPEED_UP = 'PLAYER_SPEED_UP';
export const PLAYER_SPEED_DOWN = 'PLAYER_SPEED_DOWN';

export const mouseMove = (x, y) => {
  return {
    type: MOUSE_MOVE,
    x,
    y,
  };
};

export const playerMove = (x, y) => {
  return {
    type: PLAYER_MOVE,
    x,
    y,
  };
};
