import React from 'react';
import { Rect, Group } from 'react-konva';
import { connect } from 'react-redux';

const mapStateToProps = state => {
  return {
    gameMap: state.canvas.gameMap,
  };
};

const mapDispatchToProps = (/* dispatch*/) => {
  return {};
};

const MAP_RECT_WIDTH = 150;
const MAP_RECT_HEIGHT = 150;
const TILE_RATIO = 1;

class Tiles extends React.Component {
  shouldComponentUpdate() {
    return false;
  }
  render() {
    return this.props.tiles.map((shape, index) => (
      <Rect
        listening={false}
        key={index}
        x={shape.x}
        y={shape.y}
        width={shape.w}
        height={shape.h}
        fill={shape.color}
      />
    ));
  }
}

class Background extends React.Component {
  constructor(props) {
    super(props);

    const shapes = [];
    const width = MAP_RECT_WIDTH * 10 * TILE_RATIO;
    const height = MAP_RECT_HEIGHT * 10 * TILE_RATIO;
    const mrw = MAP_RECT_WIDTH / TILE_RATIO;
    const mrh = MAP_RECT_HEIGHT / TILE_RATIO;
    const colors = ['#ccc', '#999'];

    for (let x = 0, i = 0; x <= width; x += mrw, i++) {
      let color = colors[i % 2];
      for (let y = 0; y <= height; y += mrh) {
        const cx = width - x;
        const cy = height - y;
        const w = cx < mrw ? cx : mrw;
        const h = cy < mrh ? cy : mrh;
        shapes.push({ x, y, h, w, color });
        color = color === colors[0] ? colors[1] : colors[0];
      }
    }
    this.state = {
      shapes,
    };
  }

  relative(value) {
    return value / this.props.gameMap.scale;
  }

  render() {
    const gameMap = this.props.gameMap;
    const view = gameMap.view;

    const width = MAP_RECT_WIDTH * 10 * TILE_RATIO;
    const height = MAP_RECT_HEIGHT * 10 * TILE_RATIO;

    const tileWidth = this.relative(width);
    const tileHeigth = this.relative(height);

    const beginX = view.x < 0 ? -view.x : -view.x % tileWidth;
    const beginY = view.y < 0 ? -view.y : -view.y % tileHeigth;

    const endX =
      view.x + view.width > gameMap.paintWidth
        ? gameMap.paintWidth - view.x
        : beginX + view.width + tileWidth;

    const endY =
      view.y + view.height > gameMap.paintHeight
        ? gameMap.paintHeight - view.y
        : beginY + view.height + tileHeigth;

    const cx = endX - beginX;
    const cy = endY - beginY;
    const w = cx > tileWidth ? cx : tileWidth;
    const h = cy > tileHeigth ? cy : tileHeigth;

    const clippingParams = {
      clipX: beginX,
      clipY: beginY,
      clipHeight: h,
      clipWidth: w,
    };

    // const clippingParams2 = {
    //   clipX: beginX + w,
    //   clipY: beginY,
    //   clipHeight: h,
    //   clipWidth: w,
    // };

    // const clippingParams3 = {
    //   clipX: beginX,
    //   clipY: beginY + h,
    //   clipHeight: h,
    //   clipWidth: w,
    // };

    // const clippingParams4 = {
    //   clipX: beginX + w,
    //   clipY: beginY + h,
    //   clipHeight: h,
    //   clipWidth: w,
    // };
    return (
      <React.Fragment>
        <Group {...clippingParams} listening={false}>
          <Group
            listening={false}
            x={clippingParams.clipX}
            y={clippingParams.clipY}
            scaleX={2 - this.props.gameMap.scale}
            scaleY={2 - this.props.gameMap.scale}
          >
            <Tiles tiles={this.state.shapes} />
          </Group>
        </Group>
        {/* <Group {...clippingParams2} listening={false}>
          <Group
            listening={false}
            x={clippingParams2.clipX}
            y={clippingParams2.clipY}
            scaleX={2 - this.props.gameMap.scale}
            scaleY={2 - this.props.gameMap.scale}
          >
            <Tiles tiles={this.state.shapes} />
          </Group>
        </Group>
        <Group {...clippingParams3} listening={false}>
          <Group
            listening={false}
            x={clippingParams3.clipX}
            y={clippingParams3.clipY}
            scaleX={2 - this.props.gameMap.scale}
            scaleY={2 - this.props.gameMap.scale}
          >
            <Tiles tiles={this.state.shapes} />
          </Group>
        </Group>
        <Group {...clippingParams4} listening={false}>
          <Group
            listening={false}
            x={clippingParams4.clipX}
            y={clippingParams4.clipY}
            scaleX={2 - this.props.gameMap.scale}
            scaleY={2 - this.props.gameMap.scale}
          >
            <Tiles tiles={this.state.shapes} />
          </Group>
        </Group> */}
      </React.Fragment>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Background);
