import React from 'react';
import { Circle } from 'react-konva';
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

class Food extends React.PureComponent {
  constructor(props) {
    super(props);
    this.circle = React.createRef();
  }

  componentDidMount() {
    // this.circle.current.cache();
    // console.log(this.circle);
  }

  render() {
    const foodConfig = {
      x: relativeX(this.props.x, this.props.gameMap),
      y: relativeY(this.props.y, this.props.gameMap),
      radius: relativeW(this.props.width, this.props.gameMap),
    };
    // public render() {
    //   if (!this.visible) {
    //     return;
    //   }

    //   gameMap.ctx.fillStyle = '#fff';

    //   // draw light
    //   gameMap.ctx.globalAlpha = 0.2;
    //   gameMap.ctx.beginPath();
    //   gameMap.ctx.arc(
    //     this.paintX,
    //     this.paintY,
    //     this.lightSize * this.paintWidth / this.width,
    //     0, Math.PI * 2,
    //   );
    //   gameMap.ctx.fill();

    //   gameMap.ctx.globalAlpha = 1;
    //   gameMap.ctx.beginPath();
    //   gameMap.ctx.arc(this.paintX, this.paintY, this.paintWidth / 2, 0, Math.PI * 2);
    //   gameMap.ctx.fill();
    // }

    return (
      <Circle
        {...foodConfig}
        ref={this.circle}
        fill={'red'}
        stroke={'black'}
        listening={false}
        // transformsEnabled="position"
        // strokeWidth={4}
        //   points={points}
        //   stroke={this.props.color || 'black'}
        //   tension={0.3}
        //   strokeWidth={relativeW(this.props.width, this.props.gameMap)}
      />
    );
  }
}

export default connect(mapStateToProps)(Food);
