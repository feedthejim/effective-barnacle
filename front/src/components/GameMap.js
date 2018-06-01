import React from 'react';
import { Layer } from 'react-konva';
import { connect } from 'react-redux';
import { ADD_COLORED_RECT } from '../actions/canvas';
import Snake from './Snake';

const mapStateToProps = state => {
  return {
    players: state.canvas.players,
    player: state.canvas.player,
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

export default connect(mapStateToProps, mapDispatchToProps)(GameMap);
