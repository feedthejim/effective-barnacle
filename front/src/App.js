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
        username,
      }),
  };
};

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      value: '',
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
    this.props.connect(this.state.value);
  }

  render() {
    return this.props.isGameRunning ? (
      <Canvas />
    ) : (
      <div>
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
