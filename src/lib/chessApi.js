const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '') + '/chess';
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return '/api/chess';
    }
  }
  return 'http://localhost:5000/api/chess';
};

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

const safeFetch = async (endpoint, options = {}) => {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  try {
    const res = await fetch(url, options);
    return await handleResponse(res);
  } catch (err) {
    if (err.name === 'TypeError' || err.message?.includes('Failed to fetch')) {
      throw new Error('Unable to connect to the server. Please check your backend connection or network.');
    }
    throw err;
  }
};

export const chessApi = {
  // Public Tournament Info & Settings
  getSettings: async () => {
    return safeFetch('/settings');
  },

  // Registration & Players
  registerPlayer: async (formData) => {
    return safeFetch('/register', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(formData)
    });
  },

  getPlayers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return safeFetch(`/players?${query}`);
  },

  getPlayerById: async (id) => {
    return safeFetch(`/players/${id}`);
  },

  // Matches
  getMatches: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return safeFetch(`/matches?${query}`);
  },

  getMatchById: async (id) => {
    return safeFetch(`/matches/${id}`);
  },

  // Standings
  getStandings: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return safeFetch(`/standings?${query}`);
  },

  // Rounds
  getRounds: async () => {
    return safeFetch('/rounds');
  },

  // Admin Authentication
  adminLogin: async (credentials) => {
    const data = await safeFetch('/admin/login', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials)
    });
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
    return safeFetch('/admin/dashboard', {
      headers: getHeaders()
    });
  },

  // Admin Player Management
  getAdminPlayers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return safeFetch(`/admin/players?${query}`, {
      headers: getHeaders()
    });
  },

  updateRegistrationStatus: async (id, status, adminNotes = '') => {
    return safeFetch(`/admin/players/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, adminNotes })
    });
  },

  updatePlayer: async (id, playerData) => {
    return safeFetch(`/admin/players/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(playerData)
    });
  },

  deletePlayer: async (id) => {
    return safeFetch(`/admin/players/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
  },

  // Admin Match Management
  getAdminMatches: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return safeFetch(`/admin/matches?${query}`, {
      headers: getHeaders()
    });
  },

  generateMatches: async (round = 1) => {
    return safeFetch('/admin/matches/generate', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ round })
    });
  },

  startMatch: async (id) => {
    return safeFetch(`/admin/matches/${id}/start`, {
      method: 'POST',
      headers: getHeaders()
    });
  },

  submitMatchResult: async (id, resultData) => {
    return safeFetch(`/admin/matches/${id}/result`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(resultData)
    });
  },

  overrideMatchResult: async (id, overrideData) => {
    return safeFetch(`/admin/matches/${id}/override`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(overrideData)
    });
  },

  cancelMatch: async (id) => {
    return safeFetch(`/admin/matches/${id}/cancel`, {
      method: 'POST',
      headers: getHeaders()
    });
  },

  // Admin Settings & Standings Refresh
  updateSettings: async (settingsData) => {
    return safeFetch('/admin/settings', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(settingsData)
    });
  },

  refreshStandings: async () => {
    return safeFetch('/admin/standings/refresh', {
      method: 'POST',
      headers: getHeaders()
    });
  },

  resetTournamentData: async () => {
    return safeFetch('/admin/reset', {
      method: 'POST',
      headers: getHeaders()
    });
  }
};

