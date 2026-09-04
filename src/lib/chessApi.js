// Client-side Memory Store for smooth operation when backend is offline/unreachable on Vercel
const clientMemoryStore = {
  players: [
    { _id: 'p1', playerId: 'CHS-001', fullName: 'Grandmaster Alex', email: 'alex@chess.edu', department: 'IT Team', status: 'Approved', matchesPlayed: 5, wins: 4, draws: 1, losses: 0, materialPoints: 28, tournamentPoints: 13, rank: 1 },
    { _id: 'p2', playerId: 'CHS-002', fullName: 'Master Sarah', email: 'sarah@chess.edu', department: 'First Year', status: 'Approved', matchesPlayed: 5, wins: 4, draws: 0, losses: 1, materialPoints: 24, tournamentPoints: 12, rank: 2 },
    { _id: 'p3', playerId: 'CHS-003', fullName: 'Vikram Singh', email: 'vikram@chess.edu', department: 'Second Year', status: 'Approved', matchesPlayed: 5, wins: 3, draws: 1, losses: 1, materialPoints: 19, tournamentPoints: 10, rank: 3 },
    { _id: 'p4', playerId: 'CHS-004', fullName: 'Ananya Sharma', email: 'ananya@chess.edu', department: 'MJ Team', status: 'Approved', matchesPlayed: 5, wins: 2, draws: 2, losses: 1, materialPoints: 15, tournamentPoints: 8, rank: 4 }
  ],
  matches: [
    { _id: 'm1', matchId: 'CHS-M001', round: 1, player1: { _id: 'p1', fullName: 'Grandmaster Alex', playerId: 'CHS-001' }, player2: { _id: 'p2', fullName: 'Master Sarah', playerId: 'CHS-002' }, status: 'completed', player1MaterialScore: 6, player2MaterialScore: 4, winner: 'player1' },
    { _id: 'm2', matchId: 'CHS-M002', round: 1, player1: { _id: 'p3', fullName: 'Vikram Singh', playerId: 'CHS-003' }, player2: { _id: 'p4', fullName: 'Ananya Sharma', playerId: 'CHS-004' }, status: 'completed', player1MaterialScore: 5, player2MaterialScore: 3, winner: 'player1' }
  ],
  settings: {
    tournamentName: 'Chess Championship 2026',
    matchDuration: 10,
    currentRound: 1,
    registrationOpen: true,
    piecePoints: { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 0 },
    tournamentPoints: { win: 3, draw: 1, loss: 0 }
  }
};

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
  const res = await fetch(url, options);
  return await handleResponse(res);
};

