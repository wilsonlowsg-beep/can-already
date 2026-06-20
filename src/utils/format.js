export function currency(value) {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function number(value) {
  return new Intl.NumberFormat('en-SG', {
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function percent(value) {
  return `${(Number.isFinite(value) ? value : 0).toFixed(1)}%`;
}
