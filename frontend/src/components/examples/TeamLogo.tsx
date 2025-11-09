import TeamLogo from '../shared/TeamLogo';

export default function TeamLogoExample() {
  return (
    <div className="flex items-center gap-4 p-6">
      <TeamLogo teamName="Kansas City Chiefs" abbreviation="KC" size="sm" />
      <TeamLogo teamName="San Francisco 49ers" abbreviation="SF" size="md" />
      <TeamLogo teamName="Baltimore Ravens" abbreviation="BAL" size="lg" />
    </div>
  );
}
