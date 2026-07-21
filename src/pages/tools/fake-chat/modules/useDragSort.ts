/**
 * useDragSort - 消息列表长按拖拽排序
 *
 * 与 useMessageEditor 配合，通过长按 + 拖拽调整消息顺序
 * 步长由 message-editor.vue 在 onMounted 中动态计算（rpx→px），通过 setItemHeight 注入
 * 长按检测：统一使用 touches[0].clientY 坐标系，避免小程序 longpress 无 touches 的问题
 */
import type { ChatSession } from '../types';

interface UseDragSortReturn {
  /** 正在拖拽的消息索引 */
  dragIndex: Ref<number | null>;
  /** 悬停目标索引（用于指示插入位置） */
  overIndex: Ref<number | null>;
  /** 手指垂直偏移量（px） */
  dragOffsetY: Ref<number>;
  /** 是否正在拖拽中（阻止滚动 / tap） */
  isDragging: Ref<boolean>;
  /** 是否正在等待长按计时（刚 touchstart，还没到 400ms） */
  isPending: Ref<boolean>;
  /** 设置消息项步长（高度 + gap，px），由组件 onMounted 动态注入 */
  setItemHeight: (height: number) => void;
  /** touchstart：启动 400ms 计时，到时进入拖拽态 */
  tryStartDrag: (index: number, clientY: number) => void;
  /** 取消待处理的长按计时（touchmove 判定为滑动 / touchend 时调用） */
  cancelPendingDrag: () => void;
  /** touchmove 更新偏移和悬停目标 */
  updateDrag: (clientY: number) => void;
  /** touchend 执行排序并重置 */
  endDrag: () => void;
  /** 手动重置拖拽状态 */
  resetDrag: () => void;
}

const LONG_PRESS_MS = 400;

function useDragSort(session: Ref<ChatSession>): UseDragSortReturn {
  const dragIndex = ref<number | null>(null);
  const overIndex = ref<number | null>(null);
  const dragOffsetY = ref(0);
  const isDragging = ref(false);
  const isPending = ref(false);
  const startY = ref(0);
  const itemHeight = ref(34); // fallback 默认值（375px 屏幕 80rpx→34px），组件 onMounted 后覆写
  const THRESHOLD = 5;

  let _dragTimer: ReturnType<typeof setTimeout> | null = null;
  let _lastOverIndex: number | null = null; // 缓存上次写入 ref 的 overIndex
  let _lastOffsetWrote = 0; // 上次写入 dragOffsetY 的 offset 值
  let _lastWriteTime = 0; // 上次写 ref 的时间戳（ms）
  const WRITE_INTERVAL = 16; // 最小写入间隔（~60fps）
  const OFFSET_DELTA = 3; // offset 最小变化量才更新 transform

  /** 设置消息项步长（由组件在 onMounted 中动态计算后传入） */
  function setItemHeight(h: number): void {
    if (h > 0) itemHeight.value = h;
  }

  /** 真正开始拖拽（计时器到期后调用） */
  function _startDrag(index: number, clientY: number): void {
    isDragging.value = true;
    isPending.value = false;
    dragIndex.value = index;
    startY.value = clientY;
    dragOffsetY.value = 0;
    overIndex.value = null;
    _lastOverIndex = null;
    _lastOffsetWrote = 0;
    _lastWriteTime = 0;
  }

  /** 启动 400ms 长按计时 */
  function tryStartDrag(index: number, clientY: number): void {
    cancelPendingDrag();
    isPending.value = true;
    _dragTimer = setTimeout(() => {
      _startDrag(index, clientY);
    }, LONG_PRESS_MS);
  }

  /** 取消待处理的长按计时 */
  function cancelPendingDrag(): void {
    if (_dragTimer !== null) {
      clearTimeout(_dragTimer);
      _dragTimer = null;
    }
    isPending.value = false;
  }

  /** 拖拽中更新偏移和悬停目标（含节流） */
  function updateDrag(clientY: number): void {
    if (!isDragging.value || dragIndex.value === null) return;

    const offset = clientY - startY.value;
    if (Math.abs(offset) < THRESHOLD) return;

    const moveCount = Math.round(offset / itemHeight.value);
    const target = dragIndex.value + moveCount;
    const clamped = Math.max(0, Math.min(target, session.value.messages.length - 1));

    // overIndex：仅越过边界时才写 ref（避免无效重渲染）
    if (clamped !== _lastOverIndex) {
      _lastOverIndex = clamped;
      overIndex.value = clamped;
    }

    // dragOffsetY：时间戳节流 + 变化量过滤
    const now = Date.now();
    if (
      now - _lastWriteTime >= WRITE_INTERVAL &&
      Math.abs(offset - _lastOffsetWrote) >= OFFSET_DELTA
    ) {
      _lastWriteTime = now;
      _lastOffsetWrote = offset;
      dragOffsetY.value = offset;
    }
  }

  /** 结束拖拽：先清除样式，nextTick 后再排序数据 */
  function endDrag(): void {
    const _dragIdx = dragIndex.value;
    const _overIdx = overIndex.value;
    const shouldSort =
      isDragging.value && _dragIdx !== null && _overIdx !== null && _overIdx !== _dragIdx;

    // ① 先清除拖拽样式状态，立即生效（避免 transform 残留）
    resetDrag();

    if (!shouldSort) return;

    // ② 数据操作放到 nextTick，等样式清除的渲染先完成
    void nextTick(() => {
      const msgs = [...session.value.messages];
      const [item] = msgs.splice(_dragIdx, 1);
      msgs.splice(_overIdx, 0, item);
      session.value.messages = msgs;
    });
  }

  /** 重置拖拽状态 */
  function resetDrag(): void {
    _lastOverIndex = null;
    _lastOffsetWrote = 0;
    _lastWriteTime = 0;
    dragIndex.value = null;
    overIndex.value = null;
    dragOffsetY.value = 0;
    isDragging.value = false;
    isPending.value = false;
    startY.value = 0;
    cancelPendingDrag();
  }

  return {
    dragIndex,
    overIndex,
    dragOffsetY,
    isDragging,
    isPending,
    tryStartDrag,
    cancelPendingDrag,
    setItemHeight,
    updateDrag,
    endDrag,
    resetDrag,
  };
}

export { useDragSort };
export type { UseDragSortReturn };
