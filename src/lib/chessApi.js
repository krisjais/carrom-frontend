const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api') + '/chess';

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('chess_admin_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
};

export const chessApi = {
  // Public Tournament Info & Settings
  getSettings: async () => {
    const res = await fetch(`${API_BASE}/settings`);
    return handleResponse(res);
  },

  // Registration & Players
  registerPlayer: async (formData) => {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(formData)
    });
    return handleResponse(res);
  },

  getPlayers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/players?${query}`);
    return handleResponse(res);
  },

  getPlayerById: async (id) => {
    const res = await fetch(`${API_BASE}/players/${id}`);
    return handleResponse(res);
  },

  // Matches
  getMatches: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/matches?${query}`);
    return handleResponse(res);
  },

  getMatchById: async (id) => {
    const res = await fetch(`${API_BASE}/matches/${id}`);
    return handleResponse(res);
  },

  // Standings
  getStandings: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/standings?${query}`);
    return handleResponse(res);
  },

  // Rounds
  getRounds: async () => {
    const res = await fetch(`${API_BASE}/rounds`);
    return handleResponse(res);
  },

  // Admin Authentication
  adminLogin: async (credentials) => {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials)
    });
    const data = await handleResponse(res);
    if (data.token && typeof window !== 'undefined') {
      localStorage.setItem('chess_admin_token', data.token);
    }
    return data;
  },

  logoutAdmin: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chess_admin_token');
    }
  },

  isAdminAuthenticated: () => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('chess_admin_token');
    }
    return false;
  },

  // Admin Dashboard Stats
  getDashboardStats: async () => {
    const res = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Admin Player Management
  getAdminPlayers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/players?${query}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  updateRegistrationStatus: async (id, status, adminNotes = '') => {
    const res = await fetch(`${API_BASE}/admin/players/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, adminNotes })
    });
    return handleResponse(res);
  },

  updatePlayer: async (id, playerData) => {
    const res = await fetch(`${API_BASE}/admin/players/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(playerData)
    });
    return handleResponse(res);
  },

  deletePlayer: async (id) => {
    const res = await fetch(`${API_BASE}/admin/players/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Admin Match Management
  getAdminMatches: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/matches?${query}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  generateMatches: async (round = 1) => {
    const res = await fetch(`${API_BASE}/admin/matches/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ round })
    });
    return handleResponse(res);
  },

  startMatch: async (id) => {
    const res = await fetch(`${API_BASE}/admin/matches/${id}/start`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  submitMatchResult: async (id, resultData) => {
    const res = await fetch(`${API_BASE}/admin/matches/${id}/result`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(resultData)
    });
    return handleResponse(res);
  },

  overrideMatchResult: async (id, overrideData) => {
    const res = await fetch(`${API_BASE}/admin/matches/${id}/override`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(overrideData)
    });
    return handleResponse(res);
  },

  cancelMatch: async (id) => {
    const res = await fetch(`${API_BASE}/admin/matches/${id}/cancel`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Admin Settings & Standings Refresh
  updateSettings: async (settingsData) => {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(settingsData)
    });
    return handleResponse(res);
  },

  refreshStandings: async () => {
    const res = await fetch(`${API_BASE}/admin/standings/refresh`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  resetTournamentData: async () => {
    const res = await fetch(`${API_BASE}/admin/reset`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(res);
  }
};
