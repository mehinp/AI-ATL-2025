import PerformanceChart from '../portfolio/PerformanceChart';

export default function PerformanceChartExample() {
  const mockData = [
    { date: 'Mon', value: 10000 },
    { date: 'Tue', value: 10500 },
    { date: 'Wed', value: 10200 },
    { date: 'Thu', value: 11000 },
    { date: 'Fri', value: 11500 },
    { date: 'Sat', value: 12000 },
    { date: 'Sun', value: 12543 },
  ];

  return (
    <div className="p-6">
      <PerformanceChart data={mockData} />
    </div>
  );
}
