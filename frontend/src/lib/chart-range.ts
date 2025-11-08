export type ChartRange = "1MIN" | "5MIN" | "1H" | "1D" | "1W" | "ALL";

export const CHART_RANGE_SEQUENCE: ChartRange[] = [
  "1MIN",
  "5MIN",
  "1H",
  "1D",
  "1W",
  "ALL",
];

type RangeConfig = {
  label: string;
  windowMs: number | null;
  bucketMs: number | null;
};

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const CHART_RANGE_CONFIG: Record<ChartRange, RangeConfig> = {
  "1MIN": { label: "1m", windowMs: 1 * MINUTE, bucketMs: 5 * 1000 },
  "5MIN": { label: "5m", windowMs: 5 * MINUTE, bucketMs: 15 * 1000 },
  "1H": { label: "1h", windowMs: 1 * HOUR, bucketMs: 60 * 1000 },
  "1D": { label: "1d", windowMs: 1 * DAY, bucketMs: 5 * MINUTE },
  "1W": { label: "1w", windowMs: 7 * DAY, bucketMs: 30 * MINUTE },
  ALL: { label: "All", windowMs: null, bucketMs: 2 * HOUR },
};

export function getRangeLabel(range: ChartRange) {
  return CHART_RANGE_CONFIG[range].label;
}

export function filterPointsByRange<T extends { timestamp?: number | null }>(
  points: T[],
  range: ChartRange,
): T[] {
  if (!points.length) return points;

  const sorted = points.slice().sort((a, b) => {
    const aTs = a.timestamp ?? 0;
    const bTs = b.timestamp ?? 0;
    return aTs - bTs;
  });

  const { windowMs, bucketMs } = CHART_RANGE_CONFIG[range];

  let filtered = sorted;
  if (windowMs && sorted.length) {
    const latestTs = sorted[sorted.length - 1]?.timestamp ?? Date.now();
    const threshold = latestTs - windowMs;
    filtered = sorted.filter((point) => {
      const ts = point.timestamp ?? latestTs;
      return ts >= threshold;
    });
    if (!filtered.length) {
      filtered = [sorted[sorted.length - 1]];
    }
  }

  if (bucketMs) {
    const bucketed: T[] = [];
    let lastBucketTs = -Infinity;

    filtered.forEach((point) => {
      const ts = point.timestamp ?? 0;
      if (!bucketed.length) {
        bucketed.push(point);
        lastBucketTs = ts;
        return;
      }
      if (ts - lastBucketTs >= bucketMs) {
        bucketed.push(point);
        lastBucketTs = ts;
      } else {
        bucketed[bucketed.length - 1] = point;
      }
    });
    filtered = bucketed;
  }

  return filtered;
}
