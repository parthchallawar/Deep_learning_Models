export const formatPercent = (val) => {
  if (val === undefined || val === null) return '0.0%';
  // Handle if values are 0-1 or 0-100
  const multiplier = val <= 1.0 ? 100 : 1;
  return `${(val * multiplier).toFixed(1)}%`;
};

export const formatDecimal = (val, dec = 3) => {
  if (val === undefined || val === null) return '0.000';
  return val.toFixed(dec);
};

export const formatParams = (val) => {
  if (val === undefined || val === null) return '0';
  if (val >= 1000000) {
    return `${(val / 1000000).toFixed(2)}M`;
  }
  if (val >= 1000) {
    return `${(val / 1000).toFixed(1)}K`;
  }
  return val.toString();
};
