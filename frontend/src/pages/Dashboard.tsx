import Navbar from '@/components/Navbar';
import PortfolioSummary from '@/components/dashboard/PortfolioSummary';
import TrendingTeams from '@/components/dashboard/TrendingTeams';
import QuickTradeWidget from '@/components/dashboard/QuickTradeWidget';

// TODO: remove mock data
const mockTrendingTeams = [
  { id: '1', name: 'Kansas City Chiefs', abbreviation: 'KC', price: 145.50, changePercent: 5.23 },
  { id: '2', name: 'San Francisco 49ers', abbreviation: 'SF', price: 138.75, changePercent: 4.18 },
  { id: '3', name: 'Baltimore Ravens', abbreviation: 'BAL', price: 132.40, changePercent: -2.45 },
  { id: '4', name: 'Buffalo Bills', abbreviation: 'BUF', price: 125.90, changePercent: 3.67 },
  { id: '5', name: 'Miami Dolphins', abbreviation: 'MIA', price: 118.20, changePercent: -1.23 },
];

const mockTradeTeams = [
  { id: '1', name: 'Kansas City Chiefs', abbreviation: 'KC', price: 145.50 },
  { id: '2', name: 'San Francisco 49ers', abbreviation: 'SF', price: 138.75 },
  { id: '3', name: 'Baltimore Ravens', abbreviation: 'BAL', price: 132.40 },
  { id: '4', name: 'Buffalo Bills', abbreviation: 'BUF', price: 125.90 },
  { id: '5', name: 'Miami Dolphins', abbreviation: 'MIA', price: 118.20 },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Your portfolio at a glance</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PortfolioSummary
                totalValue={12543.20}
                dayChange={432.10}
                dayChangePercent={3.56}
                cashBalance={5432.10}
                holdingsCount={8}
              />
            </div>
            <div>
              <QuickTradeWidget teams={mockTradeTeams} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrendingTeams teams={mockTrendingTeams} />
            <TrendingTeams teams={mockTrendingTeams.slice().reverse()} />
          </div>
        </div>
      </main>
    </div>
  );
}
