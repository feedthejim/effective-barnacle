import React from 'react';
import { Layer } from 'react-konva';
import { connect } from 'react-redux';
import { ADD_COLORED_RECT } from '../actions/canvas';
import Snake from './Snake';
import Food from './Food';

const mapStateToProps = state => {
  return {
    players: state.canvas.players,
    player: state.canvas.player,
    foods: state.canvas.foods,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    insertNewRectangle: () => dispatch({ type: ADD_COLORED_RECT }),
  };
};

class GameMap extends React.Component {
  render() {
    return (
      <Layer>
        {this.props.foods.map((food, index) => <Food key={index} {...food} />)}
        <Snake {...this.props.player} />
        {this.props.players.map(
          (player, index) =>
            player.id !== this.props.player.id ? (
              <Snake key={index} {...player} />
            ) : null
        )}
      </Layer>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GameMap);