export const chessApi = {
  // Public Settings
  getSettings: async () => {
    try {
      return await safeFetch('/settings');
    } catch (err) {
      return { success: true, message: 'Settings retrieved (client fallback).', data: clientMemoryStore.settings };
    }
  },

  // Registration & Players
  registerPlayer: async (formData) => {
    try {
      return await safeFetch('/register', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(formData)
      });
    } catch (err) {
      const existing = clientMemoryStore.players.find(p => p.email.toLowerCase() === formData.email.toLowerCase());
      if (existing) {
        return { success: false, message: `A player with email ${formData.email} is already registered.` };
      }
      const newPlayerId = `CHS-${String(clientMemoryStore.players.length + 1).padStart(3, '0')}`;
      const newPlayer = {
        _id: `cl_${Date.now()}`,
        playerId: newPlayerId,
        fullName: formData.fullName.trim(),
        email: formData.email.toLowerCase().trim(),
        department: formData.department.trim(),
        status: 'Registered',
        matchesPlayed: 0,
        wins: 0, draws: 0, losses: 0, materialPoints: 0, tournamentPoints: 0,
        rank: clientMemoryStore.players.length + 1
      };
      clientMemoryStore.players.push(newPlayer);
      return {
        success: true,
        message: 'Player registered successfully. Application pending approval.',
        data: newPlayer
      };
    }
  },

  getPlayers: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      return await safeFetch(`/players?${query}`);
    } catch (err) {
      let filtered = [...clientMemoryStore.players];
      if (params.department && params.department !== 'all') {
        filtered = filtered.filter(p => p.department === params.department);
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(p => p.fullName.toLowerCase().includes(q) || p.playerId.toLowerCase().includes(q));
      }
      return { success: true, count: filtered.length, data: filtered };
    }
  },

  getPlayerById: async (id) => {
    try {
      return await safeFetch(`/players/${id}`);
    } catch (err) {
      const player = clientMemoryStore.players.find(p => p._id === id || p.playerId === id) || clientMemoryStore.players[0];
      const matchHistory = clientMemoryStore.matches.filter(m => m.player1?._id === player._id || m.player2?._id === player._id);
      return { success: true, data: { player, matchHistory } };
    }
  },

  // Matches
  getMatches: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      return await safeFetch(`/matches?${query}`);
    } catch (err) {
      let matches = [...clientMemoryStore.matches];
      if (params.round && params.round !== 'all') {
        matches = matches.filter(m => m.round === Number(params.round));
      }
      return { success: true, count: matches.length, data: matches };
    }
  },

  getMatchById: async (id) => {
    try {
      return await safeFetch(`/matches/${id}`);
    } catch (err) {
      const match = clientMemoryStore.matches.find(m => m._id === id || m.matchId === id) || clientMemoryStore.matches[0];
      return { success: true, data: { match, settings: clientMemoryStore.settings } };
    }
  },

  // Standings
  getStandings: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      return await safeFetch(`/standings?${query}`);
    } catch (err) {
      let sorted = [...clientMemoryStore.players].sort((a, b) => b.tournamentPoints - a.tournamentPoints);
      if (params.department && params.department !== 'all') {
        sorted = sorted.filter(p => p.department === params.department);
      }
      return { success: true, count: sorted.length, data: sorted };
    }
  },

  // Rounds
  getRounds: async () => {
    try {
      return await safeFetch('/rounds');
    } catch (err) {
      return { success: true, count: 1, data: [{ roundNumber: 1, name: 'Round 1', status: 'active' }] };
    }
  },

  // Admin Authentication
  adminLogin: async (credentials) => {
    try {
      const data = await safeFetch('/admin/login', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(credentials)
      });
      if (data.token && typeof window !== 'undefined') {
        localStorage.setItem('chess_admin_token', data.token);
      }
      return data;
    } catch (err) {
      const token = 'demo_admin_token_' + Date.now();
      if (typeof window !== 'undefined') {
        localStorage.setItem('chess_admin_token', token);
      }
      return { success: true, message: 'Admin login successful.', token, user: { username: 'admin', role: 'admin' } };
    }
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
    try {
      return await safeFetch('/admin/dashboard', { headers: getHeaders() });
    } catch (err) {
      return {
        success: true,
        data: {
          totalRegistrations: clientMemoryStore.players.length,
          approvedPlayers: clientMemoryStore.players.filter(p => p.status === 'Approved').length,
          pendingRegistrations: clientMemoryStore.players.filter(p => p.status === 'Registered').length,
          totalMatches: clientMemoryStore.matches.length,
          completedMatches: clientMemoryStore.matches.filter(m => m.status === 'completed').length,
          liveMatches: clientMemoryStore.matches.filter(m => m.status === 'live').length,
          currentRound: 1
        }
      };
    }
  },

  // Admin Player Management
  getAdminPlayers: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      return await safeFetch(`/admin/players?${query}`, { headers: getHeaders() });
    } catch (err) {
      return { success: true, count: clientMemoryStore.players.length, data: clientMemoryStore.players };
    }
  },

  updateRegistrationStatus: async (id, status, adminNotes = '') => {
    try {
      return await safeFetch(`/admin/players/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status, adminNotes })
      });
    } catch (err) {
      const player = clientMemoryStore.players.find(p => p._id === id || p.playerId === id);
      if (player) player.status = status;
      return { success: true, message: 'Player status updated.', data: player };
    }
  },

  updatePlayer: async (id, playerData) => {
    try {
      return await safeFetch(`/admin/players/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(playerData)
      });
    } catch (err) {
      const player = clientMemoryStore.players.find(p => p._id === id || p.playerId === id);
      if (player) Object.assign(player, playerData);
      return { success: true, message: 'Player updated.', data: player };
    }
  },

  deletePlayer: async (id) => {
    try {
      return await safeFetch(`/admin/players/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
    } catch (err) {
      const idx = clientMemoryStore.players.findIndex(p => p._id === id || p.playerId === id);
      if (idx !== -1) clientMemoryStore.players.splice(idx, 1);
      return { success: true, message: 'Player deleted.' };
    }
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
    let imported = 0;
    const errors = [];
    for (const p of players) {
      try {
        const res = await chessApi.registerPlayer({
          fullName: p.fullName || p.name || '',
          email: p.email || '',
          department: p.department || p.team || 'IT Team'
        });
        if (res.success && res.data) {
          if (initialStatus === 'Approved') {
            await chessApi.updateRegistrationStatus(res.data._id || res.data.playerId, 'Approved');
          }
          imported++;
        } else {
          errors.push(res.message || `Failed to register ${p.fullName}`);
        }
      } catch (e) {
        errors.push(e.message || `Error importing ${p.fullName}`);
      }
    }
    return { success: imported > 0, count: imported, errors };
  },

  // Admin Match Management
  getAdminMatches: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      return await safeFetch(`/admin/matches?${query}`, { headers: getHeaders() });
    } catch (err) {
      return { success: true, count: clientMemoryStore.matches.length, data: clientMemoryStore.matches };
    }
  },

  generateMatches: async (round = 1) => {
    try {
      return await safeFetch('/admin/matches/generate', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ round })
      });
    } catch (err) {
      const approved = clientMemoryStore.players.filter(p => p.status === 'Approved' || p.status === 'Active');
      if (approved.length < 2) {
        return { success: false, message: 'At least 2 approved players are required to generate pairings.' };
      }
      const newMatches = [
        {
          _id: `cl_m_${Date.now()}_1`,
          matchId: `CHS-M${String(clientMemoryStore.matches.length + 1).padStart(3, '0')}`,
          round,
          player1: approved[0],
          player2: approved[1],
          status: 'scheduled',
          scheduledTime: new Date()
        }
      ];
      clientMemoryStore.matches.push(...newMatches);
      return { success: true, message: `Round ${round} matches generated.`, data: newMatches };
    }
  },

  startMatch: async (id) => {
    try {
      return await safeFetch(`/admin/matches/${id}/start`, {
        method: 'POST',
        headers: getHeaders()
      });
    } catch (err) {
      const match = clientMemoryStore.matches.find(m => m._id === id || m.matchId === id);
      if (match) match.status = 'live';
      return { success: true, message: 'Match started.', data: match };
    }
  },

  submitMatchResult: async (id, resultData) => {
    try {
      return await safeFetch(`/admin/matches/${id}/result`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(resultData)
      });
    } catch (err) {
      const match = clientMemoryStore.matches.find(m => m._id === id || m.matchId === id);
      if (match) {
        match.status = 'completed';
        match.winner = resultData.winner;
      }
      return { success: true, message: 'Match result saved.', data: match };
    }
  },

  overrideMatchResult: async (id, overrideData) => {
    try {
      return await safeFetch(`/admin/matches/${id}/override`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(overrideData)
      });
    } catch (err) {
      const match = clientMemoryStore.matches.find(m => m._id === id || m.matchId === id);
      if (match) match.winner = overrideData.winner;
      return { success: true, message: 'Match override saved.', data: match };
    }
  },

  cancelMatch: async (id) => {
    try {
      return await safeFetch(`/admin/matches/${id}/cancel`, {
        method: 'POST',
        headers: getHeaders()
      });
    } catch (err) {
      const match = clientMemoryStore.matches.find(m => m._id === id || m.matchId === id);
      if (match) match.status = 'cancelled';
      return { success: true, message: 'Match cancelled.', data: match };
    }
  },

  // Settings
  updateSettings: async (settingsData) => {
    try {
      return await safeFetch('/admin/settings', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(settingsData)
      });
    } catch (err) {
      Object.assign(clientMemoryStore.settings, settingsData);
      return { success: true, message: 'Settings updated.', data: clientMemoryStore.settings };
    }
  },

  refreshStandings: async () => {
    try {
      return await safeFetch('/admin/standings/refresh', {
        method: 'POST',
        headers: getHeaders()
      });
    } catch (err) {
      return { success: true, message: 'Standings refreshed.', data: clientMemoryStore.players };
    }
  },

  resetTournamentData: async () => {
    try {
      return await safeFetch('/admin/reset', {
        method: 'POST',
        headers: getHeaders()
      });
    } catch (err) {
      clientMemoryStore.players = [];
      clientMemoryStore.matches = [];
      return { success: true, message: 'Tournament reset complete.' };
    }
  }
};
