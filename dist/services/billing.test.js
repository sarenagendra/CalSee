"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const billing_1 = require("./billing");
(0, node_test_1.default)('calculates billed amounts in paise', () => {
    const cost = (0, billing_1.calculateCostForSeconds)(5, 710);
    strict_1.default.equal(cost, 3550);
});
(0, node_test_1.default)('women earn at the flat rate', () => {
    const payoutShare = (0, billing_1.getPayoutShare)(100, 60);
    strict_1.default.equal(payoutShare, 167);
});
