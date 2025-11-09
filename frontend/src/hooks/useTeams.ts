import { useQuery } from "@tanstack/react-query";
import { fetchTeams } from "@/lib/api";

export function useTeams() {
  return useQuery({
    queryKey: ["all-teams"],
    queryFn: fetchTeams,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    staleTime: 0,
  });
}
