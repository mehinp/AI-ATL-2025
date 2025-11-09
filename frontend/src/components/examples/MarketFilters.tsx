import MarketFilters from '../market/MarketFilters';

export default function MarketFiltersExample() {
  return (
    <div className="p-6">
      <MarketFilters
        onSearchChange={(value) => console.log('Search:', value)}
        onDivisionChange={(division) => console.log('Division:', division)}
      />
    </div>
  );
}
