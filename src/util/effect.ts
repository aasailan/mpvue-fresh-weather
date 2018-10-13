/*
 * @Author: qiao 
 * @Date: 2018-10-13 11:22:01 
 * @Last Modified by:   qiao 
 * @Last Modified time: 2018-10-13 11:22:01 
 * 粒子特效
 */

const STATUS_STOP = 'stop';
const STATUS_RUNNING = 'running';
/**
 * @description 基类负责整个粒子系统动画周期和流程的维护，下雨下雪的开关和公共处理流程是基类控制的
 * @class Particle
 */
export class Particle {
  _timer: any;
  _options: any;
  ctx: any;
  status: string;
  w: number;
  h: number;

  constructor(ctx, width: number, height: number, opts: any) {
    this._timer = null;
    this._options = opts || {};
    this.ctx = ctx;
    this.status = STATUS_STOP;
    this.w = width;
    this.h = height;

    this._init();
  }
  // 子类实现
  _init() { }
  _draw() { }
  // 运行函数
  run() {
    if (this.status !== STATUS_RUNNING) {
      this.status = STATUS_RUNNING;
      // 每30ms绘画一次
      this._timer = setInterval(() => {
        this._draw();
      }, 30);
    }
    return this;
  }
  // 停止动画
  stop() {
    this.status = STATUS_STOP;
    clearInterval(this._timer);
    return this;
  }
  // 清理画布
  clear() {
    this.stop();
    this.ctx.clearRect(0, 0, this.w, this.h);
    this.ctx.draw();
    return this;
  }
}

// 雨点粒子接口
interface IRainPoint {
  x: number;
  y: number;
  l: number;
  xs: number;
  ys: number;
  color: string;
}

/**
 * @description 下雨特效
 * @class Rain
 * @extends {Particle}
 */
export class Rain extends Particle {
  // 粒子数组
  particles: IRainPoint[];

  _init() {
    let ctx = this.ctx;
    ctx.setLineWidth(2);
    ctx.setLineCap('round');
    const h = this.h;
    const w = this.w;
    let i;
    const amount = this._options.amount || 100;
    const speedFactor = this._options.speedFactor || 0.03;
    const speed = speedFactor * h;
    // 粒子数组
    const ps: IRainPoint[] = (this.particles = []);
    // 新建粒子数组
    for (i = 0; i < amount; i++) {
      const p = {
        // 画布上的x、y位置
        x: Math.random() * w,
        y: Math.random() * h,
        l: 2 * Math.random(),
        // xs、ys，粒子在x、y方向的移动速度
        xs: -1,
        ys: 10 * Math.random() + speed,
        // 粒子颜色
        color: 'rgba(255, 255, 255, 0.1)'
      } as IRainPoint;
      ps.push(p);
    }
  }
  // 更新下一帧粒子信息
  _update() {
    let { w, h } = this;

    this.particles.forEach(p => {
      p.x += p.xs;
      p.y += p.ys;
      // 重复利用
      if (p.x > w || p.y > h) {
        p.x = Math.random() * w;
        p.y = -10;
      }
    });
    return this;
  }
  _draw() {
    let ps = this.particles;
    let ctx = this.ctx;
    // 清理画布
    ctx.clearRect(0, 0, this.w, this.h);
    // 向画布上布置粒子
    for (let i = 0; i < ps.length; i++) {
      let s = ps[i];
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x + s.l * s.xs, s.y + s.l * s.ys);
      ctx.setStrokeStyle(s.color);
      ctx.stroke();
    }
    ctx.draw();
    return this._update();
  }
}

// 星星粒子接口
interface IStarPoint {
  x: number;
  y: number;
  opacity: number;
  blur: number;
  r: number;
  color: string;
}

/**
 * @description 星星特效
 * @class Star
 * @extends {Particle}
 */
export class Star extends Particle {
  // 粒子数组
  particles: IStarPoint[];

