import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { findTeamMetadata } from "@/data/team-metadata";

interface TeamLogoProps {
  teamName: string;
  abbreviation: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses: Record<NonNullable<TeamLogoProps["size"]>, string> = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
};

const textSize: Record<NonNullable<TeamLogoProps["size"]>, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const titleCase = (value: string) =>
  value
    .toLowerCase()
    .split(/\s+/)
    .map((word) => {
      if (!word) return word;
      return word[0].toUpperCase() + word.slice(1);
    })
    .join(" ")
    .replace(/-/g, " ");

export default function TeamLogo({
  teamName,
  abbreviation,
  size = "md",
  className = "",
}: TeamLogoProps) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const sources = useMemo(() => {
    const variants = new Set<string>();
    const addVariant = (value?: string) => {
      if (!value) return;
      const trimmed = value.trim();
      if (!trimmed) return;
      variants.add(trimmed);
      variants.add(slugify(trimmed));
      variants.add(titleCase(trimmed));
    };

    const metadata = findTeamMetadata(teamName);
    if (metadata) {
      addVariant(metadata.nickname);
      addVariant(metadata.city);
      addVariant(`${metadata.city} ${metadata.nickname}`);
      metadata.aliases?.forEach(addVariant);
    }

    addVariant(teamName);
    addVariant(abbreviation);
    addVariant(abbreviation.toLowerCase());
    addVariant(abbreviation.toUpperCase());

    return Array.from(variants)
      .filter(Boolean)
      .map((variant) => `/team_logos/${variant}.svg`);
  }, [teamName, abbreviation]);

  useEffect(() => {
    setSourceIndex(0);
    setHasError(false);
  }, [sources]);

  const currentSrc = sources[sourceIndex];

  if (!hasError && currentSrc) {
    return (
      <div
        className={cn(
          sizeClasses[size],
          "rounded-lg bg-muted flex items-center justify-center overflow-hidden",
          className,
        )}
        title={teamName}
        data-testid={`team-logo-${abbreviation}`}
      >
        <img
          src={currentSrc}
          alt={`${teamName} logo`}
          className="h-full w-full object-contain"
          loading="lazy"
          onError={() => {
            if (sourceIndex < sources.length - 1) {
              setSourceIndex((prev) => prev + 1);
            } else {
              setHasError(true);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        sizeClasses[size],
        textSize[size],
        "rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center font-bold text-primary-foreground",
        className,
      )}
      title={teamName}
      data-testid={`team-logo-${abbreviation}`}
    >
      {abbreviation}
    </div>
  );
}
