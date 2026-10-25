import { 
  db, 
  isFirebaseConfigured, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  where,
  getDocs,
  serverTimestamp 
} from './firebase';

// Cross-tab broadcast channel for instant local fallback
const localBroadcast = typeof window !== 'undefined' && window.BroadcastChannel 
  ? new BroadcastChannel('togetherplay_sync') 
  : null;

// Helper to generate 6-character room codes (e.g., "TP7842")
export const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Initial state for games
export const getInitialGameState = (gameId, hostId, guestId) => {
  switch (gameId) {
    case 'tictactoe':
      return {
        game: 'tictactoe',
        board: Array(9).fill(null),
        currentTurn: hostId,
        startingPlayer: hostId,
        winner: null,
        winningLine: null,
        movesCount: 0,
        lastMoveAt: Date.now()
      };
    case 'connectfour':
      return {
        game: 'connectfour',
        board: Array(6).fill(null).map(() => Array(7).fill(null)),
        currentTurn: hostId,
        startingPlayer: hostId,
        winner: null,
        winningCells: [],
        movesCount: 0,
        lastMoveAt: Date.now()
      };
    case 'playerquiz':
      return {
        game: 'playerquiz',
        currentQuestionIndex: 0,
        answers: {},
        scores: {
          [hostId]: 0,
          [guestId || 'guest']: 0
        },
        status: 'playing',
        lastMoveAt: Date.now()
      };
    default:
      return null;
  }
};

// --- Storage helpers for offline fallback ---
const getLocalRooms = () => {
  try {
    return JSON.parse(localStorage.getItem('tp_local_rooms') || '{}');
  } catch {
    return {};
  }
};

const saveLocalRooms = (rooms) => {
  try {
    localStorage.setItem('tp_local_rooms', JSON.stringify(rooms));
  } catch (err) {
    console.error('Failed to save local rooms', err);
  }
};

const getLocalMessages = (roomId) => {
  try {
    return JSON.parse(localStorage.getItem(`tp_messages_${roomId}`) || '[]');
  } catch {
    return [];
  }
};

const saveLocalMessages = (roomId, messages) => {
  try {
    localStorage.setItem(`tp_messages_${roomId}`, JSON.stringify(messages));
  } catch (err) {
    console.error('Failed to save local messages', err);
  }
};

// --- Room API ---

