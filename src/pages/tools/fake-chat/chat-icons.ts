/**
 * chat-icons - Canvas Path 手绘图标
 *
 * 用 Canvas 2D Path API 绘制聊天截图所需的系统 UI 图标
 * 解决微信小程序 Canvas 不支持 SVG 渲染的问题
 *
 * 所有函数内部使用 save/restore，不污染外部 Canvas 状态
 */

// ==================== 工具函数 ====================

/** 绘制圆角矩形路径（不填充不描边，调用方执行 fill/stroke） */
function pathRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// ==================== 状态栏图标 ====================

/**
 * 绘制移动信号图标（4 根递增竖条）
 * 参考 Mobile Signal.svg (viewBox: 0 0 17 10.67)
 */
function drawSignalIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
): void {
  ctx.save();
  ctx.fillStyle = color;
  const sx = w / 17;
  const sy = h / 10.67;
  const bars = [
    { bx: 0, by: 6.67, bw: 3, bh: 4 },
    { bx: 4.67, by: 4.67, bw: 3, bh: 6 },
    { bx: 9.33, by: 2.33, bw: 3, bh: 8.33 },
    { bx: 14, by: 0, bw: 3, bh: 10.67 },
  ];
  for (const b of bars) {
    const rx = x + b.bx * sx;
    const ry = y + b.by * sy;
    const rw = b.bw * sx;
    const rh = b.bh * sy;
    const r = Math.min(rw * 0.2, rh * 0.1);
    pathRoundRect(ctx, rx, ry, rw, rh, r);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * 绘制 WiFi 图标（3 段弧线 + 底部圆点）
 * 参考 Wifi.svg (viewBox: 0 0 15.27 10.97)
 */
function drawWifiIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = 'round';
  ctx.lineWidth = h * 0.1;
  const cx = x + w / 2;
  const cy = y + h * 0.95;
  const radii = [h * 0.75, h * 0.5, h * 0.25];
  for (const r of radii) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI * 0.75, -Math.PI * 0.25);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(cx, cy, h * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * 绘制电池图标（外壳轮廓 + 右侧凸起 + 内部填充）
 * 参考 Battery.svg (viewBox: 0 0 24.33 11.33)
 */
function drawBatteryIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
): void {
  ctx.save();
  const sx = w / 24.33;
  const sy = h / 11.33;
  // 外壳轮廓（低透明度描边）
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1 * Math.min(sx, sy);
  pathRoundRect(ctx, x + 0.5 * sx, y + 0.5 * sy, 21 * sx, 10.33 * sy, 2.5 * Math.min(sx, sy));
  ctx.stroke();
  // 右侧凸起
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = color;
  const bumpH = 4 * sy;
  pathRoundRect(
    ctx,
    x + 22 * sx,
    y + (11.33 * sy - bumpH) / 2,
    1.33 * sx,
    bumpH,
    0.5 * Math.min(sx, sy)
  );
  ctx.fill();
  // 内部填充
  ctx.globalAlpha = 1;
  pathRoundRect(ctx, x + 2 * sx, y + 2 * sy, 18 * sx, 7.33 * sy, 1 * Math.min(sx, sy));
  ctx.fill();
  ctx.restore();
}

// ==================== 导航栏图标 ====================

/**
 * 绘制返回箭头（V 形指向左）
 * 参考 back.svg (viewBox: 0 0 24 24)
 */
function drawBackIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
): void {
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(1.5, w * 0.07);
  ctx.beginPath();
  ctx.moveTo(x + w * 0.65, y + h * 0.2);
  ctx.lineTo(x + w * 0.35, y + h * 0.5);
  ctx.lineTo(x + w * 0.65, y + h * 0.8);
  ctx.stroke();
  ctx.restore();
}

/**
 * 绘制更多按钮（3 个横排圆点）
 * 参考 more.svg (viewBox: 0 0 24 24)
 * 三个圆点精确按 viewBox 比例排列，更接近真实微信标题栏按钮
 */
function drawMoreIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
): void {
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = color;

  const sx = w / 24;
  const sy = h / 24;
  // SVG 中三个圆点中心在 x=5,12,19, y=12，半径约 2
  const dotR = Math.max(1, Math.min(sx, sy) * 2);
  const cy = y + 12 * sy;

  for (const dx of [5, 12, 19]) {
    ctx.beginPath();
    ctx.arc(x + dx * sx, cy, dotR, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ==================== 输入栏图标 ====================

/**
 * 绘制语音输入按钮（圆圈 + 3 段声波弧线）
 * 参考 voice.svg (viewBox: 0 0 32 32)
 */
function drawVoiceInputIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
): void {
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = color;

  const sx = w / 32;
  const sy = h / 32;
  const sc = Math.min(sx, sy);
  const cx = x + 16 * sx;
  const cy = y + 16 * sy;

  // ============ 圆环（外圆 - 内圆, evenodd 填充）============
  ctx.beginPath();
  ctx.arc(cx, cy, 13.333 * sc, 0, Math.PI * 2);
  ctx.arc(cx, cy, 11.733 * sc, 0, Math.PI * 2, true);
  ctx.fill('evenodd');

  // ============ 最外层声波弧线（右侧最大弧）============
  ctx.beginPath();
  ctx.moveTo(x + 16.4111 * sx, y + 22.41113 * sy);
  ctx.bezierCurveTo(
    x + 18.1015 * sx,
    y + 20.72071 * sy,
    x + 19.06666 * sx,
    y + 18.43878 * sy,
    x + 19.06666 * sx,
    y + 16.0 * sy
  );
  ctx.bezierCurveTo(
    x + 19.06666 * sx,
    y + 13.56121 * sy,
    x + 18.1015 * sx,
    y + 11.27929 * sy,
    x + 16.4111 * sx,
    y + 9.5889 * sy
  );
  ctx.lineTo(x + 17.54247 * sx, y + 8.45753 * sy);
  ctx.bezierCurveTo(
    x + 19.47275 * sx,
    y + 10.38782 * sy,
    x + 20.66666 * sx,
    y + 13.05449 * sy,
    x + 20.66666 * sx,
    y + 16.0 * sy
  );
  ctx.bezierCurveTo(
    x + 20.66666 * sx,
    y + 18.94552 * sy,
    x + 19.47275 * sx,
    y + 21.61218 * sy,
    x + 17.54247 * sx,
    y + 23.54246 * sy
  );
  ctx.closePath();
  ctx.fill();

  // ============ 中间层声波弧线 ============
  ctx.beginPath();
  ctx.moveTo(x + 15.33333 * sx, y + 16.00001 * sy);
  ctx.bezierCurveTo(
    x + 15.33333 * sx,
    y + 17.43517 * sy,
    x + 14.76601 * sx,
    y + 18.77646 * sy,
    x + 13.77123 * sx,
    y + 19.77123 * sy
  );
  ctx.lineTo(x + 14.90261 * sx, y + 20.90261 * sy);
  ctx.bezierCurveTo(
    x + 16.15729 * sx,
    y + 19.64792 * sy,
    x + 16.93333 * sx,
    y + 17.91459 * sy,
    x + 16.93333 * sx,
    y + 16.00001 * sy
  );
  ctx.bezierCurveTo(
    x + 16.93333 * sx,
    y + 14.0854 * sy,
    x + 16.15729 * sx,
    y + 12.35208 * sy,
    x + 14.90261 * sx,
    y + 11.09739 * sy
  );
  ctx.lineTo(x + 13.77123 * sx, y + 12.22876 * sy);
  ctx.bezierCurveTo(
    x + 14.76601 * sx,
    y + 13.22354 * sy,
    x + 15.33333 * sx,
    y + 14.56483 * sy,
    x + 15.33333 * sx,
    y + 16.00001 * sy
  );
  ctx.closePath();
  ctx.fill();

  // ============ 内侧扬声器锥体（左侧锥形）============
  ctx.beginPath();
  ctx.moveTo(x + 13.19999 * sx, y + 15.99999 * sy);
  ctx.bezierCurveTo(
    x + 13.19999 * sx,
    y + 16.88365 * sy,
    x + 12.84182 * sx,
    y + 17.68365 * sy,
    x + 12.26274 * sx,
    y + 18.26273 * sy
  );
  ctx.lineTo(x + 9.99999 * sx, y + 15.99999 * sy);
  ctx.lineTo(x + 12.26274 * sx, y + 13.73725 * sy);
  ctx.bezierCurveTo(
    x + 12.84182 * sx,
    y + 14.31634 * sy,
    x + 13.19999 * sx,
    y + 15.11633 * sy,
    x + 13.19999 * sx,
    y + 15.99999 * sy
  );
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * 绘制表情按钮（圆圈 + 笑脸）
 * 参考 sticker.svg (viewBox: 0 0 32 32)
 */
function drawStickerIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
): void {
  ctx.save();
  ctx.globalAlpha = 0.9;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const r = Math.min(w, h) / 2;
  const lw = Math.max(1, r * 0.08);
  // 圆圈轮廓
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.arc(cx, cy, r - lw, 0, Math.PI * 2);
  ctx.stroke();
  // 两个眼睛
  ctx.fillStyle = color;
  const eyeR = r * 0.09;
  const eyeY = cy - r * 0.18;
  const eyeGap = r * 0.32;
  ctx.beginPath();
  ctx.arc(cx - eyeGap, eyeY, eyeR, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + eyeGap, eyeY, eyeR, 0, Math.PI * 2);
  ctx.fill();
  // 微笑弧线
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.05, r * 0.4, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();
  ctx.restore();
}

/**
 * 绘制加号按钮（圆圈 + 十字）
 * 参考 add.svg (viewBox: 0 0 32 32)
 */
function drawAddIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
): void {
  ctx.save();
  ctx.globalAlpha = 0.9;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const r = Math.min(w, h) / 2;
  const lw = Math.max(1, r * 0.08);
  // 圆圈轮廓
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.arc(cx, cy, r - lw, 0, Math.PI * 2);
  ctx.stroke();
  // 十字
  ctx.lineWidth = lw * 1.2;
  ctx.lineCap = 'round';
  const arm = r * 0.45;
  ctx.beginPath();
  ctx.moveTo(cx - arm, cy);
  ctx.lineTo(cx + arm, cy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - arm);
  ctx.lineTo(cx, cy + arm);
  ctx.stroke();
  ctx.restore();
}

// ==================== 语音气泡图标 ====================

/**
 * 绘制语音气泡内的声波图标（3 段弧线）
 * @param direction 'right' → )))  'left' → (((
 */
function drawVoiceWaveIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  direction: 'left' | 'right'
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.9;
  // 绘制 3 层实心弧形段，匹配 list_voice.svg 设计
  const cx = x + size / 2;
  const cy = y + size / 2;
  // 外弧 → 中弧 → 内弧（每段跨度约 170°）
  const segments = [
    { outerR: size * 0.48, innerR: size * 0.37 },
    { outerR: size * 0.3, innerR: size * 0.21 },
    { outerR: size * 0.18, innerR: size * 0.09 },
  ];
  const startAngle = direction === 'right' ? -Math.PI * 0.48 : Math.PI * 0.52;
  const endAngle = direction === 'right' ? Math.PI * 0.48 : Math.PI * 1.48;
  for (const seg of segments) {
    ctx.beginPath();
    ctx.arc(cx, cy, seg.outerR, startAngle, endAngle);
    ctx.arc(cx, cy, seg.innerR, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

export {
  drawSignalIcon,
  drawWifiIcon,
  drawBatteryIcon,
  drawBackIcon,
  drawMoreIcon,
  drawVoiceInputIcon,
  drawStickerIcon,
  drawAddIcon,
  drawVoiceWaveIcon,
};
