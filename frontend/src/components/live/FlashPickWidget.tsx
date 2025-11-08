import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import TeamLogo from '../shared/TeamLogo';
import { Timer, Zap } from 'lucide-react';
import { useState } from 'react';

interface FlashPickWidgetProps {
  game: {
    id: string;
    homeTeam: { name: string; abbreviation: string; odds: number };
    awayTeam: { name: string; abbreviation: string; odds: number };
    timeRemaining: string;
  };
  maxBet: number;
}

export default function FlashPickWidget({ game, maxBet }: FlashPickWidgetProps) {
  const [betAmount, setBetAmount] = useState(maxBet / 2);
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away' | null>(null);

  const potentialWin = selectedTeam
    ? betAmount * (selectedTeam === 'home' ? game.homeTeam.odds : game.awayTeam.odds)
    : 0;

  const handlePlaceBet = () => {
    const team = selectedTeam === 'home' ? game.homeTeam.name : game.awayTeam.name;
    console.log(`Placed ${betAmount} on ${team}`);
  };

  return (
    <Card className="p-6 border-2 border-primary/50" data-testid="flash-pick-widget">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary fill-primary animate-pulse" />
            <h3 className="text-lg font-semibold">Flash Pick</h3>
            <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
          </div>
          <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
            <Timer className="w-4 h-4" />
            {game.timeRemaining}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant={selectedTeam === 'away' ? 'default' : 'outline'}
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => setSelectedTeam('away')}
            data-testid="button-bet-away"
          >
            <TeamLogo teamName={game.awayTeam.name} abbreviation={game.awayTeam.abbreviation} size="sm" />
            <span className="text-sm">{game.awayTeam.name}</span>
            <span className="text-lg font-bold font-mono">{game.awayTeam.odds.toFixed(2)}x</span>
          </Button>

          <Button
            variant={selectedTeam === 'home' ? 'default' : 'outline'}
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => setSelectedTeam('home')}
            data-testid="button-bet-home"
          >
            <TeamLogo teamName={game.homeTeam.name} abbreviation={game.homeTeam.abbreviation} size="sm" />
            <span className="text-sm">{game.homeTeam.name}</span>
            <span className="text-lg font-bold font-mono">{game.homeTeam.odds.toFixed(2)}x</span>
          </Button>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Bet Amount</span>
            <span className="font-mono font-semibold">${betAmount.toFixed(2)}</span>
          </div>
          <Slider
            value={[betAmount]}
            onValueChange={([value]) => setBetAmount(value)}
            max={maxBet}
            min={10}
            step={10}
            data-testid="slider-bet-amount"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>$10</span>
            <span>${maxBet.toFixed(2)}</span>
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Bet Amount:</span>
            <span className="font-mono">${betAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Potential Win:</span>
            <span className="font-mono font-semibold text-success">
              ${potentialWin.toFixed(2)}
            </span>
          </div>
        </div>

        <Button
          className="w-full h-14 text-lg"
          disabled={!selectedTeam}
          onClick={handlePlaceBet}
          data-testid="button-place-flash-bet"
        >
          Place Bet
        </Button>
      </div>
    </Card>
  );
}
