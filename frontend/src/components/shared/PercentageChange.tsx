import { TrendingUp, TrendingDown } from 'lucide-react';

interface PercentageChangeProps {
  value: number;
  showArrow?: boolean;
  size?: 'sm' | 'md';
}

export default function PercentageChange({ value, showArrow = true, size = 'sm' }: PercentageChangeProps) {
  const isPositive = value >= 0;
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5';
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full font-mono font-semibold ${sizeClasses} ${
        isPositive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
      }`}
      data-testid={`percentage-change-${isPositive ? 'positive' : 'negative'}`}
    >
      {showArrow && (
        isPositive ? (
          <TrendingUp size={iconSize} />
        ) : (
          <TrendingDown size={iconSize} />
        )
      )}
      <span>{isPositive ? '+' : ''}{value.toFixed(2)}%</span>
    </div>
  );
}
