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
    return (
      <React.Fragment>
        <Rect
          width={window.innerWidth}
          height={window.innerHeight}
          fillLinearGradientStartPoint={{
            x: -this.props.gameMap.view.width + this.props.gameMap.view.x,
            y: -this.props.gameMap.view.height + this.props.gameMap.view.y,
          }}
          fillLinearGradientEndPoint={{
            x: this.props.gameMap.view.width + this.props.gameMap.view.x,
            y: this.props.gameMap.view.height + this.props.gameMap.view.y,
          }}
          fillLinearGradientColorStops={[0, 'red', 1, 'yellow']}
        />
        <Rect
          x={-this.props.gameMap.view.x}
          y={-this.props.gameMap.view.y}
          height={this.props.gameMap.paintHeight}
          width={this.props.gameMap.paintWidth}
          strokeWidth={1}
          stroke="white"
        />
      </React.Fragment>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LinearGradientBackground);
