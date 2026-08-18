const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials)
    });
    return handleResponse(res);
  },

  registerParticipant: async (formData) => {
    const res = await fetch(`${API_BASE}/auth/register-participant`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(formData)
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(true)
    });
    return handleResponse(res);
  },

  // Tournaments
  getCurrentTournament: async () => {
    const res = await fetch(`${API_BASE}/tournaments/current`);
    return handleResponse(res);
  },

  updateTournamentStatus: async (status) => {
    const res = await fetch(`${API_BASE}/tournaments/current/status`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ status })
    });
    return handleResponse(res);
  },

  updateTournamentRules: async (rulesContent) => {
    const res = await fetch(`${API_BASE}/tournaments/current/rules`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ rulesContent })
    });
    return handleResponse(res);
  },

  updateTournamentSettings: async (settings) => {
    const res = await fetch(`${API_BASE}/tournaments/current/settings`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(settings)
    });
    return handleResponse(res);
  },

  // Registrations
  submitRegistration: async (formData) => {
    const res = await fetch(`${API_BASE}/registrations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(formData)
    });
    return handleResponse(res);
  },

  getAllRegistrations: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/registrations?${query}`, {
      headers: getHeaders(true)
    });
    return handleResponse(res);
  },

  getValidationSummary: async () => {
    const res = await fetch(`${API_BASE}/registrations/validation-summary`, {
      headers: getHeaders(true)
    });
    return handleResponse(res);
  },

  getMyRegistration: async () => {
    const res = await fetch(`${API_BASE}/registrations/my`, {
      headers: getHeaders(true)
    });
    return handleResponse(res);
  },

  updateRegistrationStatus: async (id, status, adminNotes = '') => {
    const res = await fetch(`${API_BASE}/registrations/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ status, adminNotes })
    });
    return handleResponse(res);
  },

  deleteRegistration: async (id) => {
    const res = await fetch(`${API_BASE}/registrations/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    return handleResponse(res);
  },

  // Teams
  getTeams: async (category = '') => {
    const query = category ? `?category=${category}` : '';
    const res = await fetch(`${API_BASE}/teams${query}`);
    return handleResponse(res);
  },

  createDoublesPair: async (pairData) => {
    const res = await fetch(`${API_BASE}/teams/create-pair`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(pairData)
    });
    return handleResponse(res);
  },

  deleteTeam: async (id) => {
    const res = await fetch(`${API_BASE}/teams/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    return handleResponse(res);
  },

  // Draws & Dynamic Knockout Brackets
  generateCategoryDraw: async (category) => {
    const res = await fetch(`${API_BASE}/draws/generate`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ category })
    });
    return handleResponse(res);
  },

  getBracketTree: async (category) => {
    const res = await fetch(`${API_BASE}/draws/category/${category}`);
    return handleResponse(res);
  },

  publishAndLockDraw: async (category) => {
    const res = await fetch(`${API_BASE}/draws/publish-lock`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ category })
    });
    return handleResponse(res);
  },

  advanceRound: async (advanceData) => {
    const res = await fetch(`${API_BASE}/draws/advance-round`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(advanceData)
    });
    return handleResponse(res);
  },

  // Matches & Live Scoring
  getMatches: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/matches?${query}`);
    return handleResponse(res);
  },

  getLiveMatches: async () => {
    const res = await fetch(`${API_BASE}/matches/live`);
    return handleResponse(res);
  },

  getMatchById: async (id) => {
    const res = await fetch(`${API_BASE}/matches/${id}`);
    return handleResponse(res);
  },

  startMatch: async (id) => {
    const res = await fetch(`${API_BASE}/matches/${id}/start`, {
      method: 'POST',
      headers: getHeaders(true)
    });
    return handleResponse(res);
  },

  updateScore: async (id, scoreData) => {
    const res = await fetch(`${API_BASE}/matches/${id}/score`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(scoreData)
    });
    return handleResponse(res);
  },

  confirmMatch: async (id, data = {}) => {
    const res = await fetch(`${API_BASE}/matches/${id}/confirm`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  correctMatch: async (id, boards, reason) => {
    const res = await fetch(`${API_BASE}/matches/${id}/correct`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ boards, reason })
    });
    return handleResponse(res);
  },

  scheduleMatch: async (id, scheduleData) => {
    const res = await fetch(`${API_BASE}/matches/${id}/schedule`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(scheduleData)
    });
    return handleResponse(res);
  },

  generateSchedule: async (settings = {}) => {
    const res = await fetch(`${API_BASE}/tournaments/current/schedule/generate`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(settings)
    });
    return handleResponse(res);
  },

  // Announcements
  getAnnouncements: async () => {
    const res = await fetch(`${API_BASE}/announcements`);
    return handleResponse(res);
  },

  createAnnouncement: async (announcementData) => {
    const res = await fetch(`${API_BASE}/announcements`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(announcementData)
    });
    return handleResponse(res);
  },

  deleteAnnouncement: async (id) => {
    const res = await fetch(`${API_BASE}/announcements/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    return handleResponse(res);
  },

  // Stats & Audit
  getOverviewStats: async () => {
    const res = await fetch(`${API_BASE}/stats/overview`);
    return handleResponse(res);
  },

  getAuditLogs: async () => {
    const res = await fetch(`${API_BASE}/stats/audit-logs`, {
      headers: getHeaders(true)
    });
    return handleResponse(res);
  }
};
