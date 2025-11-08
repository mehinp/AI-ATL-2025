import FlashPickWidget from '../live/FlashPickWidget';

export default function FlashPickWidgetExample() {
  const mockGame = {
    id: '1',
    homeTeam: { name: 'Kansas City Chiefs', abbreviation: 'KC', odds: 1.85 },
    awayTeam: { name: 'Baltimore Ravens', abbreviation: 'BAL', odds: 2.10 },
    timeRemaining: '5:23',
  };

  return (
    <div className="p-6">
      <FlashPickWidget game={mockGame} maxBet={500} />
    </div>
  );
}
