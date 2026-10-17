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

/** A checkpoint: initial subscription snapshot only. B must add scheduling and cleanup. */
export function watchFreshness({record, error, now, schedule, cancel, onChange}) {
  onChange(diagnoseFreshness({record, error, now: now()}));
  // TODO(B): schedule a clock update at the freshness boundary, cancel it on unsubscribe.
  return () => {};
}
