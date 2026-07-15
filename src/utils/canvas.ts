/**
 * Canvas 辅助函数
 *
 * 提供 Canvas 2D 常用绘制操作
 * 所有尺寸参数均为逻辑像素（使用时需乘以 dpr）
 */

/** 绘制圆角矩形路径 */
function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
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

/** 绘制圆形裁剪区域 */
function drawCircleClip(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
}

/** 绘制文字（自动换行），返回实际绘制行数 */
function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 0
): number {
  const lines: string[] = [];
  let currentLine = '';

  for (const char of text) {
    const testLine = currentLine + char;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  const drawLines = maxLines > 0 ? lines.slice(0, maxLines) : lines;
  // 最后一行截断时加省略号
  if (maxLines > 0 && lines.length > maxLines) {
    const last = drawLines[drawLines.length - 1];
    drawLines[drawLines.length - 1] = `${last.slice(0, -1)}…`;
  }

  for (let i = 0; i < drawLines.length; i++) {
    ctx.fillText(drawLines[i], x, y + i * lineHeight);
  }

  return drawLines.length;
}

/** 绘制头像（圆形裁剪） */
async function drawAvatar(
  ctx: CanvasRenderingContext2D,
  imageSrc: string,
  cx: number,
  cy: number,
  radius: number
): Promise<void> {
  const img = await loadImage(imageSrc);
  ctx.save();
  drawCircleClip(ctx, cx, cy, radius);
  ctx.drawImage(img, cx - radius, cy - radius, radius * 2, radius * 2);
  ctx.restore();
}

/** 加载图片为 Image 对象 */
function loadImage(src: string): Promise<HTMLImageElement> {
  // eslint-disable-next-line promise/avoid-new -- Image.onload/onerror 是事件驱动 API
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

export { drawRoundRect, drawCircleClip, drawWrappedText, drawAvatar, loadImage };
