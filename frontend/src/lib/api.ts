// API client for FastAPI backend
// Update API_URL to point to your FastAPI server
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchTeams() {
  const response = await fetch(`${API_URL}/api/teams`);
  if (!response.ok) throw new Error('Failed to fetch teams');
  return response.json();
}

export async function fetchTeamHistory(teamId: string, timeframe: string = '1D') {
  const response = await fetch(`${API_URL}/api/teams/${teamId}/history?timeframe=${timeframe}`);
  if (!response.ok) throw new Error('Failed to fetch team history');
  return response.json();
}

export async function fetchLiveGames() {
  const response = await fetch(`${API_URL}/api/live-games`);
  if (!response.ok) throw new Error('Failed to fetch live games');
  return response.json();
}

export async function fetchFlashPicks() {
  const response = await fetch(`${API_URL}/api/flash-picks`);
  if (!response.ok) throw new Error('Failed to fetch flash picks');
  return response.json();
}

export async function fetchPortfolio() {
  const response = await fetch(`${API_URL}/api/portfolio`);
  if (!response.ok) throw new Error('Failed to fetch portfolio');
  return response.json();
}

export async function fetchPortfolioStats() {
  const response = await fetch(`${API_URL}/api/portfolio/stats`);
  if (!response.ok) throw new Error('Failed to fetch portfolio stats');
  return response.json();
}

export async function fetchTransactions() {
  const response = await fetch(`${API_URL}/api/transactions`);
  if (!response.ok) throw new Error('Failed to fetch transactions');
  return response.json();
}

export async function executeTrade(trade: {
  teamId: string;
  type: 'buy' | 'sell';
  shares: number;
}) {
  const response = await fetch(`${API_URL}/api/trades`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(trade),
  });
  if (!response.ok) throw new Error('Failed to execute trade');
  return response.json();
}
