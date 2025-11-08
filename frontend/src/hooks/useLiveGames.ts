import { useQuery } from '@tanstack/react-query';
import { fetchLiveGames } from '@/lib/api';

export function useLiveGames() {
  return useQuery({
    queryKey: ['/api/live-games'],
    queryFn: fetchLiveGames,
    refetchInterval: 5000, // Refetch every 5 seconds for live data
  });
}
