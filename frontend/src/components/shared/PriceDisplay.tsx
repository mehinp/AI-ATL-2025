import { formatCurrency } from "@/lib/number-format";
import { usePriceFlash } from "@/hooks/usePriceFlash";

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

  const flashClass = usePriceFlash(price);

  return (
    <span className={`font-mono font-bold ${sizeClasses[size]} ${flashClass} ${className}`}>
      {formatCurrency(price)}
    </span>
  );
}
