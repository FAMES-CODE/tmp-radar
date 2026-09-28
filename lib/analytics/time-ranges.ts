export const analyticsRanges = ["24h", "7d"] as const
export type AnalyticsRange = (typeof analyticsRanges)[number]

const rangeHours: Record<AnalyticsRange, number> = { "24h": 24, "7d": 24 * 7 }

export function isAnalyticsRange(
  value: string | null
): value is AnalyticsRange {
  return !!value && analyticsRanges.includes(value as AnalyticsRange)
}

export function getRangeWindow(range: AnalyticsRange, end = new Date()) {
  return {
    start: new Date(end.getTime() - rangeHours[range] * 60 * 60 * 1000),
    end,
  }
}

export function getBucketMinutes(range: AnalyticsRange) {
  return range === "24h" ? 5 : 30
}
