const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;

  const formatChessApi = (url) => {
    if (!url) return 'https://carrom-backend.onrender.com/api/chess';
    let clean = url.trim().replace(/\/$/, '');
    if (!clean.endsWith('/api') && !clean.includes('/api/')) {
      clean += '/api';
    }
    if (!clean.endsWith('/chess')) {
      clean += '/chess';
    }
    return clean;
  };

  if (typeof window !== 'undefined') {
    const isLocalhost = 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.startsWith('192.168.') ||
      window.location.hostname.startsWith('10.');
      
    // If running in browser on production domain (e.g. Vercel)
    if (!isLocalhost) {
      if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
        return formatChessApi(envUrl);
      }
      return 'https://carrom-backend.onrender.com/api/chess';
    }
  }
  return envUrl ? formatChessApi(envUrl) : 'http://localhost:5000/api/chess';
};

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('chess_admin_token') || 'chess_admin_token_secret_2026';
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } else {
    headers['Authorization'] = 'Bearer chess_admin_token_secret_2026';
  }
  return headers;
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isTransientNetworkError = (error) => {
  if (!error) return false;
  const msg = (error.message || '').toLowerCase();
  const name = (error.name || '').toLowerCase();
  return (
    error instanceof TypeError ||
    name === 'typeerror' ||
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('network request failed') ||
    msg.includes('connection refused') ||
    msg.includes('load failed') ||
    msg.includes('timeout')
  );
};

const fetchWithRetry = async (url, options = {}, maxAttempts = 4) => {
  const retryDelays = [2000, 4000, 8000];

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url, options);

      // Retry ONLY on transient cold-start / server errors (502, 503, 504)
      if ((res.status === 502 || res.status === 503 || res.status === 504) && attempt < maxAttempts) {
        const delay = retryDelays[attempt - 1] || 8000;
        console.warn(`[Chess API] Server waking up (${res.status}). Retrying in ${delay / 1000}s (Attempt ${attempt}/${maxAttempts})...`);
        await wait(delay);
        continue;
      }

      return res;
    } catch (err) {
      // Retry on network drops / "Failed to fetch" during container cold start
      if (isTransientNetworkError(err) && attempt < maxAttempts) {
        const delay = retryDelays[attempt - 1] || 8000;
        console.warn(`[Chess API] Network connection pending (${err.message}). Retrying in ${delay / 1000}s (Attempt ${attempt}/${maxAttempts})...`);
        await wait(delay);
        continue;
      }
      throw err;
    }
  }
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
  const res = await fetchWithRetry(url, options);
  return await handleResponse(res);
};

