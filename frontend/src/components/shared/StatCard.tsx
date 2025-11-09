import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { usePriceFlash } from "@/hooks/usePriceFlash";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  className?: string;
  flashValue?: number | string;
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  className = "",
  flashValue,
}: StatCardProps) {
  const flashClass = flashValue === undefined ? "" : usePriceFlash(flashValue);
  return (
    <Card
      className={`p-4 ${className}`}
      data-testid={`stat-card-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="flex flex-col items-center text-center gap-2">
        <Icon className="w-5 h-5 text-muted-foreground" />
        <div className="text-xs text-muted-foreground font-medium">{label}</div>
        <div className={`text-xl font-bold ${flashClass}`}>{value}</div>
        {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
      </div>
    </Card>
  );
}
