/**
 * 延迟指定毫秒数
 * @param ms - 延迟毫秒数
 */
function sleep(ms: number): Promise<void> {
  const { promise, resolve } = Promise.withResolvers<void>();
  setTimeout(resolve, ms);
  return promise;
}

export { sleep };
