import React from 'react';
import { connect } from 'react-redux';
import { ADD_COLORED_RECT } from '../actions/canvas';
import Snake from './Snake';
import { Circle } from 'react-konva';

// import Food from './Food';

const mapStateToProps = state => {
  return {
    players: state.canvas.players,
    gameMap: state.canvas.gameMap,
    player: state.canvas.player,
    foods: state.canvas.foods,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    insertNewRectangle: () => dispatch({ type: ADD_COLORED_RECT }),
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

const isVisible = (gameEntity, gameMap) => {
  const paintX = relativeX(gameEntity.x, gameMap);
  const paintY = relativeY(gameEntity.y, gameMap);
  const halfWidth = relativeW(gameEntity.width, gameMap) / 2;
  const halfHeight = relativeH(gameEntity.height, gameMap) / 2;

  // console.log(gameEntity, paintX, paintY, halfWidth, halfHeight);
  return (
    paintX + halfWidth > 0 &&
    paintX - halfWidth < gameMap.view.width &&
    paintY + halfHeight > 0 &&
    paintY - halfHeight < gameMap.view.height
  );
};

const Food = foodProps => (
  <Circle {...foodProps} fill={'red'} stroke={'black'} listening={false} />
);

class GameMap extends React.PureComponent {
  render() {
    return (
      <React.Fragment>
        {this.props.foods.map(
          food =>
            isVisible(food, this.props.gameMap) &&
            Food({
              key: food.id,
              x: relativeX(food.x, this.props.gameMap),
              y: relativeY(food.y, this.props.gameMap),
              radius: relativeW(food.width, this.props.gameMap),
            })
        )}
        {this.props.player.points.length > 0 && (
          <Snake {...this.props.player} />
        )}
        {this.props.players.map(
          (player, index) =>
            player.id !== this.props.player.id ? (
              <Snake key={index} {...player} />
            ) : null
        )}
      </React.Fragment>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GameMap);
