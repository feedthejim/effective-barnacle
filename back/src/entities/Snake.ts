import GameEntity, { GameEntityOptions } from './GameEntity';
import Food from './Food';
import config from '../config';
import randomcolor = require('randomcolor');
const simplify = require('simplify-js');

const { SPEED, BASE_ANGLE, INITIAL_SCALE, MAX_SIZE, MAX_LEN } = config;

interface SnakeOptions extends GameEntityOptions {
  id: string;
  length?: number;
  angle?: number;
  username: string;
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
  public id: string;
  public scale: number = INITIAL_SCALE;
  public isBlinking: boolean = false;
  public collisionRect: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };

  public frameCounter: number = 0;

  // save snake's movement
  public movementQueue: Movement[] = [];
  public username: string;
  // max length of queue
  public movementQueueLen: number;
  public speed: number = SPEED;
  public oldSpeed: number = SPEED;
  public length: number;
  public toAngle: number;
  private turnSpeed: number = 0.15;
  private vx: number = 0;
  private vy: number = 0;

  public points: {
    x: number;
    y: number;
  }[] = [];

  public simplifiedPoints: {
    x: number;
    y: number;
  }[] = [];

  constructor(options?: SnakeOptions) {
    super(options);
    this.id = options.id;
    const strokeColor: string = options.strokeColor || '#000';
    this.fillColor = randomcolor();
    this.toAngle = this.angle = (options.angle || 0) + BASE_ANGLE;
    this.length = options.length;
    this.collisionRect = {
      minX: 30000,
      maxX: -30000,
      minY: 30000,
      maxY: -30000,
    };
    this.username = options.username;
    this.updateSize();
    this.velocity();
  }

  public updateSize(added: number = 0): void {
    this.width = Math.min(this.width + added,  MAX_SIZE);
    this.height = Math.min(this.height + added, MAX_SIZE);
    this.length += Math.min(added * 50, MAX_LEN);
    this.turnSpeed -= added / 1000;
    this.turnSpeed = Math.max(0.08, this.turnSpeed);
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

    this.frameCounter = 10;

    // add points
    const added = food.value / 200;
    this.updateSize(added);
    return added;
  }

  public blink(): void {
    this.isBlinking = !this.isBlinking;
  }

  public updateCollisionRect(): void {
    this.simplifiedPoints = simplify(this.points, 5);
    // this.simplifiedPoints = this.points.slice(9, this.points.len);
    this.collisionRect = {
      minX: 3000,
      maxX: -3000,
      minY: 3000,
      maxY: -3000,
    };

    this.simplifiedPoints.forEach((point: any) => {
      if (point.x < this.collisionRect.minX) {
        this.collisionRect.minX = point.x;
      }
      if (point.x > this.collisionRect.maxX) {
        this.collisionRect.maxX = point.x;
      }
      if (point.y < this.collisionRect.minY) {
        this.collisionRect.minY = point.y;
      }
      if (point.y > this.collisionRect.maxY) {
        this.collisionRect.maxY = point.y;
      }
    });

    this.collisionRect.minX -= this.width;

    this.collisionRect.minY -= this.width;

    this.collisionRect.maxX += this.width;

    this.collisionRect.maxY += this.width;
  }

  // snake action
  public action() {
    if (this.stopped) {
      return;
    }

    if (this.frameCounter > 0) {
      this.blink();
      this.frameCounter -= 1;
    } else {
      this.isBlinking = false;
    }

    if (this.isSpeedUp) {
      this.length = Math.max(this.length - 2, 0);
      this.movementQueueLen = Math.max(this.movementQueueLen - 2, 0);
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

    this.points = [];
    let wholeLength = this.length;
    if (this.movementQueue.length) {
      let i = this.movementQueue.length - 1;
      while (i > 0) {
        const movement = this.movementQueue[i];
        let x = movement.x;
        let y = movement.y;
        if (wholeLength > 0 && wholeLength < movement.speed) {
          const lm = this.movementQueue[i + 1] || this;
          const ratio = wholeLength / movement.speed;
          x = lm.x - (lm.x - x) * ratio;
          y = lm.y - (lm.y - y) * ratio;
        } else if (wholeLength < 0) {
          break;
        }

        i -= 1;
        wholeLength -= movement.speed;
        this.points.push({ x, y });
      }
    }
    this.updateCollisionRect();
  }
}
