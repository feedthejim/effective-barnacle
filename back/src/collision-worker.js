var Worker = require('webworker-threads').Worker;

var worker = new Worker(function() {
  const collision = (dom, dom2, isRect) => {
    const disX = dom.x - dom2.x;
    const disY = dom.y - dom2.y;
    const dw = dom.width + dom2.width;

    if (Math.abs(disX) > dw || Math.abs(disY) > dom.height + dom2.height) {
      return false;
    }

    return isRect ? true : Math.hypot(disX, disY) < dw / 2;
  };

  const rectCollision = ({ collisionRect: rect1 }, { collisionRect: rect2 }) =>
    !(
      rect2.minX > rect1.maxX ||
      rect2.maxX < rect1.minX ||
      rect2.maxY < rect1.minY ||
      rect2.minY > rect1.maxY
    );

  this.onmessage = function({ data }) {
    try {
      const snakes = data;
      const snakeDeleted = {};
      snakes.forEach(snake => {
        // if (snake.length < 0) {
        //   snakeDeleted.set(snake.id, snake);
        //   return;
        // }
        if (
          snakes.some(
            snake2 =>
              snake2.id !== snake.id &&
              rectCollision(snake, snake2) &&
              snake2.points.some(point =>
                collision(snake, {
                  ...point,
                  width: snake2.width,
                  height: snake2.height,
                }),
              ),
          ) &&
          !snakeDeleted[snake.id]
        ) {
          snakeDeleted[snake.id] = { id: snake.id, points: snake.points };
        }
      });

      postMessage(snakeDeleted);
    } catch (e) {
      postMessage('error: ' + e.message);
    }
  };
});

exports.default = worker;

// worker.postMessage([{ x: 0, y: 0 }, { x: 1, y: 1 }]);

// const worker = require('./worker').default;
