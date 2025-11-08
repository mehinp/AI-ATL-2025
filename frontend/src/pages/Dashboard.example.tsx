import Navbar from '@/components/Navbar';
import PortfolioSummary from '@/components/dashboard/PortfolioSummary';
import TrendingTeams from '@/components/dashboard/TrendingTeams';
import QuickTradeWidget from '@/components/dashboard/QuickTradeWidget';
import { useTeams } from '@/hooks/useTeams';
import { usePortfolioStats } from '@/hooks/usePortfolio';

// Example of using real API data instead of mock data
export default function DashboardWithAPI() {
  const { data: teamsData, isLoading: teamsLoading } = useTeams();
  const { data: statsData, isLoading: statsLoading } = usePortfolioStats();

  if (teamsLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center py-12">Loading...</div>
        </main>
      </div>
    );
  }

  const teams = teamsData?.teams || [];
  const stats = statsData || {
    totalValue: 0,
    dayChange: 0,
    dayChangePercent: 0,
    cashBalance: 0,
    holdingsCount: 0,
  };

  // Sort teams by changePercent for trending
  const trendingTeams = [...teams]
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 5);

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
                totalValue={stats.totalValue}
                dayChange={stats.dayChange}
                dayChangePercent={stats.dayChangePercent}
                cashBalance={stats.cashBalance}
                holdingsCount={stats.holdingsCount}
              />
            </div>
            <div>
              <QuickTradeWidget teams={teams} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrendingTeams teams={trendingTeams} />
            <TrendingTeams teams={trendingTeams.slice().reverse()} />
          </div>
        </div>
      </main>
    </div>
  );
}
