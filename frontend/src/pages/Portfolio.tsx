import Navbar from '@/components/Navbar';
import StockHoldingCard from '@/components/portfolio/StockHoldingCard';
import PerformanceChart from '@/components/portfolio/PerformanceChart';
import TransactionHistory from '@/components/portfolio/TransactionHistory';
import PortfolioStats from '@/components/portfolio/PortfolioStats';

// TODO: remove mock data
const mockHoldings = [
  { team: { name: 'Kansas City Chiefs', abbreviation: 'KC' }, shares: 10, avgCost: 135.20, currentPrice: 145.50 },
  { team: { name: 'San Francisco 49ers', abbreviation: 'SF' }, shares: 8, avgCost: 130.00, currentPrice: 138.75 },
  { team: { name: 'Buffalo Bills', abbreviation: 'BUF' }, shares: 12, avgCost: 120.50, currentPrice: 125.90 },
  { team: { name: 'Miami Dolphins', abbreviation: 'MIA' }, shares: 5, avgCost: 125.00, currentPrice: 118.20 },
];

const mockPerformanceData = [
  { date: 'Mon', value: 10000 },
  { date: 'Tue', value: 10500 },
  { date: 'Wed', value: 10200 },
  { date: 'Thu', value: 11000 },
  { date: 'Fri', value: 11500 },
  { date: 'Sat', value: 12000 },
  { date: 'Sun', value: 12543 },
];

const mockTransactions = [
  {
    id: '1',
    date: '2025-11-08',
    type: 'buy' as const,
    team: { name: 'Kansas City Chiefs', abbreviation: 'KC' },
    shares: 5,
    price: 145.50,
  },
  {
    id: '2',
    date: '2025-11-07',
    type: 'sell' as const,
    team: { name: 'New England Patriots', abbreviation: 'NE' },
    shares: 3,
    price: 102.50,
  },
  {
    id: '3',
    date: '2025-11-06',
    type: 'buy' as const,
    team: { name: 'Baltimore Ravens', abbreviation: 'BAL' },
    shares: 8,
    price: 132.40,
  },
];

export default function Portfolio() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Portfolio</h1>
            <p className="text-muted-foreground">Manage your team holdings and track performance</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <PerformanceChart data={mockPerformanceData} />
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Your Holdings</h2>
                <div className="grid grid-cols-1 gap-4">
                  {mockHoldings.map((holding, index) => (
                    <StockHoldingCard
                      key={index}
                      {...holding}
                      onSell={() => console.log(`Sell ${holding.team.name}`)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <PortfolioStats
                totalValue={12543.20}
                totalCost={11200.50}
                dayChange={432.10}
                dayChangePercent={3.56}
              />
              
              <TransactionHistory transactions={mockTransactions} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
