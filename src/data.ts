import { Transaction, CURRENCY_CONFIGS, CurrencyType } from './types';

// Convert amount from one currency to another
export function convertCurrency(amount: number, from: CurrencyType, to: CurrencyType): number {
  if (from === to) return amount;
  const rateFrom = CURRENCY_CONFIGS[from].rateToUsd;
  const rateTo = CURRENCY_CONFIGS[to].rateToUsd;
  // Convert to USD first, then to target currency
  const amountInUsd = amount / rateFrom;
  return amountInUsd * rateTo;
}

// Generate high quality sample data for June & July 2026
export const INITIAL_TRANSACTIONS: Transaction[] = [];

// Helper to format currency values beautifully
export function formatCurrencyValue(amount: number, currency: CurrencyType): string {
  const symbol = CURRENCY_CONFIGS[currency].symbol;
  if (currency === 'VND') {
    // Format VND with thousands separators, no decimal points
    return `${Math.round(amount).toLocaleString('vi-VN')}${symbol}`;
  } else {
    // Format USD and AED with 2 decimal points
    return `${symbol}${amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })}`;
  }
}
