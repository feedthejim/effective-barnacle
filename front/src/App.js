import React from 'react'
import { Stage, Layer, Rect } from 'react-konva'
// import Konva from 'konva';
// import * as R from 'ramda';
import { connect } from 'react-redux'
import { ADD_COLORED_RECT } from './actions/canvas'
import { WEBSOCKET_CONNECT } from './actions/websocket'
import Konva from 'konva'

const mapStateToProps = state => {
  return {
    isGameRunning: state.canvas.isGameRunning,
    players: state.canvas.players,
    player: state.canvas.player,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    insertNewRectangle: () => dispatch({ type: ADD_COLORED_RECT }),
    connect: username =>
      dispatch({
        type: WEBSOCKET_CONNECT,
        url: 'ws://localhost:4242',
        username,
      }),
  }
}

const Rectangle = ({ color, body }) => (
  <Rect
    x={body[0].x}
    y={body[0].y}
    width={50}
    height={50}
    fill={Konva.Util.getRandomColor()}
    shadowBlur={5}
  />
)

const Canvas = ({ players }) => {
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>{players.map(Rectangle)}</Layer>
    </Stage>
  )
}

class App extends React.Component {
  constructor() {
    super()
    this.state = {}
  }

  componentDidMount() {
    this.props.connect('Jimmy')
  }

  render() {
    return this.props.isGameRunning && Canvas(this.props)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
