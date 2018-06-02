export const MOUSE_MOVE = 'MOUSE_MOVE';

export const mouseMove = (url, x, y) => {
  return {
    type: MOUSE_MOVE,
    x,
    y,
  };
};