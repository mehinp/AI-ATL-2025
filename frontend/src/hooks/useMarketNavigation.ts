import { useLocation } from "wouter";
import { findTeamMetadata } from "@/data/team-metadata";

export function useMarketNavigation() {
  const [, navigate] = useLocation();

  return (teamName: string | null | undefined) => {
    if (!teamName) return;
    const meta = findTeamMetadata(teamName);
    const target = meta?.city ?? teamName;

    const params = new URLSearchParams();
    params.set("team", target);
    navigate(`/market?${params.toString()}`);
  };
}
