import { useQuery } from '@tanstack/react-query';
import { fetchLiveGames } from '@/lib/api';

export function useLiveGames() {
  return useQuery({
    queryKey: ['live-games'],
    queryFn: fetchLiveGames,
    refetchInterval: 5000,
  });
}
