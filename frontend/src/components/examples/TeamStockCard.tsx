import TeamStockCard from '../market/TeamStockCard';

export default function TeamStockCardExample() {
  const mockTeam = {
    id: '1',
    name: 'Kansas City Chiefs',
    abbreviation: 'KC',
    price: 145.50,
    changePercent: 5.23,
    sparkline: [140, 142, 141, 143, 145, 144, 146, 145],
  };

  return (
    <div className="p-6">
      <TeamStockCard team={mockTeam} onTrade={() => console.log('Trade clicked')} />
    </div>
  );
}
