import { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import TeamStockCard from '@/components/market/TeamStockCard';
import StockChart from '@/components/market/StockChart';
import TradeModal from '@/components/market/TradeModal';
import MarketFilters from '@/components/market/MarketFilters';
import { useTeams } from '@/hooks/useTeams';
import { getTeamAbbreviation, getTeamDivision } from '@/lib/utils';
import { fetchTeamHistory } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

type NormalizedTeam = {
  id: string;
  name: string;
  abbreviation: string;
  price: number;
  value?: number;
  volume?: number;
  division: string;
  timestamp?: string;
};

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toOptionalNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export default function Market() {
  const { data: teams, isLoading, isError, error } = useTeams();
  const [searchTerm, setSearchTerm] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('All');
  const [selectedTeamName, setSelectedTeamName] = useState<string | null>(null);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);

  const normalizedTeams = useMemo<NormalizedTeam[]>(() => {
    if (!teams) return [];

    const latestByTeam = new Map<string, (typeof teams)[number] & { __index: number }>();

    teams.forEach((team, index) => {
      const existing = latestByTeam.get(team.team_name);
      const currentTimestamp = team.timestamp ? new Date(team.timestamp).getTime() : -Infinity;
      const existingTimestamp = existing?.timestamp
        ? new Date(existing.timestamp).getTime()
        : -Infinity;

      if (!existing || currentTimestamp >= existingTimestamp) {
        latestByTeam.set(team.team_name, { ...team, __index: index });
      }
    });

    return Array.from(latestByTeam.values())
      .map((team, index) => {
        const name = team.team_name;
        return {
          id: `${team.team_name}-${team.timestamp ?? index}`,
          name,
          abbreviation: getTeamAbbreviation(name),
          price: toNumber(team.price),
          value: toOptionalNumber(team.value),
          volume: toOptionalNumber(team.volume),
          division: getTeamDivision(name),
          timestamp: team.timestamp,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [teams]);

  useEffect(() => {
    if (!selectedTeamName && normalizedTeams.length > 0) {
      setSelectedTeamName(normalizedTeams[0].name);
    }
  }, [normalizedTeams, selectedTeamName]);

  const selectedTeam = useMemo(
    () => normalizedTeams.find((team) => team.name === selectedTeamName) ?? null,
    [normalizedTeams, selectedTeamName]
  );

  const filteredTeams = useMemo(() => {
    return normalizedTeams.filter((team) => {
      const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDivision = divisionFilter === 'All' || team.division === divisionFilter;
      return matchesSearch && matchesDivision;
    });
  }, [normalizedTeams, searchTerm, divisionFilter]);

  const topVolumeTeams = useMemo(() => {
    return [...filteredTeams]
      .sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0))
      .slice(0, 3);
  }, [filteredTeams]);

  const topVolumeDisplay: (NormalizedTeam | null)[] = useMemo(
    () => (isLoading ? Array.from({ length: 3 }, () => null) : topVolumeTeams),
    [isLoading, topVolumeTeams],
  );

  const { data: historyData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['team-history', selectedTeam?.name],
    queryFn: () => fetchTeamHistory(selectedTeam!.name),
    enabled: Boolean(selectedTeam?.name),
    staleTime: 15000,
  });

  const chartData = useMemo(() => {
    if (!historyData || historyData.length === 0) {
      if (!selectedTeam) return [];
      return [
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          price: selectedTeam.price,
        },
      ];
    }

    return historyData
      .slice()
      .sort(
        (a, b) =>
          new Date(a.timestamp ?? 0).getTime() - new Date(b.timestamp ?? 0).getTime()
      )
      .map((entry) => {
        const entryDate = entry.timestamp ? new Date(entry.timestamp) : null;
        const label =
          entryDate && !Number.isNaN(entryDate.getTime())
            ? entryDate.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '—';

        return {
          time: label,
          price: toNumber(entry.price),
        };
      });
  }, [historyData, selectedTeam]);

  const handleTradeClick = (team: NormalizedTeam) => {
    setSelectedTeamName(team.name);
    setTradeModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Market</h1>
            <p className="text-muted-foreground">Browse and trade NFL team stocks powered by the FastAPI backend.</p>
          </div>

          <MarketFilters
            onSearchChange={setSearchTerm}
            onDivisionChange={(division) => setDivisionFilter(division)}
          />

          {isError && (
            <Card className="p-4 border-destructive/50 bg-destructive/10 text-destructive">
              Unable to load team data: {(error as Error)?.message ?? 'Unknown error'}
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {selectedTeam ? (
                isHistoryLoading ? (
                  <Skeleton className="h-96 w-full" />
                ) : (
                  <StockChart teamName={selectedTeam.name} data={chartData} />
                )
              ) : (
                <Card className="p-6 h-96 flex items-center justify-center text-muted-foreground">
                  Select a team to view its price history.
                </Card>
              )}
            </div>

            <div className="lg:col-span-1">
              <h2 className="text-xl font-semibold mb-4">Highest Volume</h2>
              <div className="space-y-3">
                {topVolumeDisplay.map((team, index) =>
                  team ? (
                    <div
                      key={team.id}
                      className="p-3 rounded-lg border bg-card hover-elevate cursor-pointer"
                      onClick={() => handleTradeClick(team)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{team.abbreviation}</span>
                        <div className="text-right">
                          <div className="font-mono text-sm">${team.price.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">
                            Volume: {team.volume ? team.volume.toLocaleString() : '—'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Skeleton key={index} className="h-16 w-full rounded-lg" />
                  )
                )}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">All Teams</h2>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Skeleton key={index} className="h-48 w-full rounded-lg" />
                ))}
              </div>
            ) : filteredTeams.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">
                No teams match the current filters.
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredTeams.map((team) => (
                  <TeamStockCard
                    key={team.id}
                    team={team}
                    onTrade={() => handleTradeClick(team)}
                  />
                ))}
              </div>
            )}
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
