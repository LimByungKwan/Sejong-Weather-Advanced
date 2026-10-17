/** Pure status diagnosis. No database mutation; the stored value is preserved. */
export function diagnoseFreshness({record, now, error = null}) {
  if (!record) return {state: 'empty', label: error ? '데이터 없음 · 조회 실패' : '데이터 없음', value: null};
  const result = {state: 'stale', label: '오래된 값', value: record.normalized_value};
  if (error) return {...result, label: '오래된 값 · 조회 실패'};
  const fetched = typeof record.fetched_at === 'string' ? Date.parse(record.fetched_at) : NaN;
  const current = typeof now === 'number' ? now : Date.parse(now);
  if (!Number.isFinite(fetched) || !Number.isFinite(current) || fetched > current) {
    return {...result, label: '조회 시각 확인 필요'};
  }
  if (current - fetched < 30 * 60 * 1000) return {...result, state: 'fresh', label: '최신값'};
  return result;
}

const FRESH_MS = 30 * 60 * 1000;

/**
 * Subscribe to freshness. Emits the current diagnosis immediately, then re-emits
 * exactly when a fresh value reaches the 30-minute boundary. Returns an unsubscribe
 * function that cancels any pending timer. Call `poke()` (returned function's
 * `.refresh`) to re-evaluate on demand, e.g. when a hidden tab becomes visible.
 */
export function watchFreshness({record, error, now, schedule, cancel, onChange}) {
  let stopped = false;
  let timerId = null;

  const clear = () => {
    if (timerId !== null) {
      cancel(timerId);
      timerId = null;
    }
  };

  const evaluate = () => {
    if (stopped) return;
    clear();
    const current = now();
    const status = diagnoseFreshness({record, error, now: current});
    onChange(status);
    if (status.state !== 'fresh') return;
    const fetched = Date.parse(record.fetched_at);
    const delay = Math.max(1, fetched + FRESH_MS - current);
    timerId = schedule(() => {
      timerId = null;
      evaluate();
    }, delay);
  };

  evaluate();

  const unsubscribe = () => {
    stopped = true;
    clear();
  };
  unsubscribe.refresh = evaluate;
  return unsubscribe;
}
