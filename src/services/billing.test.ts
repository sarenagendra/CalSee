import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCostForSeconds, getPayoutShare } from './billing';

test('calculates billed amounts in paise', () => {
  const cost = calculateCostForSeconds(5, 710);
  assert.equal(cost, 3550);
});

test('women earn at the flat rate', () => {
  const payoutShare = getPayoutShare(100, 60);
  assert.equal(payoutShare, 167);
});
