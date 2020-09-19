import canvasSketch from 'canvas-sketch';
import { linspace } from 'canvas-sketch-util/math';
import { pick, range, rangeFloor } from 'canvas-sketch-util/random';

// https://hihayk.github.io/scale
const colors = {
  front: [
    '#3E477D',
    '#414B83',
    '#444E89',
    '#47528F',
    '#4A5595',
    '#4D599B',
    '#505CA1',
    '#5360A8',
    '#5663AE',
    '#5967B4',
  ],
  back: [
    '#5C6ABA',
    '#5F6DBC',
    '#6271BD',
    '#6574BF',
    '#6877C0',
    '#6B7BC1',
    '#6E7EC3',
    '#7181C4',
    '#7484C6',
    '#7787C7',
    '#798BC9',
  ],
};

class Swirl {
  constructor(context, width, height, gradient) {
    this.startBounds = Math.min(width / 4, height / 4);
    this.context = context;
    this.width = width;
    this.height = height;

    this.x = rangeFloor(-this.startBounds, this.startBounds);
    this.y = rangeFloor(-this.startBounds, this.startBounds);
    this.rotation = range(0, Math.PI * 2);

    this.frequency = range(16, 24);
    this.travel = range(0.5, 1.5);
    this.wobble = range(2, 5);

    this.strokeFrame = 16;
    this.strokeWidthStart = range(100, 150);
    this.strokeWidthEnd = range(60, 90);

    this.gradients = ['front', 'back'].reduce((sides, side) => {
      const gradient = this.context.createLinearGradient(
        -this.strokeWidthStart,
        -this.strokeFrame,
        0,
        0,
      );

      linspace(rangeFloor(10, 25)).forEach(stop => {
        gradient.addColorStop(stop, pick(colors[side]));
      });

      sides[side] = gradient;
      return sides;
    }, {});

    this.previousRotation = 0;
  }

  update(playhead) {
    const inversePlayhead = 1 - playhead;
    this.context.save();

    this.context.translate(this.width / 2, this.height / 2);
    this.context.rotate(this.rotation);

    const cos = Math.cos(playhead * this.frequency);
    this.x +=
      0.5 + inversePlayhead * (1 - Math.abs(cos)) * (playhead + this.travel);
    this.y += cos * Math.max(inversePlayhead, 0.25) * this.wobble;
    this.context.translate(this.x, this.y);

    const rotation = cos * inversePlayhead * 2.5;
    this.context.rotate(rotation);

    const side = this.previousRotation < rotation ? 'front' : 'back';
    this.context.fillStyle = this.gradients[side];

    this.context.fillRect(
      -(this.strokeWidthStart - this.strokeWidthEnd * playhead),
      -this.strokeFrame * Math.max(inversePlayhead, 0.1),
      this.strokeWidthStart - this.strokeWidthEnd * playhead,
      this.strokeFrame * Math.max(inversePlayhead, 0.1),
    );

    this.context.restore();
    this.previousRotation = rotation;
  }
}

let swirl;
canvasSketch(
  ({ context, width, height }) => {
    context.fillStyle = '#B6D59E';
    context.fillRect(0, 0, width, height);
    return ({ context, frame, width, height, playhead }) => {
      if (!frame || !swirl) {
        swirl = new Swirl(context, width, height);
      } else {
        swirl.update(playhead);
      }
    };
  },
  {
    animate: true,
    duration: 8,
    fps: 60,
  },
);
