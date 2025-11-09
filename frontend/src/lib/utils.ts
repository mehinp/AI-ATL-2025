import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { findTeamMetadata } from "@/data/team-metadata";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTeamAbbreviation(teamName: string): string {
  const meta = findTeamMetadata(teamName);
  if (meta) return meta.abbreviation;

  const fallback = teamName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 3);

  return fallback || teamName.slice(0, 3).toUpperCase() || "NFL";
}

export function getTeamDivision(teamName: string): string {
  return findTeamMetadata(teamName)?.division ?? "Unknown";
}
