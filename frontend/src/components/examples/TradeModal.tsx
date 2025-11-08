import { useState } from 'react';
import TradeModal from '../market/TradeModal';
import { Button } from '@/components/ui/button';

export default function TradeModalExample() {
  const [open, setOpen] = useState(false);

  const mockTeam = {
    name: 'Kansas City Chiefs',
    abbreviation: 'KC',
    price: 145.50,
    changePercent: 5.23,
  };

  return (
    <div className="p-6">
      <Button onClick={() => setOpen(true)}>Open Trade Modal</Button>
      <TradeModal open={open} onClose={() => setOpen(false)} team={mockTeam} />
    </div>
  );
}