export const createRoom = async (user, defaultGame = 'tictactoe') => {
  // 1. Firebase Cloud Mode
  if (isFirebaseConfigured && db) {
    try {
      const roomCode = generateRoomCode();
      const roomId = `room_${roomCode}_${Date.now()}`;
      const hostPlayer = {
        id: user.uid,
        name: user.displayName || 'Player 1',
        avatar: user.avatar || 'cyber-ninja',
        ready: true,
        symbol: 'X',
        color: '#8b5cf6'
      };

      const roomData = {
        id: roomId,
        code: roomCode,
        status: 'waiting',
        selectedGame: defaultGame,
        createdAt: Date.now(),
        host: hostPlayer,
        guest: null,
        scores: { [user.uid]: 0, draws: 0 },
        gameState: getInitialGameState(defaultGame, user.uid, null),
        lastActivity: Date.now()
      };

      const roomRef = doc(db, 'rooms', roomId);
      await setDoc(roomRef, {
        ...roomData,
        createdAtServer: serverTimestamp()
      });
      return { roomId, roomCode, room: roomData };
    } catch (err) {
      console.warn('Firebase createRoom failed, falling back to local server:', err);
    }
  }

  // 2. Built-in Real-time Server Database
  try {
    const res = await fetch('/api/rooms/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, defaultGame })
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (e) {
    console.warn('Server createRoom failed, using offline fallback:', e);
  }

  // 3. Offline fallback
  const roomCode = generateRoomCode();
  const roomId = `room_${roomCode}_${Date.now()}`;
  const hostPlayer = {
    id: user.uid,
    name: user.displayName || 'Player 1',
    avatar: user.avatar || 'cyber-ninja',
    ready: true,
    symbol: 'X',
    color: '#8b5cf6'
  };

  const roomData = {
    id: roomId,
    code: roomCode,
    status: 'waiting',
    selectedGame: defaultGame,
    createdAt: Date.now(),
    host: hostPlayer,
    guest: null,
    scores: { [user.uid]: 0, draws: 0 },
    gameState: getInitialGameState(defaultGame, user.uid, null),
    lastActivity: Date.now()
  };

  const rooms = getLocalRooms();
  rooms[roomId] = roomData;
  rooms[`code_${roomCode}`] = roomId;
  saveLocalRooms(rooms);

  if (localBroadcast) {
    localBroadcast.postMessage({ type: 'ROOM_CREATED', roomId, roomData });
  }

  return { roomId, roomCode, room: roomData };
};

export const joinRoomByCode = async (roomCode, user) => {
  const cleanCode = roomCode.trim().toUpperCase();

  const guestPlayer = {
    id: user.uid,
    name: user.displayName || 'Player 2',
    avatar: user.avatar || 'neon-viper',
    ready: true,
    symbol: 'O',
    color: '#06b6d4'
  };

  // 1. Firebase Cloud Mode
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'rooms'), where('code', '==', cleanCode));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const roomDoc = querySnapshot.docs[0];
        const data = roomDoc.data();
        const roomId = roomDoc.id;

        if (data.host.id === user.uid) {
          return { success: true, roomId, room: data };
        }
        if (data.guest && data.guest.id === user.uid) {
          return { success: true, roomId, room: data };
        }
        if (data.guest && data.guest.id !== user.uid) {
          return { success: false, error: 'Room is already full (2 players connected).' };
        }

        const updatedScores = {
          ...data.scores,
          [user.uid]: data.scores[user.uid] || 0
        };

        const initialGame = getInitialGameState(data.selectedGame || 'tictactoe', data.host.id, user.uid);

        await updateDoc(doc(db, 'rooms', roomId), {
          guest: guestPlayer,
          status: 'ready',
          scores: updatedScores,
          gameState: initialGame,
          lastActivity: Date.now()
        });

        return { success: true, roomId, room: { ...data, guest: guestPlayer, status: 'ready', gameState: initialGame } };
      }
    } catch (err) {
      console.warn('Firebase joinRoomByCode failed, using server database:', err);
    }
  }

  // 2. Built-in Real-time Server Database
  try {
    const res = await fetch('/api/rooms/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomCode: cleanCode, user })
    });
    const data = await res.json();
    return data;
  } catch (e) {
    console.warn('Server joinRoomByCode failed, using offline fallback:', e);
  }

  // 3. Offline fallback
  const rooms = getLocalRooms();
  const roomId = rooms[`code_${cleanCode}`] || Object.keys(rooms).find(k => rooms[k]?.code === cleanCode);

  if (!roomId || !rooms[roomId]) {
    return { success: false, error: `No room found with code "${cleanCode}". Please check and try again.` };
  }

  const room = rooms[roomId];
  if (room.host.id === user.uid) {
    return { success: true, roomId, room };
  }
  if (room.guest && room.guest.id === user.uid) {
    return { success: true, roomId, room };
  }
  if (room.guest && room.guest.id !== user.uid) {
    return { success: false, error: 'Room is already full (2 players connected).' };
  }

  room.guest = guestPlayer;
  room.status = 'ready';
  room.scores = {
    ...room.scores,
    [user.uid]: room.scores[user.uid] || 0
  };
  room.gameState = getInitialGameState(room.selectedGame || 'tictactoe', room.host.id, user.uid);
  room.lastActivity = Date.now();

  rooms[roomId] = room;
  saveLocalRooms(rooms);

  if (localBroadcast) {
    localBroadcast.postMessage({ type: 'ROOM_UPDATED', roomId, roomData: room });
  }

  return { success: true, roomId, room };
};

