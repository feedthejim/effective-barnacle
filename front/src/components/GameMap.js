import React from 'react';
import { connect } from 'react-redux';
import { ADD_COLORED_RECT } from '../actions/canvas';
import Snake from './Snake';
import { Circle, Label, Tag, Text } from 'react-konva';

// import Food from './Food';

const mapStateToProps = state => {
  return {
    players: state.canvas.players,
    leaderboard: state.canvas.leaderboard,
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
  const width = relativeW(gameEntity.width, gameMap);
  const height = relativeH(gameEntity.height, gameMap);
  return !(
    paintX > gameMap.view.width ||
    paintX + width < 0 ||
    paintY > gameMap.view.height ||
    paintY + height < 0
  );
};

const snakeIsVisible = ({ collisionRect }, gameMap) =>
  isVisible(
    {
      x: collisionRect.minX,
      y: collisionRect.minY,
      width: collisionRect.maxX - collisionRect.minX,
      height: collisionRect.maxY - collisionRect.minY,
    },
    gameMap
  );

const Food = foodProps => (
  <Circle {...foodProps} fill={'yellow'} stroke={'white'} listening={false} />
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
          player =>
            player.id !== this.props.player.id &&
            snakeIsVisible(player, this.props.gameMap) && (
              <Snake key={player.id} {...player} />
            )
        )}
        {this.props.leaderboard.map((player, index) => (
          <Label key={player.id} x={10} y={10 + index * 30}>
            <Tag
              fill={'white'}
              lineJoin="round"
              shadowColor="black"
              opacity={0.2}
            />
            <Text
              text={`${index + 1}: ${player.username} - ${player.score}`}
              fontFamily="Arial"
              fontSize={18}
              padding={5}
              fill="white"
            />
          </Label>
        ))}
      </React.Fragment>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GameMap);
