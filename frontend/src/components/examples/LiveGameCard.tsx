import LiveGameCard from '../live/LiveGameCard';

export default function LiveGameCardExample() {
  const mockGame = {
    id: '1',
    homeTeam: { name: 'Kansas City Chiefs', abbreviation: 'KC', score: 24, price: 145.50, changePercent: 2.3 },
    awayTeam: { name: 'Baltimore Ravens', abbreviation: 'BAL', score: 21, price: 132.40, changePercent: -1.2 },
    quarter: 'Q4',
    timeRemaining: '5:23',
    hasFlashPick: true,
  };

  return (
    <div className="p-6">
      <LiveGameCard game={mockGame} onClick={() => console.log('Game clicked')} />
    </div>
  );
}