export const leaveRoom = async (roomId, userId) => {
  if (isFirebaseConfigured && db) {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      const snapshot = await getDoc(roomRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.host.id === userId) {
          await updateDoc(roomRef, { status: 'abandoned', lastActivity: Date.now() });
        } else if (data.guest && data.guest.id === userId) {
          await updateDoc(roomRef, { guest: null, status: 'waiting', lastActivity: Date.now() });
        }
      }
      return;
    } catch (err) {
      console.warn('Firebase leaveRoom failed:', err);
    }
  }

  // Local fallback
  const rooms = getLocalRooms();
  if (rooms[roomId]) {
    const room = rooms[roomId];
    if (room.host.id === userId) {
      room.status = 'abandoned';
    } else if (room.guest && room.guest.id === userId) {
      room.guest = null;
      room.status = 'waiting';
    }
    room.lastActivity = Date.now();
    saveLocalRooms(rooms);

    if (localBroadcast) {
      localBroadcast.postMessage({ type: 'ROOM_UPDATED', roomId, roomData: room });
    }
  }
};

export const updateRoomGameState = async (roomId, newGameState, updatedScores = null) => {
  if (isFirebaseConfigured && db) {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      const updates = {
        gameState: newGameState,
        lastActivity: Date.now()
      };
      if (updatedScores) {
        updates.scores = updatedScores;
      }
      await updateDoc(roomRef, updates);
      return;
    } catch (err) {
      console.warn('Firebase updateRoomGameState failed:', err);
    }
  }

  // Built-in server database
  try {
    await fetch('/api/rooms/update-game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, gameState: newGameState, scores: updatedScores })
    });
  } catch (err) {
    console.warn('Server updateRoomGameState failed:', err);
  }

  // Local fallback
  const rooms = getLocalRooms();
  if (rooms[roomId]) {
    rooms[roomId].gameState = newGameState;
    if (updatedScores) {
      rooms[roomId].scores = updatedScores;
    }
    rooms[roomId].lastActivity = Date.now();
    saveLocalRooms(rooms);

    if (localBroadcast) {
      localBroadcast.postMessage({ type: 'ROOM_UPDATED', roomId, roomData: rooms[roomId] });
    }
  }
};

export const selectRoomGame = async (roomId, newGame, hostId, guestId) => {
  if (isFirebaseConfigured && db) {
    try {
      const initialGameState = getInitialGameState(newGame, hostId, guestId);
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        selectedGame: newGame,
        gameState: initialGameState,
        lastActivity: Date.now()
      });
      return;
    } catch (err) {
      console.warn('Firebase selectRoomGame error:', err);
    }
  }

  // Built-in server database
  try {
    await fetch('/api/rooms/switch-game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, gameId: newGame })
    });
  } catch (err) {
    console.warn('Server switch-game error:', err);
  }

  // Local fallback
  const initialGameState = getInitialGameState(newGame, hostId, guestId);
  const rooms = getLocalRooms();
  if (rooms[roomId]) {
    rooms[roomId].selectedGame = newGame;
    rooms[roomId].gameState = initialGameState;
    rooms[roomId].lastActivity = Date.now();
    saveLocalRooms(rooms);

    if (localBroadcast) {
      localBroadcast.postMessage({ type: 'ROOM_UPDATED', roomId, roomData: rooms[roomId] });
    }
  }
};

export const restartCurrentGame = async (roomId, gameId, hostId, guestId) => {
  if (isFirebaseConfigured && db) {
    const newGameState = getInitialGameState(gameId, hostId, guestId);
    await updateRoomGameState(roomId, newGameState);
    return;
  }

  // Built-in server database
  try {
    await fetch('/api/rooms/reset-game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId })
    });
  } catch (err) {
    console.warn('Server reset-game error:', err);
  }

  // Local fallback
  const newGameState = getInitialGameState(gameId, hostId, guestId);
  await updateRoomGameState(roomId, newGameState);
};

export const sendRoomChatMessage = async (roomId, user, text) => {
  if (!text || !text.trim()) return;

  const msg = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    roomId,
    senderId: user.uid,
    senderName: user.displayName || 'Player',
    senderAvatar: user.avatar || 'cyber-ninja',
    text: text.trim(),
    timestamp: Date.now()
  };

  if (isFirebaseConfigured && db) {
    try {
      const msgColl = collection(db, 'rooms', roomId, 'messages');
      await addDoc(msgColl, {
        ...msg,
        serverTime: serverTimestamp()
      });
      return msg;
    } catch (err) {
      console.warn('Firebase sendChatMessage error:', err);
    }
  }

  // Built-in server database
  try {
    const res = await fetch('/api/rooms/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, user, text })
    });
    if (res.ok) {
      const data = await res.json();
      return data.message;
    }
  } catch (err) {
    console.warn('Server sendChatMessage error:', err);
  }

  // Local fallback
  const messages = getLocalMessages(roomId);
  messages.push(msg);
  saveLocalMessages(roomId, messages);

  if (localBroadcast) {
    localBroadcast.postMessage({ type: 'CHAT_MESSAGE', roomId, message: msg });
  }

  return msg;
};

