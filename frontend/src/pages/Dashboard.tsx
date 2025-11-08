import { useMemo } from "react";
import Navbar from "@/components/Navbar";
import PortfolioSummary from "@/components/dashboard/PortfolioSummary";
import TrendingTeams from "@/components/dashboard/TrendingTeams";
import QuickTradeWidget from "@/components/dashboard/QuickTradeWidget";
import PortfolioInsights from "@/components/dashboard/PortfolioInsights";
import { formatCurrency } from "@/lib/number-format";
import { useTeams } from "@/hooks/useTeams";
import { useMarketNavigation } from "@/hooks/useMarketNavigation";
import { Skeleton } from "@/components/ui/skeleton";
import { getTeamAbbreviation } from "@/lib/utils";
import type { TeamMarketInformation } from "@/lib/api";

// TODO: remove mock data
const mockTradeTeams = [
  { id: "1", name: "Kansas City Chiefs", abbreviation: "KC", price: 145.5 },
  { id: "2", name: "San Francisco 49ers", abbreviation: "SF", price: 138.75 },
  { id: "3", name: "Baltimore Ravens", abbreviation: "BAL", price: 132.4 },
  { id: "4", name: "Buffalo Bills", abbreviation: "BUF", price: 125.9 },
  { id: "5", name: "Miami Dolphins", abbreviation: "MIA", price: 118.2 },
];

const insightHighlights = [
  {
    label: "Overall Return",
    value: formatCurrency(1843.32),
    description: "Unrealized P&L this month",
    trend: 12.4,
  },
  {
    label: "Best Performer",
    value: "KC +8.4%",
    description: "1W vs league average",
    trend: 1.8,
  },
  {
    label: "Cash Ready",
    value: formatCurrency(5400),
    description: "Available to deploy",
  },
];

const allocationInsights = [
  { label: "AFC Contenders", percentage: 52 },
  { label: "NFC Contenders", percentage: 35 },
  { label: "High Upside Plays", percentage: 13 },
];

const PRICE_MULTIPLIER = 2.5;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const priceUSD = (value: unknown) => toNumber(value) * PRICE_MULTIPLIER;

type NormalizedTeam = {
  id: string;
  name: string;
  abbreviation: string;
  price: number;
  weekChangePercent?: number | null;
};

const normalizeTeams = (teams: TeamMarketInformation[]): NormalizedTeam[] => {
  const grouped = new Map<
    string,
    Array<TeamMarketInformation & { timestampValue: number }>
  >();

  teams.forEach((team) => {
    const list = grouped.get(team.team_name) ?? [];
    list.push({
      ...team,
      timestampValue: team.timestamp ? new Date(team.timestamp).getTime() : -Infinity,
    });
    grouped.set(team.team_name, list);
  });

  const changeFrom = (
    currentPrice: number,
    reference?: (TeamMarketInformation & { timestampValue: number }) | null,
  ) => {
    if (!reference) return null;
    const refPrice = priceUSD(reference.value ?? reference.price);
    if (!refPrice) return null;
    return ((currentPrice - refPrice) / refPrice) * 100;
  };

  const referenceFor = (
    sorted: Array<TeamMarketInformation & { timestampValue: number }>,
    windowMs: number,
    latestTs: number,
  ) => {
    const threshold = latestTs - windowMs;
    return (
      [...sorted]
        .reverse()
        .find(
          (entry) =>
            entry.timestampValue <= threshold && entry.timestampValue !== -Infinity,
        ) || sorted[0]
    );
  };

  return Array.from(grouped.entries()).map(([name, entries], index) => {
    const sorted = entries.sort((a, b) => a.timestampValue - b.timestampValue);
    const latest = sorted[sorted.length - 1];
    const latestTs = latest?.timestampValue ?? Date.now();
    const weekRef = referenceFor(sorted, WEEK_MS, latestTs);
    const price = priceUSD(latest?.value ?? latest?.price);

    return {
      id: `${name}-${latest?.timestamp ?? index}`,
      name,
      abbreviation: getTeamAbbreviation(name),
      price,
      weekChangePercent: changeFrom(price, weekRef),
    };
  });
};

export default function Dashboard() {
  const { data: teams, isLoading: isTeamsLoading } = useTeams();
  const navigateToMarket = useMarketNavigation();

  const trendingTeams = useMemo(() => {
    if (!teams) return [];
    return normalizeTeams(teams)
      .sort(
        (a, b) =>
          Math.abs(b.weekChangePercent ?? 0) - Math.abs(a.weekChangePercent ?? 0),
      )
      .slice(0, 5)
      .map((team) => ({
        id: team.id,
        name: team.name,
        abbreviation: team.abbreviation,
        price: team.price,
        changePercent: team.weekChangePercent ?? 0,
      }));
  }, [teams]);

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
                totalValue={12543.2}
                dayChange={432.1}
                dayChangePercent={3.56}
                cashBalance={5432.1}
                holdingsCount={8}
              />
            </div>
            <div>
              <QuickTradeWidget teams={mockTradeTeams} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isTeamsLoading ? (
              <Skeleton className="h-[320px] w-full" />
            ) : (
              <TrendingTeams teams={trendingTeams} onTeamSelect={navigateToMarket} />
            )}
            <PortfolioInsights
              highlights={insightHighlights}
              allocations={allocationInsights}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
