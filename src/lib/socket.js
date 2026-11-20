import { io } from 'socket.io-client';

let socketInstance = null;

/**
 * Derives the Socket.io server URL based on the environment and API base URL
 */
export function getSocketUrl() {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;

  if (typeof window !== 'undefined') {
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.startsWith('192.168.') ||
      window.location.hostname.startsWith('10.');

    if (isLocalhost) {
      if (envUrl && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
        return envUrl.replace(/\/api\/?$/, '');
      }
      return 'http://localhost:5000';
    }

    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl.replace(/\/api\/?$/, '');
    }

    // Default production backend
    return 'https://carrom-backend.onrender.com';
  }

  return (envUrl || 'https://carrom-backend.onrender.com').replace(/\/api\/?$/, '');
}

/**
 * Returns a singleton Socket.io client instance
 */
export function getSocket() {
  if (typeof window === 'undefined') return null;

  if (!socketInstance) {
    const url = getSocketUrl();
    socketInstance = io(url, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    socketInstance.on('connect', () => {
      // Connected to real-time socket server
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('[Socket.io] Connection warning:', err?.message || err);
    });
  }

  return socketInstance;
}

/**
 * Subscribe to real-time updates for a specific match
 */
export function subscribeToMatch(matchId, callback) {
  const socket = getSocket();
  if (!socket || !matchId) return () => {};

  socket.emit('join_match', matchId);

  const handleMatchUpdate = (data) => {
    if (callback) callback(data);
  };

  socket.on('match:started', handleMatchUpdate);
  socket.on('match:timer_updated', handleMatchUpdate);
  socket.on('match:completed', handleMatchUpdate);
  socket.on('match:stopped', handleMatchUpdate);
  socket.on('carrom:score_updated', handleMatchUpdate);
  socket.on('carrom:score_change', handleMatchUpdate);
  socket.on('chess:clock_tick', handleMatchUpdate);
  socket.on('chess:turn_switch', handleMatchUpdate);
  socket.on('chess:clock_updated', handleMatchUpdate);
  socket.on('chess:match_updated', handleMatchUpdate);

  // Return unsubscribe cleanup function
  return () => {
    socket.emit('leave_match', matchId);
    socket.off('match:started', handleMatchUpdate);
    socket.off('match:timer_updated', handleMatchUpdate);
    socket.off('match:completed', handleMatchUpdate);
    socket.off('match:stopped', handleMatchUpdate);
    socket.off('carrom:score_updated', handleMatchUpdate);
    socket.off('carrom:score_change', handleMatchUpdate);
    socket.off('chess:clock_tick', handleMatchUpdate);
    socket.off('chess:turn_switch', handleMatchUpdate);
    socket.off('chess:clock_updated', handleMatchUpdate);
    socket.off('chess:match_updated', handleMatchUpdate);
  };
}

/**
 * Subscribe to tournament-wide live Carrom arena updates
 */
export function subscribeToCarromLive(callback) {
  const socket = getSocket();
  if (!socket) return () => {};

  socket.emit('join_carrom_live');

  const handleCarromUpdate = (data) => {
    if (callback) callback(data);
  };

  socket.on('carrom:match_started', handleCarromUpdate);
  socket.on('carrom:score_updated', handleCarromUpdate);
  socket.on('carrom:score_change', handleCarromUpdate);
  socket.on('carrom:timer_updated', handleCarromUpdate);
  socket.on('carrom:match_completed', handleCarromUpdate);
  socket.on('carrom:match_stopped', handleCarromUpdate);

  return () => {
    socket.off('carrom:match_started', handleCarromUpdate);
    socket.off('carrom:score_updated', handleCarromUpdate);
    socket.off('carrom:score_change', handleCarromUpdate);
    socket.off('carrom:timer_updated', handleCarromUpdate);
    socket.off('carrom:match_completed', handleCarromUpdate);
    socket.off('carrom:match_stopped', handleCarromUpdate);
  };
}

/**
 * Subscribe to tournament-wide live Chess updates
 */
export function subscribeToChessLive(callback) {
  const socket = getSocket();
  if (!socket) return () => {};

  socket.emit('join_chess_live');

  const handleChessUpdate = (data) => {
    if (callback) callback(data);
  };

  socket.on('chess:match_started', handleChessUpdate);
  socket.on('chess:turn_switch', handleChessUpdate);
  socket.on('chess:clock_updated', handleChessUpdate);
  socket.on('chess:match_updated', handleChessUpdate);
  socket.on('chess:match_completed', handleChessUpdate);
  socket.on('chess:match_cancelled', handleChessUpdate);

  return () => {
    socket.off('chess:match_started', handleChessUpdate);
    socket.off('chess:turn_switch', handleChessUpdate);
    socket.off('chess:clock_updated', handleChessUpdate);
    socket.off('chess:match_updated', handleChessUpdate);
    socket.off('chess:match_completed', handleChessUpdate);
    socket.off('chess:match_cancelled', handleChessUpdate);
  };
}
