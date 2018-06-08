import React from 'react';
import Canvas from './components/Canvas';
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

  componentDidMount() {
    // this.props.connect('Jimmy');
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  click() {
    console.log('mdr');
    this.props.disconnect();
    this.props.connect(this.state.value);
  }

  render() {
    return this.props.isGameRunning ? (
      this.props.gameOver ? (
        <div>
          Game over! Respawn in ...
          <Countdown
            onComplete={() => this.click()}
            date={Date.now() + 5000}
          />,
        </div>
      ) : (
        <Canvas />
      )
    ) : (
      <div
        onKeyPress={event => {
          if (event.key === 'Enter') {
            console.log('llol');
            this.click();
          }
        }}
      >
        <input
          type="text"
          value={this.state.value}
          onChange={event => this.handleChange(event)}
        />
        <button onClick={() => this.click()}>Connect</button>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
