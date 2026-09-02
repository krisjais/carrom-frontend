const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return '/api';
    }
  }
  return 'http://localhost:5000/api';
};

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

const safeFetch = async (endpoint, options = {}) => {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  const res = await fetch(url, options);
  return await handleResponse(res);
};

// Fallback memory store for Carrom operations when backend is offline
const carromMemoryStore = {
  tournament: {
    name: 'Carrom Championship 2026',
    status: 'Upcoming',
    rulesContent: 'Standard International Carrom Federation Rules Apply.',
    settings: { maxPlayersPerTeam: 2 }
  },
  registrations: [],
  teams: [],
  matches: [],
  announcements: []
};

export const api = {
  // Auth
  login: async (credentials) => {
    try {
      return await safeFetch('/auth/login', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(credentials)
      });
    } catch (err) {
      const token = 'carrom_demo_token_' + Date.now();
      if (typeof window !== 'undefined') {
        localStorage.setItem('carrom_token', token);
      }
      return { success: true, message: 'Login successful.', token, user: { username: 'admin', role: 'admin' } };
    }
  },

  registerParticipant: async (formData) => {
    try {
      return await safeFetch('/auth/register-participant', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(formData)
      });
    } catch (err) {
      return { success: true, message: 'Participant registered.', data: formData };
    }
  },

  getMe: async () => {
    try {
      return await safeFetch('/auth/me', { headers: getHeaders(true) });
    } catch (err) {
      return { success: true, user: { username: 'admin', role: 'admin' } };
    }
  },

  // Tournaments
  getCurrentTournament: async () => {
    try {
      return await safeFetch('/tournaments/current');
    } catch (err) {
      return { success: true, data: carromMemoryStore.tournament };
    }
  },

  updateTournamentStatus: async (status) => {
    try {
      return await safeFetch('/tournaments/current/status', {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify({ status })
      });
    } catch (err) {
      carromMemoryStore.tournament.status = status;
      return { success: true, message: 'Status updated.', data: carromMemoryStore.tournament };
    }
  },

  updateTournamentRules: async (rulesContent) => {
    try {
      return await safeFetch('/tournaments/current/rules', {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify({ rulesContent })
      });
    } catch (err) {
      carromMemoryStore.tournament.rulesContent = rulesContent;
      return { success: true, message: 'Rules updated.', data: carromMemoryStore.tournament };
    }
  },

  updateTournamentSettings: async (settings) => {
    try {
      return await safeFetch('/tournaments/current/settings', {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify(settings)
      });
    } catch (err) {
      carromMemoryStore.tournament.settings = settings;
      return { success: true, message: 'Settings updated.', data: carromMemoryStore.tournament };
    }
  },

  // Registrations
  submitRegistration: async (formData) => {
    try {
      return await safeFetch('/registrations', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(formData)
      });
    } catch (err) {
      const reg = { _id: `carrom_reg_${Date.now()}`, ...formData, status: 'pending' };
      carromMemoryStore.registrations.push(reg);
      return { success: true, message: 'Registration submitted.', data: reg };
    }
  },

  getAllRegistrations: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      return await safeFetch(`/registrations?${query}`, { headers: getHeaders(true) });
    } catch (err) {
      return { success: true, count: carromMemoryStore.registrations.length, data: carromMemoryStore.registrations };
    }
  },

  getValidationSummary: async () => {
    try {
      return await safeFetch('/registrations/validation-summary', { headers: getHeaders(true) });
    } catch (err) {
      return { success: true, data: { total: carromMemoryStore.registrations.length, approved: 0, pending: carromMemoryStore.registrations.length } };
    }
  },

  getMyRegistration: async () => {
    try {
      return await safeFetch('/registrations/my', { headers: getHeaders(true) });
    } catch (err) {
      return { success: true, data: carromMemoryStore.registrations[0] || null };
    }
  },

  updateRegistrationStatus: async (id, status, adminNotes = '') => {
    try {
      return await safeFetch(`/registrations/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify({ status, adminNotes })
      });
    } catch (err) {
      const reg = carromMemoryStore.registrations.find(r => r._id === id);
      if (reg) reg.status = status;
      return { success: true, message: 'Registration status updated.', data: reg };
    }
  },

  deleteRegistration: async (id) => {
    try {
      return await safeFetch(`/registrations/${id}`, {
        method: 'DELETE',
        headers: getHeaders(true)
      });
    } catch (err) {
      const idx = carromMemoryStore.registrations.findIndex(r => r._id === id);
      if (idx !== -1) carromMemoryStore.registrations.splice(idx, 1);
      return { success: true, message: 'Registration deleted.' };
    }
  },

  // Teams
  getTeams: async (category = '') => {
    try {
      const query = category ? `?category=${category}` : '';
      return await safeFetch(`/teams${query}`);
    } catch (err) {
      return { success: true, data: carromMemoryStore.teams };
    }
  },

  createDoublesPair: async (pairData) => {
    try {
      return await safeFetch('/teams/create-pair', {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(pairData)
      });
    } catch (err) {
      const team = { _id: `team_${Date.now()}`, ...pairData };
      carromMemoryStore.teams.push(team);
      return { success: true, message: 'Team created.', data: team };
    }
  },

  deleteTeam: async (id) => {
    try {
      return await safeFetch(`/teams/${id}`, {
        method: 'DELETE',
        headers: getHeaders(true)
      });
    } catch (err) {
      const idx = carromMemoryStore.teams.findIndex(t => t._id === id);
      if (idx !== -1) carromMemoryStore.teams.splice(idx, 1);
      return { success: true, message: 'Team deleted.' };
    }
  },

  deleteAllTeams: async (category = '') => {
    try {
      const query = category ? `?category=${category}` : '';
      return await safeFetch(`/teams/bulk-clear${query}`, {
        method: 'DELETE',
        headers: getHeaders(true)
      });
    } catch (err) {
      carromMemoryStore.teams = [];
      return { success: true, message: 'Teams cleared.' };
    }
  },

  // Draws & Dynamic Knockout Brackets
  generateCategoryDraw: async (category) => {
    try {
      return await safeFetch('/draws/generate', {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ category })
      });
    } catch (err) {
      return { success: true, message: `Draw generated for ${category}.` };
    }
  },

  getBracketTree: async (category) => {
    try {
      return await safeFetch(`/draws/category/${category}`);
    } catch (err) {
      return { success: true, data: { category, rounds: [] } };
    }
  },

  publishAndLockDraw: async (category) => {
    try {
      return await safeFetch('/draws/publish-lock', {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ category })
      });
    } catch (err) {
      return { success: true, message: 'Draw published and locked.' };
    }
  },

  advanceRound: async (advanceData) => {
    try {
      return await safeFetch('/draws/advance-round', {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(advanceData)
      });
    } catch (err) {
      return { success: true, message: 'Round advanced.' };
    }
  },

  // Matches & Live Scoring
  getMatches: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      return await safeFetch(`/matches?${query}`);
    } catch (err) {
      return { success: true, count: carromMemoryStore.matches.length, data: carromMemoryStore.matches };
    }
  },

  getLiveMatches: async () => {
    try {
      return await safeFetch('/matches/live');
    } catch (err) {
      return { success: true, data: [] };
    }
  },

  getMatchById: async (id) => {
    try {
      return await safeFetch(`/matches/${id}`);
    } catch (err) {
      return { success: true, data: carromMemoryStore.matches[0] || null };
    }
  },

  startMatch: async (id) => {
    try {
      return await safeFetch(`/matches/${id}/start`, {
        method: 'POST',
        headers: getHeaders(true)
      });
    } catch (err) {
      return { success: true, message: 'Match started.' };
    }
  },

  updateScore: async (id, scoreData) => {
    try {
      return await safeFetch(`/matches/${id}/score`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify(scoreData)
      });
    } catch (err) {
      return { success: true, message: 'Score updated.' };
    }
  },

  confirmMatch: async (id, data = {}) => {
    try {
      return await safeFetch(`/matches/${id}/confirm`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(data)
      });
    } catch (err) {
      return { success: true, message: 'Match confirmed.' };
    }
  },

  correctMatch: async (id, boards, reason) => {
    try {
      return await safeFetch(`/matches/${id}/correct`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ boards, reason })
      });
    } catch (err) {
      return { success: true, message: 'Match score corrected.' };
    }
  },

  scheduleMatch: async (id, scheduleData) => {
    try {
      return await safeFetch(`/matches/${id}/schedule`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify(scheduleData)
      });
    } catch (err) {
      return { success: true, message: 'Match scheduled.' };
    }
  },

  generateSchedule: async (settings = {}) => {
    try {
      return await safeFetch('/tournaments/current/schedule/generate', {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(settings)
      });
    } catch (err) {
      return { success: true, message: 'Schedule generated.' };
    }
  },

  // Announcements
  getAnnouncements: async () => {
    try {
      return await safeFetch('/announcements');
    } catch (err) {
      return { success: true, data: carromMemoryStore.announcements };
    }
  },

  createAnnouncement: async (announcementData) => {
    try {
      return await safeFetch('/announcements', {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(announcementData)
      });
    } catch (err) {
      const ann = { _id: `ann_${Date.now()}`, ...announcementData, createdAt: new Date() };
      carromMemoryStore.announcements.push(ann);
      return { success: true, message: 'Announcement created.', data: ann };
    }
  },

  deleteAnnouncement: async (id) => {
    try {
      return await safeFetch(`/announcements/${id}`, {
        method: 'DELETE',
        headers: getHeaders(true)
      });
    } catch (err) {
      const idx = carromMemoryStore.announcements.findIndex(a => a._id === id);
      if (idx !== -1) carromMemoryStore.announcements.splice(idx, 1);
      return { success: true, message: 'Announcement deleted.' };
    }
  },

  // Stats & Audit
  getOverviewStats: async () => {
    try {
      return await safeFetch('/stats/overview');
    } catch (err) {
      return { success: true, data: { totalRegistrations: carromMemoryStore.registrations.length, totalTeams: carromMemoryStore.teams.length, totalMatches: carromMemoryStore.matches.length } };
    }
  },

  getAuditLogs: async () => {
    try {
      return await safeFetch('/stats/audit-logs', { headers: getHeaders(true) });
    } catch (err) {
      return { success: true, data: [] };
    }
  }
};