  _init() {
    let amount = this._options.amount || 100;
    let ps: IStarPoint[] = (this.particles = []);
    for (let i = 0; i < amount; i++) {
      // console.log(x, y)
      ps.push(this._getStarOptions());
    }
  }
  _draw() {
    let ps = this.particles;
    let ctx = this.ctx;
    // 清理画布
    ctx.clearRect(0, 0, this.w, this.h);
    // 向画布添加每个粒子信息
    for (let i = 0; i < ps.length; i++) {
      let { x, y, r, blur, opacity, color } = ps[i];

      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.setFillStyle(`rgba(${color},${opacity})`);
      ctx.shadowColor = `rgba(${color},${opacity})`;
      ctx.shadowBlur = blur;
      ctx.fill();
      ctx.closePath();
      ps[i].opacity = 1;
    }

    ctx.draw();
    this._update();
  }
  // 生成一个随机的星星粒子
  _getStarOptions() {
    let { w, h } = this;
    let radius = this._options.radius || 2;
    const MAX_BLUR = radius * 10;
    const MIN_BLUR = 0.1;
    const RGB_PROB = 5;
    const RGB_COLR = [255, 255, 255]; // default color
    const MAX_COLR = [255, 255, 0]; // color max
    const MIN_COLR = [255, 0, 0];
    let x = Math.random() * w;
    let y = Math.random() * h / 5;
    return {
      x,
      y,
      opacity: 1,
      blur: Math.random() * (MAX_BLUR - MIN_BLUR) + MIN_BLUR,
      r: Math.floor(Math.random() * (radius + 0.5) + 0.5),
      color: (Math.random() <= RGB_PROB / 100
        ? [
            Math.round(Math.random() * (MAX_COLR[0] - MIN_COLR[0]) + MIN_COLR[0]),
            Math.round(Math.random() * (MAX_COLR[1] - MIN_COLR[1]) + MIN_COLR[1]),
            Math.round(Math.random() * (MAX_COLR[2] - MIN_COLR[2]) + MIN_COLR[2])
          ]
        : RGB_COLR).join(',')
    } as IStarPoint;
  }
  // 更新下一帧粒子信息
  _update() {
    const INN_FADE = 30; // fade in %
    const OUT_FADE = 50;
    let amount = this._options.amount;

    let innPrc;
    let outPrc;
    let ps = this.particles;

    // 取出重新插入队尾，更新粒子队列中的粒子
    let select = ps.splice(0, Math.floor(ps.length / 50));
    for (let i = 0; i < select.length; i++) {
      ps.push(this._getStarOptions());
    }
    // 更新所有粒子的信息，包括透明度等
    for (let i = 0; i < ps.length; i++) {
      let p = ps[i];
      innPrc = INN_FADE * amount / 100;
      outPrc = OUT_FADE * amount / 100;
      if (i < outPrc) {
        p.opacity = i / outPrc;
      } else if (i > amount - innPrc) {
        p.opacity -= (i - (amount - innPrc)) / innPrc;
      }
    }
  }
}

interface ISnowPoint {
  x: number;
  y: number;
  ox: number;
  ys: number;
  r: number;
  color: string;
  rs: number;
}

/**
 * @description 下雪特效
 * @class Snow
 * @extends {Particle}
 */
export class Snow extends Particle {
  particles: ISnowPoint[];
  _init() {
    let { w, h } = this;
    let colors = this._options._colors || ['#ccc', '#eee', '#fff', '#ddd'];
    let amount = this._options.amount || 100;

    let speedFactor = this._options.speedFactor || 0.03;
    let speed = speedFactor * h * 0.15;

    let radius = this._options.radius || 2;
    let ps: ISnowPoint[] = (this.particles = []);

    for (let i = 0; i < amount; i++) {
      let x = Math.random() * w;
      let y = Math.random() * h;
      // console.log(x, y)
      ps.push({
        x,
        y,
        ox: x,
        ys: Math.random() + speed,
        r: Math.floor(Math.random() * (radius + 0.5) + 0.5),
        color: colors[Math.floor(Math.random() * colors.length)],
        rs: Math.random() * 80
      });
    }
  }
  _draw() {
    let ps = this.particles;
    let ctx = this.ctx;
    // 清理画布
    ctx.clearRect(0, 0, this.w, this.h);
    // 向画布添加粒子信息
    for (let i = 0; i < ps.length; i++) {
      let { x, y, r, color } = ps[i];
      ctx.beginPath();
      // console.log(x,y)
      ctx.arc(x, y, r, 0, Math.PI * 2, false);
      ctx.setFillStyle(color);
      ctx.fill();
      ctx.closePath();
    }

    ctx.draw();
    this._update();
  }
  // 更新下一帧粒子信息
  _update() {
    let { w, h } = this;
    let v = this._options.speedFactor / 10;
    let ps = this.particles;
    for (let i = 0; i < ps.length; i++) {
      let p = ps[i];
      let { ox, ys } = p;
      p.rs += v;
      p.x = ox + Math.cos(p.rs) * w / 2;
      p.y += ys;
      // console.log(ys)
      // 重复利用
      if (p.x > w || p.y > h) {
        p.x = Math.random() * w;
        p.y = -10;
      }
    }
  }
}

export default (ParticleName: string, id, width: number, height: number, opts: any) => {
  switch (ParticleName.toLowerCase()) {
    case 'rain':
      return new Rain(id, width, height, opts);
    case 'snow':
      return new Snow(id, width, height, opts);
    case 'star':
      return new Star(id, width, height, opts);
    default: 
      return new Rain(id, width, height, opts);
  }
};
