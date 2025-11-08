import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  className?: string;
}

export default function StatCard({ icon: Icon, label, value, subtitle, className = '' }: StatCardProps) {
  return (
    <Card className={`p-4 ${className}`} data-testid={`stat-card-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex flex-col items-center text-center gap-2">
        <Icon className="w-5 h-5 text-muted-foreground" />
        <div className="text-xs text-muted-foreground font-medium">{label}</div>
        <div className="text-xl font-bold">{value}</div>
        {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
      </div>
    </Card>
  );
}
