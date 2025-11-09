import StatCard from '../shared/StatCard';
import { TrendingUp, DollarSign, Briefcase } from 'lucide-react';

export default function StatCardExample() {
  return (
    <div className="grid grid-cols-3 gap-4 p-6">
      <StatCard icon={DollarSign} label="Total Value" value="$12,543.20" />
      <StatCard icon={TrendingUp} label="Day Change" value="+$432.10" subtitle="+3.56%" />
      <StatCard icon={Briefcase} label="Holdings" value="8" subtitle="Teams" />
    </div>
  );
}
