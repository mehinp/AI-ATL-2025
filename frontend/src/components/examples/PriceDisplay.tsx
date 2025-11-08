import PriceDisplay from '../shared/PriceDisplay';

export default function PriceDisplayExample() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <PriceDisplay price={125.50} size="lg" />
      <PriceDisplay price={89.25} size="md" />
      <PriceDisplay price={42.10} size="sm" />
    </div>
  );
}
