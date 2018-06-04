import React from 'react';
import { Line } from 'react-konva';
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

class Snake extends React.Component {
  constructor(props) {
    super(props);
  }

  // public render(): void {
  //   gameMap.ctx.save();
  //   gameMap.ctx.beginPath();
  //   gameMap.ctx.moveTo(this.paintX, this.paintY);

  //   // stroke body
  //   let wholeLength = this.length;
  //   if (this.movementQueue.length) {
  //     let i = this.movementQueue.length - 1;
  //     while (i) {
  //       const movement = this.movementQueue[i];
  //       let x = movement.x;
  //       let y = movement.y;
  //       if (wholeLength > 0 && wholeLength < movement.speed) {
  //         const lm = this.movementQueue[i + 1] || this;
  //         const ratio = wholeLength / movement.speed;
  //         x = lm.x - (lm.x - x) * ratio;
  //         y = lm.y - (lm.y - y) * ratio;
  //       } else if (wholeLength < 0) {
  //         break;
  //       }

  //       i--;
  //       wholeLength -= movement.speed;
  //       gameMap.ctx.lineTo(gameMap.view.relativeX(x), gameMap.view.relativeY(y));
  //     }
  //   }

  //   gameMap.ctx.lineCap = 'round';
  //   gameMap.ctx.lineJoin = 'round';
  //   gameMap.ctx.strokeStyle = this.fillColor;
  //   gameMap.ctx.lineWidth = this.width;
  //   gameMap.ctx.stroke();
  //   gameMap.ctx.restore();

  //   // draw header
  //   gameMap.ctx.save();
  //   gameMap.ctx.translate(this.paintX, this.paintY);
  //   gameMap.ctx.rotate(this.angle);
  //   gameMap.ctx.drawImage(
  //     this.img,
  //     -this.paintWidth / 2,
  //     -this.paintHeight / 2,
  //     this.paintWidth,
  //     this.paintHeight,
  //   );
  //   gameMap.ctx.restore();
  // }

  render() {
    let points = [];
    let wholeLength = this.props.length;
    if (this.props.movementQueue.length) {
      let i = this.props.movementQueue.length - 1;
      while (i) {
        const movement = this.props.movementQueue[i];
        let x = movement.x;
        let y = movement.y;
        if (wholeLength > 0 && wholeLength < movement.speed) {
          const lm = this.props.movementQueue[i + 1] || this;
          const ratio = wholeLength / movement.speed;
          x = lm.x - (lm.x - x) * ratio;
          y = lm.y - (lm.y - y) * ratio;
        } else if (wholeLength < 0) {
          break;
        }

        i--;
        wholeLength -= movement.speed;
        // gameMap.ctx.lineTo(
        //   gameMap.view.relativeX(x),
        //   gameMap.view.relativeY(y)
        // );
        points.push(
          relativeX(x, this.props.gameMap),
          relativeY(y, this.props.gameMap)
        );
      }
    }
    return (
      <Line
        points={points}
        stroke={this.props.color || 'black'}
        tension={0.3}
        strokeWidth={relativeW(this.props.width, this.props.gameMap)}
      />
    );
  }
}

export default connect(mapStateToProps)(Snake);