// Real-time listener for Room updates
export const subscribeToRoom = (roomId, onRoomUpdate, onError) => {
  let unsubFirestore = null;
  let eventSource = null;

  if (isFirebaseConfigured && db) {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      unsubFirestore = onSnapshot(roomRef, (docSnap) => {
        if (docSnap.exists()) {
          onRoomUpdate(docSnap.data());
        } else {
          onError && onError('Room no longer exists.');
        }
      }, (err) => {
        console.warn('Firestore room snapshot error:', err);
      });
    } catch (err) {
      console.warn('subscribeToRoom setup error:', err);
    }
  } else {
    // Connect to Server-Sent Events (SSE) for instant cross-device sync
    try {
      eventSource = new EventSource(`/api/rooms/${roomId}/events`);
      eventSource.addEventListener('ROOM_UPDATE', (e) => {
        try {
          const room = JSON.parse(e.data);
          onRoomUpdate(room);
        } catch (err) {
          console.error('Failed to parse SSE room update', err);
        }
      });
      eventSource.onerror = (err) => {
        console.warn('SSE room connection notice:', err);
      };
    } catch (e) {
      console.warn('EventSource failed, using storage listener:', e);
    }
  }

  // Initial local check if available
  const rooms = getLocalRooms();
  if (rooms[roomId]) {
    onRoomUpdate(rooms[roomId]);
  }

  // Broadcast channel listener for cross-tab sync
  const handleBroadcast = (event) => {
    if (event.data?.roomId === roomId && (event.data?.type === 'ROOM_UPDATED' || event.data?.type === 'ROOM_CREATED')) {
      onRoomUpdate(event.data.roomData);
    }
  };

  if (localBroadcast) {
    localBroadcast.addEventListener('message', handleBroadcast);
  }

  return () => {
    if (unsubFirestore) unsubFirestore();
    if (eventSource) eventSource.close();
    if (localBroadcast) localBroadcast.removeEventListener('message', handleBroadcast);
  };
};

// Real-time listener for Messages
export const subscribeToRoomMessages = (roomId, onMessagesUpdate) => {
  let unsubFirestore = null;
  let eventSource = null;

  if (isFirebaseConfigured && db) {
    try {
      const msgsQuery = query(
        collection(db, 'rooms', roomId, 'messages'),
        orderBy('timestamp', 'asc')
      );
      unsubFirestore = onSnapshot(msgsQuery, (snapshot) => {
        const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        onMessagesUpdate(msgs);
      }, (err) => {
        console.warn('Firestore messages snapshot error:', err);
      });
    } catch (err) {
      console.warn('subscribeToRoomMessages error:', err);
    }
  } else {
    try {
      eventSource = new EventSource(`/api/rooms/${roomId}/events`);
      eventSource.addEventListener('CHAT_UPDATE', (e) => {
        try {
          const msgs = JSON.parse(e.data);
          onMessagesUpdate(msgs);
        } catch (err) {
          console.error('Failed to parse SSE chat update', err);
        }
      });
    } catch {
      // ignore
    }
  }

  // Local fallback
  const initialMsgs = getLocalMessages(roomId);
  onMessagesUpdate(initialMsgs);

  const handleBroadcast = (event) => {
    if (event.data?.roomId === roomId && event.data?.type === 'CHAT_MESSAGE') {
      const current = getLocalMessages(roomId);
      onMessagesUpdate(current);
    }
  };

  if (localBroadcast) {
    localBroadcast.addEventListener('message', handleBroadcast);
  }

  return () => {
    if (unsubFirestore) unsubFirestore();
    if (eventSource) eventSource.close();
    if (localBroadcast) localBroadcast.removeEventListener('message', handleBroadcast);
  };
};
