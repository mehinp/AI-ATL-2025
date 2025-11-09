import PercentageChange from '../shared/PercentageChange';

export default function PercentageChangeExample() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <PercentageChange value={5.23} />
      <PercentageChange value={-2.45} />
      <PercentageChange value={12.8} size="md" />
      <PercentageChange value={-0.15} size="md" />
    </div>
  );
}
