const bsIntegerFormatter = new Intl.NumberFormat('es-BO', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const bsDecimalFormatter = new Intl.NumberFormat('es-BO', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatBs(amount: number, withDecimals = false) {
  const safeAmount = Number.isFinite(amount) ? Math.max(0, amount) : 0;
  return withDecimals
    ? `Bs ${bsDecimalFormatter.format(safeAmount)}`
    : `Bs ${bsIntegerFormatter.format(safeAmount)}`;
}

export function roundToCurrencyStep(amount: number, step = 5) {
  return Math.round(amount / step) * step;
}