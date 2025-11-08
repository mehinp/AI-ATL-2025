import { formatCurrency } from "@/lib/number-format";

interface PriceDisplayProps {
  price: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function PriceDisplay({
  price,
  size = "md",
  className = "",
}: PriceDisplayProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <span className={`font-mono font-bold ${sizeClasses[size]} ${className}`}>
      {formatCurrency(price)}
    </span>
  );
}
