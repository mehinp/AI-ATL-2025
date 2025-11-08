import { useState } from 'react';
import Navbar from '@/components/Navbar';
import TeamStockCard from '@/components/market/TeamStockCard';
import StockChart from '@/components/market/StockChart';
import TradeModal from '@/components/market/TradeModal';
import MarketFilters from '@/components/market/MarketFilters';

// TODO: remove mock data
const mockTeams = [
  { id: '1', name: 'Kansas City Chiefs', abbreviation: 'KC', price: 145.50, changePercent: 5.23, sparkline: [140, 142, 141, 143, 145, 144, 146, 145] },
  { id: '2', name: 'San Francisco 49ers', abbreviation: 'SF', price: 138.75, changePercent: 4.18, sparkline: [135, 136, 137, 136, 138, 139, 138, 139] },
  { id: '3', name: 'Baltimore Ravens', abbreviation: 'BAL', price: 132.40, changePercent: -2.45, sparkline: [135, 134, 133, 134, 132, 133, 131, 132] },
  { id: '4', name: 'Buffalo Bills', abbreviation: 'BUF', price: 125.90, changePercent: 3.67, sparkline: [122, 123, 124, 125, 126, 125, 126, 126] },
  { id: '5', name: 'Miami Dolphins', abbreviation: 'MIA', price: 118.20, changePercent: -1.23, sparkline: [120, 119, 118, 119, 118, 119, 118, 118] },
  { id: '6', name: 'New England Patriots', abbreviation: 'NE', price: 102.50, changePercent: 2.15, sparkline: [100, 101, 102, 101, 102, 103, 102, 103] },
  { id: '7', name: 'Dallas Cowboys', abbreviation: 'DAL', price: 135.80, changePercent: 1.89, sparkline: [133, 134, 135, 134, 136, 135, 136, 136] },
  { id: '8', name: 'Philadelphia Eagles', abbreviation: 'PHI', price: 142.30, changePercent: 3.42, sparkline: [138, 139, 140, 141, 142, 141, 142, 142] },
];

const mockChartData = [
  { time: '9:00', price: 140 },
  { time: '10:00', price: 142 },
  { time: '11:00', price: 141 },
  { time: '12:00', price: 143 },
  { time: '1:00', price: 145 },
  { time: '2:00', price: 144 },
  { time: '3:00', price: 146 },
  { time: '4:00', price: 145 },
];

export default function Market() {
  const [selectedTeam, setSelectedTeam] = useState<typeof mockTeams[0] | null>(null);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);

  const handleTradeClick = (team: typeof mockTeams[0]) => {
    setSelectedTeam(team);
    setTradeModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Market</h1>
            <p className="text-muted-foreground">Browse and trade NFL team stocks</p>
          </div>

          <MarketFilters
            onSearchChange={(value) => console.log('Search:', value)}
            onDivisionChange={(division) => console.log('Division:', division)}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <StockChart teamName="Kansas City Chiefs" data={mockChartData} />
            </div>

            <div className="lg:col-span-1">
              <h2 className="text-xl font-semibold mb-4">Top Movers</h2>
              <div className="space-y-3">
                {mockTeams.slice(0, 3).map((team) => (
                  <div
                    key={team.id}
                    className="p-3 rounded-lg border bg-card hover-elevate cursor-pointer"
                    onClick={() => handleTradeClick(team)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{team.abbreviation}</span>
                      <div className="text-right">
                        <div className="font-mono text-sm">${team.price.toFixed(2)}</div>
                        <div className={`text-xs ${team.changePercent >= 0 ? 'text-success' : 'text-danger'}`}>
                          {team.changePercent >= 0 ? '+' : ''}{team.changePercent.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">All Teams</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockTeams.map((team) => (
                <TeamStockCard
                  key={team.id}
                  team={team}
                  onTrade={() => handleTradeClick(team)}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      {selectedTeam && (
        <TradeModal
          open={tradeModalOpen}
          onClose={() => setTradeModalOpen(false)}
          team={selectedTeam}
        />
      )}
    </div>
  );
}
