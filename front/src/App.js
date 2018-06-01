import React from 'react';
import Canvas from './components/Canvas';
import { connect } from 'react-redux';
import { WEBSOCKET_CONNECT } from './actions/websocket';

const mapStateToProps = state => {
  return {
    isGameRunning: state.canvas.isGameRunning,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    connect: username =>
      dispatch({
        type: WEBSOCKET_CONNECT,
        url: 'ws://localhost:4242',
        username,
      }),
  };
};

class App extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    this.props.connect('Jimmy');
  }

  render() {
    return this.props.isGameRunning && <Canvas />;
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
