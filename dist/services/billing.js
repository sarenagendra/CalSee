"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCostForSeconds = calculateCostForSeconds;
exports.getPayoutShare = getPayoutShare;
function calculateCostForSeconds(seconds, paisePerSecond) {
    return Math.max(0, seconds * paisePerSecond);
}
function getPayoutShare(totalPaisa, totalSeconds) {
    if (totalSeconds <= 0)
        return 0;
    return Math.round((totalPaisa / totalSeconds) * 100);
}
