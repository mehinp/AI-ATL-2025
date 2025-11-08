import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import TeamLogo from '../shared/TeamLogo';
import PercentageChange from '../shared/PercentageChange';
import { Circle } from 'lucide-react';

interface LiveGame {
  id: string;
  homeTeam: { name: string; abbreviation: string; score: number; price: number; changePercent: number };
  awayTeam: { name: string; abbreviation: string; score: number; price: number; changePercent: number };
  quarter: string;
  timeRemaining: string;
  hasFlashPick: boolean;
}

interface LiveGameCardProps {
  game: LiveGame;
  onClick?: () => void;
}

export default function LiveGameCard({ game, onClick }: LiveGameCardProps) {
  return (
    <Card
      className="p-6 cursor-pointer hover-elevate"
      onClick={onClick}
      data-testid={`live-game-${game.id}`}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Circle className="w-3 h-3 text-danger fill-danger animate-pulse" />
            <span className="text-sm font-medium text-muted-foreground">LIVE</span>
          </div>
          <div className="text-sm font-medium">
            {game.quarter} - {game.timeRemaining}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TeamLogo teamName={game.awayTeam.name} abbreviation={game.awayTeam.abbreviation} size="md" />
              <div>
                <div className="font-semibold">{game.awayTeam.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground font-mono">${game.awayTeam.price.toFixed(2)}</span>
                  <PercentageChange value={game.awayTeam.changePercent} />
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold font-mono">{game.awayTeam.score}</div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TeamLogo teamName={game.homeTeam.name} abbreviation={game.homeTeam.abbreviation} size="md" />
              <div>
                <div className="font-semibold">{game.homeTeam.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground font-mono">${game.homeTeam.price.toFixed(2)}</span>
                  <PercentageChange value={game.homeTeam.changePercent} />
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold font-mono">{game.homeTeam.score}</div>
          </div>
        </div>

        {game.hasFlashPick && (
          <Badge className="w-full justify-center bg-primary/10 text-primary hover:bg-primary/20 animate-pulse" data-testid="badge-flash-pick">
            ⚡ Flash Pick Available
          </Badge>
        )}
      </div>
    </Card>
  );
}
