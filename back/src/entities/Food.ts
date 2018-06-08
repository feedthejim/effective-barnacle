import GameEntity, { GameEntityOptions } from './GameEntity';

interface FoodOptions extends GameEntityOptions {
  value: number;
  id: string;
}

export default class Food extends GameEntity {
  public value: number;
  public lightSize: number;
  public lightDirection: boolean = true;
  public id: string;

  constructor(options: FoodOptions) {
    super(options);
    this.id = options.id;
    this.value = options.value;
    this.lightSize = this.width / 2;
  }

  public action() {
    const lightSpeed = 1;

    this.lightSize += this.lightDirection ? lightSpeed : -lightSpeed;

    // light animate
    if (this.lightSize > this.width || this.lightSize < this.width / 2) {
      this.lightDirection = !this.lightDirection;
    }
  }
}
