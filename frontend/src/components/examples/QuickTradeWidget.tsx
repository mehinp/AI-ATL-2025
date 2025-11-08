import QuickTradeWidget from '../dashboard/QuickTradeWidget';

export default function QuickTradeWidgetExample() {
  const mockTeams = [
    { id: '1', name: 'Kansas City Chiefs', abbreviation: 'KC', price: 145.50 },
    { id: '2', name: 'San Francisco 49ers', abbreviation: 'SF', price: 138.75 },
    { id: '3', name: 'Baltimore Ravens', abbreviation: 'BAL', price: 132.40 },
  ];

  return (
    <div className="p-6">
      <QuickTradeWidget teams={mockTeams} />
    </div>
  );
}
