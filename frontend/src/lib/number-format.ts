const DEFAULT_LOCALE = "en-US";
const PLACEHOLDER = "\u2014";

const baseCurrencyOptions: Intl.NumberFormatOptions = {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

export const formatNumber = (
  value: number | null | undefined,
  options: Intl.NumberFormatOptions = {},
) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return PLACEHOLDER;
  }

  return new Intl.NumberFormat(DEFAULT_LOCALE, options).format(value);
};

export const formatCurrency = (
  value: number | null | undefined,
  options: Intl.NumberFormatOptions = {},
) => {
  return formatNumber(value, { ...baseCurrencyOptions, ...options });
};

export const formatPercent = (
  value: number | null | undefined,
  options: Intl.NumberFormatOptions = {},
) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return PLACEHOLDER;
  }

  const formatter = new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  });

  return formatter.format(value / 100);
};

export const formatRange = (
  low: number | null | undefined,
  high: number | null | undefined,
  formatter: (value: number | null | undefined) => string = (val) =>
    formatNumber(val, { maximumFractionDigits: 2 }),
) => {
  if (
    low === null ||
    low === undefined ||
    Number.isNaN(low) ||
    high === null ||
    high === undefined ||
    Number.isNaN(high)
  ) {
    return PLACEHOLDER;
  }

  return `${formatter(low)} - ${formatter(high)}`;
};
