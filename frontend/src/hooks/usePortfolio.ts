import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchPortfolio, fetchPortfolioStats, fetchTransactions, executeTrade } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';

export function usePortfolio() {
  return useQuery({
    queryKey: ['/api/portfolio'],
    queryFn: fetchPortfolio,
  });
}

export function usePortfolioStats() {
  return useQuery({
    queryKey: ['/api/portfolio/stats'],
    queryFn: fetchPortfolioStats,
  });
}

export function useTransactions() {
  return useQuery({
    queryKey: ['/api/transactions'],
    queryFn: fetchTransactions,
  });
}

export function useTrade() {
  return useMutation({
    mutationFn: executeTrade,
    onSuccess: () => {
      // Invalidate and refetch portfolio data after successful trade
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
    },
  });
}
