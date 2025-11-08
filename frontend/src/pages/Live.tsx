import { useState } from 'react';
import Navbar from '@/components/Navbar';
import LiveGameCard from '@/components/live/LiveGameCard';
import FlashPickWidget from '@/components/live/FlashPickWidget';

// TODO: remove mock data
const mockGames = [
  {
    id: '1',
    homeTeam: { name: 'Kansas City Chiefs', abbreviation: 'KC', score: 24, price: 145.50, changePercent: 2.3 },
    awayTeam: { name: 'Baltimore Ravens', abbreviation: 'BAL', score: 21, price: 132.40, changePercent: -1.2 },
    quarter: 'Q4',
    timeRemaining: '5:23',
    hasFlashPick: true,
  },
  {
    id: '2',
    homeTeam: { name: 'San Francisco 49ers', abbreviation: 'SF', score: 17, price: 138.75, changePercent: 1.5 },
    awayTeam: { name: 'Buffalo Bills', abbreviation: 'BUF', score: 14, price: 125.90, changePercent: -0.8 },
    quarter: 'Q3',
    timeRemaining: '8:45',
    hasFlashPick: false,
  },
  {
    id: '3',
    homeTeam: { name: 'Miami Dolphins', abbreviation: 'MIA', score: 31, price: 118.20, changePercent: 4.2 },
    awayTeam: { name: 'New England Patriots', abbreviation: 'NE', score: 28, price: 102.50, changePercent: -2.1 },
    quarter: 'Q4',
    timeRemaining: '2:15',
    hasFlashPick: true,
  },
];

const mockFlashPickGame = {
  id: '1',
  homeTeam: { name: 'Kansas City Chiefs', abbreviation: 'KC', odds: 1.85 },
  awayTeam: { name: 'Baltimore Ravens', abbreviation: 'BAL', odds: 2.10 },
  timeRemaining: '5:23',
};

export default function Live() {
  const [selectedGame, setSelectedGame] = useState<string | null>(mockGames[0].id);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Live Data</h1>
            <p className="text-muted-foreground">Real-time game scores and flash picks</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-semibold">Live Games</h2>
              {mockGames.map((game) => (
                <LiveGameCard
                  key={game.id}
                  game={game}
                  onClick={() => setSelectedGame(game.id)}
                />
              ))}
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Flash Picks</h2>
              <FlashPickWidget game={mockFlashPickGame} maxBet={500} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
