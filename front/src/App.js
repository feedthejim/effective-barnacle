import React from 'react';
import Canvas from './components/Canvas';
import Home from './components/Home';
import { connect } from 'react-redux';
import Countdown from 'react-countdown-now';
import { WEBSOCKET_CONNECT, WEBSOCKET_CANCEL } from './actions/websocket';
import rug from 'random-username-generator';

const mapStateToProps = state => {
  return {
    isGameRunning: state.canvas.isGameRunning,
    gameOver: state.canvas.gameOver,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    disconnect: () =>
      dispatch({
        type: WEBSOCKET_CANCEL,
      }),
    connect: username =>
      dispatch({
        type: WEBSOCKET_CONNECT,
        username,
      }),
  };
};

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      value: rug.generate(),
    };
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  click() {
    this.props.disconnect();
    this.props.connect(this.state.value.substring(0, 40) || rug.generate());
  }

  render() {
    return this.props.isGameRunning ? (
      this.props.gameOver ? (
        <Home>
          <h2>Game over!</h2>
          <p className="panel-respawn">Respawn in</p>
          <Countdown
            onComplete={() => this.click()}
            date={Date.now() + 5000}
            zeroPadLength={1}
            renderer={({ seconds }) => {
              return <h1 className="panel-coutdown">{seconds}</h1>;
            }}
          />
        </Home>
      ) : (
        <Canvas />
      )
    ) : (
      <div
        onKeyPress={event => {
          if (event.key === 'Enter') {
            this.click();
          }
        }}
        className="panels-wrapper"
      >
        <Home>
          <p>Enter your nickname & play !</p>

          <input
            type="text"
            placeholder="Nickname"
            value={this.state.value}
            onChange={event => this.handleChange(event)}
            autoFocus
          />

          <button
            className="panel-button"
            onClick={() => this.click()}
          >
              Play
          </button>
        </Home>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