export const chessApi = {
  // Public Settings
  getSettings: async () => {
    return await safeFetch('/settings');
  },

  // Registration & Players
  registerPlayer: async (formData) => {
    return await safeFetch('/register', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(formData)
    });
  },

  getPlayers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await safeFetch(`/players${query ? `?${query}` : ''}`);
  },

  getPlayerById: async (id) => {
    return await safeFetch(`/players/${id}`);
  },

  // Matches
  getMatches: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await safeFetch(`/matches${query ? `?${query}` : ''}`);
  },

  getMatchById: async (id) => {
    return await safeFetch(`/matches/${id}`);
  },

  // Standings
  getStandings: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await safeFetch(`/standings${query ? `?${query}` : ''}`);
  },

  // Rounds
  getRounds: async () => {
    return await safeFetch('/rounds');
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
    return await safeFetch('/admin/dashboard', { headers: getHeaders() });
  },

  // Admin Player Management
  getAdminPlayers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await safeFetch(`/admin/players${query ? `?${query}` : ''}`, { headers: getHeaders() });
  },

  createPlayer: async (playerData) => {
    return await safeFetch('/admin/players', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(playerData)
    });
  },

  deleteRound: async (round) => {
    return await safeFetch(`/admin/rounds/${round}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
  },

  deleteAllRounds: async () => {
    return await safeFetch('/admin/rounds/all', {
      method: 'DELETE',
      headers: getHeaders()
    });
  },

  updateRegistrationStatus: async (id, status, adminNotes = '') => {
    return await safeFetch(`/admin/players/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status, adminNotes })
    });
  },

  updatePlayer: async (id, playerData) => {
    return await safeFetch(`/admin/players/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(playerData)
    });
  },

  deletePlayer: async (id) => {
    return await safeFetch(`/admin/players/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
  },

  bulkUpdateRegistrationStatus: async (ids, status) => {
    return await safeFetch('/admin/players/bulk-status', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ ids, status })
    });
  },

  bulkDeletePlayers: async (ids) => {
    return await safeFetch('/admin/players/bulk-delete', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ ids })
    });
  },

  importPlayers: async (players, defaultStatus = 'Approved') => {
    return await safeFetch('/admin/players/import', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ players, defaultStatus })
    });
  },

  bulkUpdateStatus: async (ids = [], status = 'Approved') => {
    let updatedCount = 0;
    for (const id of ids) {
      try {
        const res = await chessApi.updateRegistrationStatus(id, status);
        if (res.success) updatedCount++;
      } catch (e) {
        console.error(`Error updating player ${id}:`, e);
      }
    }
    return { success: true, count: updatedCount };
  },

  bulkDeletePlayers: async (ids = []) => {
    let deletedCount = 0;
    for (const id of ids) {
      try {
        const res = await chessApi.deletePlayer(id);
        if (res.success) deletedCount++;
      } catch (e) {
        console.error(`Error deleting player ${id}:`, e);
      }
    }
    return { success: true, count: deletedCount };
  },

  bulkImportPlayers: async (players = [], initialStatus = 'Approved') => {
    // 1. Try the dedicated Admin Bulk Import endpoint
    try {
      const sanitizedPlayers = players.map((p, idx) => {
        const name = (p.fullName || p.name || '').trim();
        const cleanSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const email = (p.email || '').trim() || `${cleanSlug || 'player'}_${Date.now().toString().slice(-6)}_${idx + 1}@chess.edu`;
        return {
          fullName: name,
          email: email,
          phone: (p.phone || p.mobile || '').trim(),
          department: p.department || 'IT Team'
        };
      });

      const res = await safeFetch('/admin/players/import', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          players: sanitizedPlayers,
          defaultStatus: initialStatus
        })
      });

      if (res && res.success) {
        const importedCount = res.data?.importedCount || res.data?.imported?.length || 0;
        const importedList = res.data?.imported || [];

        // If Auto-Approve is requested, ensure their status is updated to Approved
        if (initialStatus === 'Approved' && importedList.length > 0) {
          const ids = importedList.map((item) => item._id).filter(Boolean);
          if (ids.length > 0) {
            try {
              await safeFetch('/admin/players/bulk-status', {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ ids, status: 'Approved' })
              });
            } catch (statusErr) {
              console.warn('[bulkImportPlayers] Bulk approval warning:', statusErr);
            }
          }
        }

        const errors = (res.data?.errors || []).map((e) => `${e.name || 'Row ' + e.row}: ${e.reason}`);
        return {
          success: importedCount > 0,
          count: importedCount,
          errors
        };
      }
    } catch (adminImportErr) {
      console.warn('[bulkImportPlayers] /admin/players/import error, attempting admin fallback:', adminImportErr);
    }

    // 2. Fallback: Admin createPlayer endpoint for each player (which generates emails & sets status)
    let imported = 0;
    const errors = [];
    for (let idx = 0; idx < players.length; idx++) {
      const p = players[idx];
      try {
        const cleanName = (p.fullName || p.name || '').trim();
        if (!cleanName) continue;
        const cleanSlug = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const candidateEmail = (p.email || '').trim() || `${cleanSlug || 'player'}_${Date.now().toString().slice(-6)}_${idx + 1}@chess.edu`;

        const res = await chessApi.createPlayer({
          fullName: cleanName,
          email: candidateEmail,
          phone: (p.phone || '').trim(),
          department: p.department || 'IT Team',
          status: initialStatus
        });

        if (res && (res.success || res.data)) {
          imported++;
        } else {
          errors.push(res?.message || `Failed to add ${cleanName}`);
        }
      } catch (e) {
        errors.push(e.message || `Error importing ${p.fullName || 'player'}`);
      }
    }

    return { success: imported > 0, count: imported, errors };
  },

  // Admin Match Management
  getAdminMatches: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await safeFetch(`/admin/matches${query ? `?${query}` : ''}`, { headers: getHeaders() });
  },

  generateMatches: async (round = 1, roundName = '') => {
    return await safeFetch('/admin/matches/generate', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ round, roundName })
    });
  },

  createMatch: async (matchData) => {
    return await safeFetch('/admin/matches', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(matchData)
    });
  },

  startMatch: async (id) => {
    return await safeFetch(`/admin/matches/${id}/start`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ action: 'start', status: 'live' })
    });
  },

  deleteMatch: async (id) => {
    return await safeFetch(`/admin/matches/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
  },

  bulkDeleteMatches: async (ids = []) => {
    return await safeFetch('/admin/matches/bulk-delete', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ ids })
    });
  },

  updateLiveCaptures: async (id, captureData) => {
    return await safeFetch(`/admin/matches/${id}/live-score`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(captureData)
    });
  },

  submitMatchResult: async (id, resultData) => {
    return await safeFetch(`/admin/matches/${id}/result`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(resultData)
    });
  },

  overrideMatchResult: async (id, overrideData) => {
    return await safeFetch(`/admin/matches/${id}/override`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(overrideData)
    });
  },

  cancelMatch: async (id) => {
    return await safeFetch(`/admin/matches/${id}/cancel`, {
      method: 'POST',
      headers: getHeaders()
    });
  },

  // Settings
  updateSettings: async (settingsData) => {
    return await safeFetch('/admin/settings', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(settingsData)
    });
  },

  refreshStandings: async () => {
    return await safeFetch('/admin/standings/refresh', {
      method: 'POST',
      headers: getHeaders()
    });
  },

  resetTournamentData: async () => {
    return await safeFetch('/admin/reset', {
      method: 'POST',
      headers: getHeaders()
    });
  }
};
