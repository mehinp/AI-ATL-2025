import { useQuery } from "@tanstack/react-query";
import {
  authSession,
  fetchPortfolioHistory,
  PortfolioLiveHistoryResponse,
} from "@/lib/api";

export function usePortfolioValueHistory() {
  const token = authSession.getToken();

  return useQuery<PortfolioLiveHistoryResponse>({
    queryKey: ["portfolio-value-history", token],
    queryFn: fetchPortfolioHistory,
    enabled: !!token,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });
}
