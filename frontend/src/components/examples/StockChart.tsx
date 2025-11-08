import StockChart from '../market/StockChart';

export default function StockChartExample() {
  const mockData = [
    { time: '9:00', price: 140 },
    { time: '10:00', price: 142 },
    { time: '11:00', price: 141 },
    { time: '12:00', price: 143 },
    { time: '1:00', price: 145 },
    { time: '2:00', price: 144 },
    { time: '3:00', price: 146 },
    { time: '4:00', price: 145 },
  ];

  return (
    <div className="p-6">
      <StockChart teamName="Kansas City Chiefs" data={mockData} />
    </div>
  );
}
