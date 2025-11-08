import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import TeamLogo from '../shared/TeamLogo';
import PriceDisplay from '../shared/PriceDisplay';
import PercentageChange from '../shared/PercentageChange';

interface TradeModalProps {
  open: boolean;
  onClose: () => void;
  team: {
    name: string;
    abbreviation: string;
    price: number;
    changePercent?: number | null;
  };
}

export default function TradeModal({ open, onClose, team }: TradeModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');

  const total = team.price * quantity;

  const handleTrade = () => {
    console.log(`${tradeType} ${quantity} shares of ${team.name}`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="trade-modal">
        <DialogHeader>
          <DialogTitle>Trade {team.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
            <TeamLogo teamName={team.name} abbreviation={team.abbreviation} size="md" />
            <div className="flex-1">
              <div className="font-semibold">{team.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <PriceDisplay price={team.price} size="sm" />
                {typeof team.changePercent === 'number' && (
                  <PercentageChange value={team.changePercent} />
                )}
              </div>
            </div>
          </div>

          <Tabs value={tradeType} onValueChange={(v) => setTradeType(v as 'buy' | 'sell')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="buy" data-testid="tab-buy">Buy</TabsTrigger>
              <TabsTrigger value="sell" data-testid="tab-sell">Sell</TabsTrigger>
            </TabsList>

            <TabsContent value="buy" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="buy-quantity">Shares</Label>
                <Input
                  id="buy-quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="font-mono"
                  data-testid="input-buy-quantity"
                />
              </div>

              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price per share:</span>
                  <span className="font-mono">${team.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-mono">{quantity}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t border-border">
                  <span>Total Cost:</span>
                  <span className="font-mono">${total.toFixed(2)}</span>
                </div>
              </div>

              <Button className="w-full" onClick={handleTrade} data-testid="button-confirm-buy">
                Buy {quantity} {quantity === 1 ? 'Share' : 'Shares'}
              </Button>
            </TabsContent>

            <TabsContent value="sell" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="sell-quantity">Shares</Label>
                <Input
                  id="sell-quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="font-mono"
                  data-testid="input-sell-quantity"
                />
              </div>

              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price per share:</span>
                  <span className="font-mono">${team.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-mono">{quantity}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t border-border">
                  <span>Total Value:</span>
                  <span className="font-mono">${total.toFixed(2)}</span>
                </div>
              </div>

              <Button className="w-full" onClick={handleTrade} data-testid="button-confirm-sell">
                Sell {quantity} {quantity === 1 ? 'Share' : 'Shares'}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
