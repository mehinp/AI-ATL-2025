import StockHoldingCard from '../portfolio/StockHoldingCard';

export default function StockHoldingCardExample() {
  return (
    <div className="p-6">
      <StockHoldingCard
        team={{ name: 'Kansas City Chiefs', abbreviation: 'KC' }}
        shares={10}
        avgCost={135.20}
        currentPrice={145.50}
        onSell={() => console.log('Sell clicked')}
      />
    </div>
  );
}
