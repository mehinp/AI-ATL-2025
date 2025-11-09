import TrendingTeams from '../dashboard/TrendingTeams';

export default function TrendingTeamsExample() {
  const mockTeams = [
    { id: '1', name: 'Kansas City Chiefs', abbreviation: 'KC', price: 145.50, changePercent: 5.23 },
    { id: '2', name: 'San Francisco 49ers', abbreviation: 'SF', price: 138.75, changePercent: 4.18 },
    { id: '3', name: 'Baltimore Ravens', abbreviation: 'BAL', price: 132.40, changePercent: -2.45 },
    { id: '4', name: 'Buffalo Bills', abbreviation: 'BUF', price: 125.90, changePercent: 3.67 },
    { id: '5', name: 'Miami Dolphins', abbreviation: 'MIA', price: 118.20, changePercent: -1.23 },
  ];

  return (
    <div className="p-6">
      <TrendingTeams teams={mockTeams} />
    </div>
  );
}
