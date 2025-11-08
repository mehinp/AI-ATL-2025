interface TeamLogoProps {
  teamName: string;
  abbreviation: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function TeamLogo({ teamName, abbreviation, size = 'md', className = '' }: TeamLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base'
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center font-bold text-primary-foreground ${className}`}
      title={teamName}
      data-testid={`team-logo-${abbreviation}`}
    >
      {abbreviation}
    </div>
  );
}
