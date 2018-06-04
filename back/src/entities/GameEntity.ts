export interface GameEntityOptions {
  x: number;
  y: number;
  size: number;
  width?: number;
  height?: number;
}

export default abstract class GameEntity {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  // public paintX: number;
  // public paintY: number;
  // public paintWidth: number;
  // public paintHeight: number;
  // public visible: boolean;

  constructor(options: GameEntityOptions) {
    this.x = +(options.x || 0);
    this.y = +(options.y || 0);
    this.width = options.size || options.width;
    this.height = options.size || options.height;

    if (!this.width || !this.height) {
      throw new Error('element size can not be undefined');
    }
  }

  /**
   * update status
   */
  public update(): void {
    // this.prepare();
    this.action();
    // this.render();
  }

  public abstract action(): void;

  // public abstract render(): void;

  // private prepare(): void {
  //   this.paintX = gameMap.view.relativeX(this.x);
  //   this.paintY = gameMap.view.relativeY(this.y);
  //   this.paintWidth = gameMap.view.relativeW(this.width);
  //   this.paintHeight = gameMap.view.relativeH(this.height);
  //   const halfWidth = this.paintWidth / 2;
  //   const halfHeight = this.paintHeight / 2;
  //   this.visible = (this.paintX + halfWidth > 0)
  //     && (this.paintX - halfWidth < gameMap.view.width)
  //     && (this.paintY + halfHeight > 0)
  //     && (this.paintY - halfHeight < gameMap.view.height);
  // }
}
