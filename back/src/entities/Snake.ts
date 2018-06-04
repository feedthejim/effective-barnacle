import GameEntity, { GameEntityOptions } from './GameEntity';
import Food from './Food';
import config from '../config';

const { SPEED, BASE_ANGLE } = config;

interface SnakeOptions extends GameEntityOptions {
  id: number;
  length?: number;
  angle?: number;
  fillColor?: string;
  strokeColor?: string;
}

export class Movement {
  constructor(
    public x: number,
    public y: number,
    public speed: number,
    public angle: number,
  ) {}
}

export default class Snake extends GameEntity {
  public score: number = 0;
  public isSpeedUp: boolean = false;
  public fillColor: string = '';
  public angle: number;
  public stopped: boolean = false;
  public id: number;

  // save snake's movement
  public movementQueue: Movement[] = [];

  // max length of queue
  public movementQueueLen: number;
  public speed: number = SPEED;
  public oldSpeed: number = SPEED;
  public length: number;
  public toAngle: number;
  private turnSpeed: number = 0.06;
  private vx: number = 0;
  private vy: number = 0;

  constructor(options?: SnakeOptions) {
    super(options);
    this.id = options.id;
    const strokeColor: string = options.strokeColor || '#000';
    this.fillColor = options.fillColor || '#fff';
    this.toAngle = this.angle = (options.angle || 0) + BASE_ANGLE;
    this.length = options.length;
    this.updateSize();
    this.velocity();
  }

  public updateSize(added: number = 0): void {
    this.width += added;
    this.height += added;
    this.length += added * 50;
    this.turnSpeed -= added / 1000;
    this.movementQueueLen = Math.ceil(this.length / this.oldSpeed);
  }

  // move to new position
  public moveTo(nx: number, ny: number): void {
    const x: number = nx - this.x;
    const y: number = this.y - ny;
    let angle: number = Math.atan(Math.abs(x / y));

    // calculate angle, value is 0-360
    if (x > 0 && y < 0) {
      angle = Math.PI - angle;
    } else if (x < 0 && y < 0) {
      angle = Math.PI + angle;
    } else if (x < 0 && y > 0) {
      angle = Math.PI * 2 - angle;
    }

    const oldAngle: number = Math.abs(this.toAngle % (Math.PI * 2));

    // number of turns
    let rounds: number = ~~(this.toAngle / (Math.PI * 2));

    this.toAngle = angle;

    if (oldAngle >= (Math.PI * 3) / 2 && this.toAngle <= Math.PI / 2) {
      // move from fourth quadrant to first quadrant
      rounds += 1;
    } else if (oldAngle <= Math.PI / 2 && this.toAngle >= (Math.PI * 3) / 2) {
      // move from first quadrant to fourth quadrant
      rounds -= 1;
    }

    // calculate the real angle by rounds
    this.toAngle += rounds * Math.PI * 2;
  }

  // calculate horizontal speed and vertical speed by angle of snake header
  public velocity(): void {
    const angle: number = this.angle % (Math.PI * 2);
    const vx: number = Math.abs(this.speed * Math.sin(angle));
    const vy: number = Math.abs(this.speed * Math.cos(angle));

    if (angle < Math.PI / 2) {
      this.vx = vx;
      this.vy = -vy;
    } else if (angle < Math.PI) {
      this.vx = vx;
      this.vy = vy;
    } else if (angle < (Math.PI * 3) / 2) {
      this.vx = -vx;
      this.vy = vy;
    } else {
      this.vx = -vx;
      this.vy = -vy;
    }
  }

  // turn around
  public turnAround(): void {
    const angleDistance: number = this.toAngle - this.angle;

    if (Math.abs(angleDistance) <= this.turnSpeed) {
      // reset angle
      this.toAngle = this.angle = BASE_ANGLE + (this.toAngle % (Math.PI * 2));
    } else {
      this.angle += Math.sign(angleDistance) * this.turnSpeed;
    }
  }

  public speedUp(): void {
    if (this.isSpeedUp) {
      return;
    }

    this.isSpeedUp = true;
    this.oldSpeed = this.speed;
    this.speed *= 2;
  }

  public speedDown(): void {
    if (!this.isSpeedUp) {
      return;
    }

    this.isSpeedUp = false;
    this.speed = this.oldSpeed;
  }

  // eat food
  public eat(food: Food): number {
    this.score += food.value;

    // add points
    const added = food.value / 200;
    this.updateSize(added);
    return added;
  }

  // snake action
  public action() {
    if (this.stopped) {
      return;
    }

    // save movement
    this.movementQueue.push(
      new Movement(this.x, this.y, this.speed, this.angle),
    );

    if (this.movementQueue.length > this.movementQueueLen) {
      this.movementQueue.shift();
    }

    this.turnAround();
    this.velocity();
    this.x += this.vx;
    this.y += this.vy;

    // avoid moving to outside
    // gameMap.limit(this);
  }
}
