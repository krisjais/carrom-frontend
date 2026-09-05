const getApiBase = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;

  const formatApiBase = (url) => {
    if (!url) return 'https://carrom-backend.onrender.com/api';
    let clean = url.trim().replace(/\/$/, '');
    if (!clean.endsWith('/api')) {
      clean += '/api';
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
        return formatApiBase(envUrl);
      }
      return 'https://carrom-backend.onrender.com/api';
    }
  }
  return envUrl ? formatApiBase(envUrl) : 'https://carrom-backend.onrender.com/api';
};

const API_BASE = getApiBase();

const getHeaders = (requireAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('carrom_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
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
  // Bounded backoff: Attempt 1 -> wait 2s, Attempt 2 -> wait 4s, Attempt 3 -> wait 8s, Attempt 4 -> stop
  const retryDelays = [2000, 4000, 8000];

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url, options);

      // Retry ONLY on transient cold-start / server errors (502, 503, 504)
      if ((res.status === 502 || res.status === 503 || res.status === 504) && attempt < maxAttempts) {
        const delay = retryDelays[attempt - 1] || 8000;
        console.warn(`[API] Server waking up (${res.status}). Retrying in ${delay / 1000}s (Attempt ${attempt}/${maxAttempts})...`);
        await wait(delay);
        continue;
      }

      return res;
    } catch (err) {
      // Retry on network drops / "Failed to fetch" during container cold start
      if (isTransientNetworkError(err) && attempt < maxAttempts) {
        const delay = retryDelays[attempt - 1] || 8000;
        console.warn(`[API] Network connection pending (${err.message}). Retrying in ${delay / 1000}s (Attempt ${attempt}/${maxAttempts})...`);
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

export const api = {
  // Auth
  login: async (credentials) => {
    const res = await fetchWithRetry(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials)
    });
    return handleResponse(res);
  },

  registerParticipant: async (formData) => {
    const res = await fetchWithRetry(`${API_BASE}/auth/register-participant`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(formData)
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetchWithRetry(`${API_BASE}/auth/me`, {
      headers: getHeaders(true)
    });
    return handleResponse(res);
  },

  // Tournaments
  getCurrentTournament: async () => {
    const res = await fetchWithRetry(`${API_BASE}/tournaments/current`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  updateTournamentStatus: async (status) => {
    const res = await fetchWithRetry(`${API_BASE}/tournaments/current/status`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ status })
    });
    return handleResponse(res);
  },

  updateTournamentRules: async (rulesContent) => {
    const res = await fetchWithRetry(`${API_BASE}/tournaments/current/rules`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ rulesContent })
    });
    return handleResponse(res);
  },

  updateTournamentSettings: async (settings) => {
    const res = await fetchWithRetry(`${API_BASE}/tournaments/current/settings`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(settings)
    });
    return handleResponse(res);
  },

  // Registrations
  submitRegistration: async (formData) => {
    const res = await fetchWithRetry(`${API_BASE}/registrations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(formData)
    });
    return handleResponse(res);
  },

  lookupRegistration: async (query) => {
    const res = await fetchWithRetry(`${API_BASE}/registrations/lookup/${encodeURIComponent(query)}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getAllRegistrations: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetchWithRetry(`${API_BASE}/registrations?${query}`, {
      headers: getHeaders(true)
    });
    return handleResponse(res);
  },

  getValidationSummary: async () => {
    const res = await fetchWithRetry(`${API_BASE}/registrations/validation-summary`, {
      headers: getHeaders(true)
    });
    return handleResponse(res);
  },

  getMyRegistration: async () => {
    const res = await fetchWithRetry(`${API_BASE}/registrations/my`, {
      headers: getHeaders(true)
    });
    return handleResponse(res);
  },

  updateRegistrationStatus: async (id, status, adminNotes = '') => {
    const res = await fetchWithRetry(`${API_BASE}/registrations/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ status, adminNotes })
    });
    return handleResponse(res);
  },

  adminEditRegistration: async (id, editData) => {
    const res = await fetchWithRetry(`${API_BASE}/registrations/${id}/admin-edit`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(editData)
    });
    return handleResponse(res);
  },

  deleteRegistration: async (id) => {
    const res = await fetchWithRetry(`${API_BASE}/registrations/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    return handleResponse(res);
  },

  bulkDeleteRegistrations: async (ids = []) => {
    const res = await fetchWithRetry(`${API_BASE}/registrations/bulk-delete`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ ids })
    });
    return handleResponse(res);
  },

  importParticipants: async (data) => {
    const res = await fetchWithRetry(`${API_BASE}/registrations/import`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  adminAddPlayer: async (data) => {
    const res = await fetchWithRetry(`${API_BASE}/registrations/add-player`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Teams
  getTeams: async (category = '') => {
    const query = category ? `?category=${category}` : '';
    const res = await fetchWithRetry(`${API_BASE}/teams${query}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  createDoublesPair: async (pairData) => {
    const res = await fetchWithRetry(`${API_BASE}/teams/create-pair`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(pairData)
    });
    return handleResponse(res);
  },

  deleteTeam: async (id) => {
    const res = await fetchWithRetry(`${API_BASE}/teams/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    return handleResponse(res);
  },

  deleteAllTeams: async (category = '') => {
    const query = category ? `?category=${category}` : '';
    const res = await fetchWithRetry(`${API_BASE}/teams/bulk-clear${query}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    return handleResponse(res);
  },

  autoPopulateTeams: async (category = '') => {
    const res = await fetchWithRetry(`${API_BASE}/teams/auto-populate`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ category })
    });
    return handleResponse(res);
  },

  // Draws & Dynamic Knockout Brackets
  generateCategoryDraw: async (category) => {
    const res = await fetchWithRetry(`${API_BASE}/draws/generate`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ category })
    });
    return handleResponse(res);
  },

  getBracketTree: async (category) => {
    const res = await fetchWithRetry(`${API_BASE}/draws/category/${category}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  publishAndLockDraw: async (category) => {
    const res = await fetchWithRetry(`${API_BASE}/draws/publish-lock`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ category })
    });
    return handleResponse(res);
  },

  advanceRound: async (advanceData) => {
    const res = await fetchWithRetry(`${API_BASE}/draws/advance-round`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(advanceData)
    });
    return handleResponse(res);
  },

  // Matches & Live Scoring
  getMatches: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetchWithRetry(`${API_BASE}/matches?${query}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getLiveMatches: async () => {
    const res = await fetchWithRetry(`${API_BASE}/matches/live`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getMatchById: async (id) => {
    const res = await fetchWithRetry(`${API_BASE}/matches/${id}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  startMatch: async (id) => {
    const res = await fetchWithRetry(`${API_BASE}/matches/${id}/start`, {
      method: 'POST',
      headers: getHeaders(true)
    });
    return handleResponse(res);
  },

  stopLiveMatch: async (id) => {
    const res = await fetchWithRetry(`${API_BASE}/matches/${id}/stop-live`, {
      method: 'POST',
      headers: getHeaders(true)
    });
    return handleResponse(res);
  },

  updateScore: async (id, scoreData) => {
    const res = await fetchWithRetry(`${API_BASE}/matches/${id}/score`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(scoreData)
    });
    return handleResponse(res);
  },

  confirmMatch: async (id, data = {}) => {
    const res = await fetchWithRetry(`${API_BASE}/matches/${id}/confirm`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  correctMatch: async (id, boards, reason) => {
    const res = await fetchWithRetry(`${API_BASE}/matches/${id}/correct`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ boards, reason })
    });
    return handleResponse(res);
  },

  scheduleMatch: async (id, scheduleData) => {
    const res = await fetchWithRetry(`${API_BASE}/matches/${id}/schedule`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(scheduleData)
    });
    return handleResponse(res);
  },

  generateSchedule: async (settings = {}) => {
    const res = await fetchWithRetry(`${API_BASE}/tournaments/current/schedule/generate`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(settings)
    });
    return handleResponse(res);
  },

  // Announcements
  getAnnouncements: async () => {
    const res = await fetchWithRetry(`${API_BASE}/announcements`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  createAnnouncement: async (announcementData) => {
    const res = await fetchWithRetry(`${API_BASE}/announcements`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(announcementData)
    });
    return handleResponse(res);
  },

  deleteAnnouncement: async (id) => {
    const res = await fetchWithRetry(`${API_BASE}/announcements/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    return handleResponse(res);
  },

  // Stats & Audit
  getOverviewStats: async () => {
    const res = await fetchWithRetry(`${API_BASE}/stats/overview`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getAuditLogs: async () => {
    const res = await fetchWithRetry(`${API_BASE}/stats/audit-logs`, {
      headers: getHeaders(true)
    });
    return handleResponse(res);
  }
};
