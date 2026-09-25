export function calculateCostForSeconds(seconds: number, paisePerSecond: number): number {
  return Math.max(0, seconds * paisePerSecond);
}

export function getPayoutShare(totalPaisa: number, totalSeconds: number): number {
  if (totalSeconds <= 0) return 0;
  return Math.round((totalPaisa / totalSeconds) * 100);
}
