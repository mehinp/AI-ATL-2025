import { Card } from '@/components/ui/card';
import TeamLogo from '../shared/TeamLogo';
import PriceDisplay from '../shared/PriceDisplay';
import PercentageChange from '../shared/PercentageChange';

interface Team {
  id: string;
  name: string;
  abbreviation: string;
  price: number;
  changePercent: number;
}

interface TrendingTeamsProps {
  teams: Team[];
}

export default function TrendingTeams({ teams }: TrendingTeamsProps) {
  return (
    <Card className="p-6" data-testid="trending-teams">
      <h2 className="text-lg font-semibold mb-4">Trending Teams</h2>
      <div className="space-y-3">
        {teams.map((team) => (
          <div
            key={team.id}
            className="flex items-center justify-between hover-elevate p-3 rounded-lg -mx-3 cursor-pointer"
            data-testid={`trending-team-${team.abbreviation}`}
          >
            <div className="flex items-center gap-3">
              <TeamLogo teamName={team.name} abbreviation={team.abbreviation} size="sm" />
              <div className="font-medium">{team.name}</div>
            </div>
            <div className="flex items-center gap-3">
              <PriceDisplay price={team.price} size="sm" />
              <PercentageChange value={team.changePercent} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
