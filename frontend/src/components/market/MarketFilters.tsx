import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface MarketFiltersProps {
  onSearchChange?: (value: string) => void;
  onDivisionChange?: (division: string) => void;
}

const divisions = ['All', 'AFC East', 'AFC West', 'AFC North', 'AFC South', 'NFC East', 'NFC West', 'NFC North', 'NFC South'];

export default function MarketFilters({ onSearchChange, onDivisionChange }: MarketFiltersProps) {
  const [search, setSearch] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('All');

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange?.(value);
  };

  const handleDivisionChange = (division: string) => {
    setSelectedDivision(division);
    onDivisionChange?.(division);
  };

  return (
    <div className="space-y-4" data-testid="market-filters">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search teams..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
          data-testid="input-search"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {divisions.map((division) => (
          <Button
            key={division}
            variant={selectedDivision === division ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleDivisionChange(division)}
            data-testid={`button-division-${division.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {division}
          </Button>
        ))}
      </div>
    </div>
  );
}
