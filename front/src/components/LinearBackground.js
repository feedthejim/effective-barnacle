import React from 'react';
import { Rect } from 'react-konva';
import { connect } from 'react-redux';

const mapStateToProps = state => {
  return {
    gameMap: state.canvas.gameMap,
  };
};

const mapDispatchToProps = (/* dispatch*/) => {
  return {};
};

class LinearGradientBackground extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    //   var linearGradPentagon = new Konva.RegularPolygon({
    //     x: 360,
    //     y: stage.getHeight() / 2,
    //     sides: 5,
    //     radius: 70,
    //     fillLinearGradientStartPoint: { x : -50, y : -50},
    //     fillLinearGradientEndPoint: { x : 50, y : 50},
    //     fillLinearGradientColorStops: [0, 'red', 1, 'yellow'],
    //     stroke: 'black',
    //     strokeWidth: 4,
    //     draggable: true
    // });
    console.log(this.props.gameMap);
    return (
      <Rect
        width={window.innerWidth}
        height={window.innerHeight}
        fillLinearGradientStartPoint={{
          x: -this.props.gameMap.view.width - this.props.gameMap.view.x,
          y: -this.props.gameMap.view.height - this.props.gameMap.view.y,
        }}
        fillLinearGradientEndPoint={{
          x: this.props.gameMap.view.width + this.props.gameMap.view.x,
          y: this.props.gameMap.view.height + this.props.gameMap.view.y,
        }}
        fillLinearGradientColorStops={[0, 'red', 1, 'yellow']}
      />
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LinearGradientBackground);
