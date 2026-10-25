// Built-in Real-Time Database Server for TogetherPlay
// Provides shared real-time room & multiplayer synchronization across any devices on the network

function parseJsonBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function sendJson(res, statusCode, payload) {
  try {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.end(JSON.stringify(payload));
  } catch (err) {
    console.error('[Multiplayer DB] sendJson error:', err);
  }
}

// In-memory Database Store
const db = {
  rooms: new Map(), // roomId -> roomData
  codeMap: new Map(), // roomCode -> roomId
  messages: new Map(), // roomId -> array of messages
  clients: new Map() // roomId -> Set of SSE response objects
};

function getRoom(idOrCode) {
  if (!idOrCode) return null;
  if (db.rooms.has(idOrCode)) return db.rooms.get(idOrCode);
  const fromCode = db.codeMap.get(idOrCode.toUpperCase());
  if (fromCode && db.rooms.has(fromCode)) return db.rooms.get(fromCode);
  return null;
}

function broadcast(roomId, eventType, data) {
  const room = getRoom(roomId);
  const actualId = room ? room.id : roomId;
  const roomClients = db.clients.get(actualId);
  if (!roomClients || roomClients.size === 0) return;

  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of roomClients) {
    try {
      client.write(payload);
    } catch {
      roomClients.delete(client);
    }
  }
}

export function multiplayerDbPlugin() {
  return {
    name: 'togetherplay-multiplayer-db',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const url = new URL(req.url, 'http://localhost');
          const pathname = url.pathname;

          // CORS preflight
          if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            res.statusCode = 204;
            return res.end();
          }

          // 1. Health & Status
          if (pathname === '/api/db/status' && req.method === 'GET') {
            return sendJson(res, 200, {
              status: 'online',
              type: 'TogetherPlay Realtime Database',
              activeRooms: db.rooms.size,
              uptimeSeconds: Math.floor(process.uptime())
            });
          }

          // 2. Create Room
          if (pathname === '/api/rooms/create' && req.method === 'POST') {
            const body = await parseJsonBody(req);
            const user = body.user || body || {};
            const userId = user.uid || user.id || `player_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            const defaultGame = body.defaultGame || 'tictactoe';

            // Generate 6-digit code
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let roomCode = '';
            for (let i = 0; i < 6; i++) {
              roomCode += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            const roomId = `room_${roomCode}_${Date.now()}`;

            const hostPlayer = {
              id: userId,
              name: user.displayName || user.name || 'Player 1',
              avatar: user.avatar || 'cyber-ninja',
              ready: true,
              symbol: 'X',
              color: '#8b5cf6'
            };

            // Initial game state
            let gameState = null;
            if (defaultGame === 'tictactoe') {
              gameState = {
                game: 'tictactoe',
                board: Array(9).fill(null),
                currentTurn: userId,
                startingPlayer: userId,
                winner: null,
                winningLine: null,
                lastMoveAt: Date.now()
              };
            } else if (defaultGame === 'connectfour') {
              gameState = {
                game: 'connectfour',
                board: Array(6).fill(null).map(() => Array(7).fill(null)),
                currentTurn: userId,
                startingPlayer: userId,
                winner: null,
                winningCells: [],
                lastMoveAt: Date.now()
              };
            } else {
              gameState = {
                game: 'playerquiz',
                currentQuestionIndex: 0,
                answers: {},
                scores: { [userId]: 0 },
                status: 'playing',
                lastMoveAt: Date.now()
              };
            }

            const room = {
              id: roomId,
              code: roomCode,
              status: 'waiting',
              selectedGame: defaultGame,
              createdAt: Date.now(),
              host: hostPlayer,
              guest: null,
              scores: { [userId]: 0, draws: 0 },
              gameState,
              lastActivity: Date.now()
            };

            db.rooms.set(roomId, room);
            db.codeMap.set(roomCode, roomId);
            db.messages.set(roomId, []);

            console.log(`[Multiplayer DB] Room created: ${roomCode} (${roomId}) by ${hostPlayer.name}`);
            return sendJson(res, 200, { success: true, roomId, roomCode, room });
          }

          // 3. Join Room by Code
          if (pathname === '/api/rooms/join' && req.method === 'POST') {
            const body = await parseJsonBody(req);
            const user = body.user || body || {};
            const userId = user.uid || user.id || `player_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            const cleanCode = (body.roomCode || body.code || '').trim().toUpperCase();

            const roomId = db.codeMap.get(cleanCode);
            if (!roomId || !db.rooms.has(roomId)) {
              return sendJson(res, 404, { 
                success: false, 
                error: `No active room found with code "${cleanCode}". Please verify code.` 
              });
            }

            const room = db.rooms.get(roomId);

            // Check if already host
            if (room.host.id === userId) {
              return sendJson(res, 200, { success: true, roomId, room });
            }

            // Check if guest reconnecting
            if (room.guest && room.guest.id === userId) {
              return sendJson(res, 200, { success: true, roomId, room });
            }

            // Check if full
            if (room.guest && room.guest.id !== userId) {
              return sendJson(res, 403, { 
                success: false, 
                error: 'Room is already full with 2 players connected.' 
              });
            }

            // Connect as guest
            const guestPlayer = {
              id: userId,
              name: user.displayName || user.name || 'Player 2',
              avatar: user.avatar || 'neon-viper',
              ready: true,
              symbol: 'O',
              color: '#06b6d4'
            };

            room.guest = guestPlayer;
            room.status = 'ready';
            room.scores = {
              ...room.scores,
              [userId]: room.scores[userId] || 0
            };
            if (room.gameState?.scores) {
              room.gameState.scores[userId] = 0;
            }
            room.lastActivity = Date.now();

            db.rooms.set(roomId, room);

            console.log(`[Multiplayer DB] Player 2 (${guestPlayer.name}) connected to room ${cleanCode}`);
            broadcast(roomId, 'ROOM_UPDATE', room);

            return sendJson(res, 200, { success: true, roomId, room });
          }

          // 4. Update Game State
          if (pathname === '/api/rooms/update-game' && req.method === 'POST') {
            const body = await parseJsonBody(req);
            const { roomId, gameState, scores } = body;

            const room = getRoom(roomId);
            if (!room) {
              return sendJson(res, 404, { success: false, error: 'Room not found' });
            }

            room.gameState = gameState;
            if (scores) room.scores = scores;
            room.lastActivity = Date.now();

            db.rooms.set(room.id, room);
            broadcast(room.id, 'ROOM_UPDATE', room);

            return sendJson(res, 200, { success: true, room });
          }

          // 5. Switch Game
          if (pathname === '/api/rooms/switch-game' && req.method === 'POST') {
            const body = await parseJsonBody(req);
            const { roomId, gameId } = body;

            const room = getRoom(roomId);
            if (!room) {
              return sendJson(res, 404, { success: false, error: 'Room not found' });
            }

            room.selectedGame = gameId;

            const hostId = room.host.id;
            const guestId = room.guest?.id || 'guest';

            if (gameId === 'tictactoe') {
              room.gameState = {
                game: 'tictactoe',
                board: Array(9).fill(null),
                currentTurn: hostId,
                startingPlayer: hostId,
                winner: null,
                winningLine: null,
                lastMoveAt: Date.now()
              };
            } else if (gameId === 'connectfour') {
              room.gameState = {
                game: 'connectfour',
                board: Array(6).fill(null).map(() => Array(7).fill(null)),
                currentTurn: hostId,
                startingPlayer: hostId,
                winner: null,
                winningCells: [],
                lastMoveAt: Date.now()
              };
            } else {
              room.gameState = {
                game: 'playerquiz',
                currentQuestionIndex: 0,
                answers: {},
                scores: { [hostId]: 0, [guestId]: 0 },
                status: 'playing',
                lastMoveAt: Date.now()
              };
            }

            room.lastActivity = Date.now();
            db.rooms.set(room.id, room);
            broadcast(room.id, 'ROOM_UPDATE', room);

            return sendJson(res, 200, { success: true, room });
          }

          // 6. Reset Game
          if (pathname === '/api/rooms/reset-game' && req.method === 'POST') {
            const body = await parseJsonBody(req);
            const { roomId } = body;

            const room = getRoom(roomId);
            if (!room) {
              return sendJson(res, 404, { success: false, error: 'Room not found' });
            }

            const hostId = room.host.id;
            const guestId = room.guest?.id || 'guest';

            if (room.selectedGame === 'tictactoe') {
              room.gameState = {
                game: 'tictactoe',
                board: Array(9).fill(null),
                currentTurn: hostId,
                startingPlayer: hostId,
                winner: null,
                winningLine: null,
                lastMoveAt: Date.now()
              };
            } else if (room.selectedGame === 'connectfour') {
              room.gameState = {
                game: 'connectfour',
                board: Array(6).fill(null).map(() => Array(7).fill(null)),
                currentTurn: hostId,
                startingPlayer: hostId,
                winner: null,
                winningCells: [],
                lastMoveAt: Date.now()
              };
            } else {
              room.gameState = {
                game: 'playerquiz',
                currentQuestionIndex: 0,
                answers: {},
                scores: { [hostId]: 0, [guestId]: 0 },
                status: 'playing',
                lastMoveAt: Date.now()
              };
            }

            room.lastActivity = Date.now();
            db.rooms.set(room.id, room);
            broadcast(room.id, 'ROOM_UPDATE', room);

            return sendJson(res, 200, { success: true, room });
          }

          // 7. Send Chat Message
          if (pathname === '/api/rooms/messages' && req.method === 'POST') {
            const body = await parseJsonBody(req);
            const { roomId, text } = body;
            const user = body.user || {};
            const userId = user.uid || user.id || 'player';

            const room = getRoom(roomId);
            const actualRoomId = room ? room.id : roomId;

            const msg = {
              id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              roomId: actualRoomId,
              senderId: userId,
              senderName: user.displayName || user.name || 'Player',
              senderAvatar: user.avatar || 'cyber-ninja',
              text: (text || '').trim(),
              timestamp: Date.now()
            };

            const roomMsgs = db.messages.get(actualRoomId) || [];
            roomMsgs.push(msg);
            db.messages.set(actualRoomId, roomMsgs);

            broadcast(actualRoomId, 'CHAT_UPDATE', roomMsgs);
            return sendJson(res, 200, { success: true, message: msg });
          }

          // 8. Server-Sent Events (SSE) Real-Time Listener
          const sseMatch = pathname.match(/^\/api\/rooms\/([^/]+)\/events$/);
          if (sseMatch && req.method === 'GET') {
            const rawId = sseMatch[1];
            const room = getRoom(rawId);
            const roomId = room ? room.id : rawId;

            res.writeHead(200, {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache, no-transform',
              'Connection': 'keep-alive',
              'Access-Control-Allow-Origin': '*'
            });

            if (!db.clients.has(roomId)) {
              db.clients.set(roomId, new Set());
            }
            db.clients.get(roomId).add(res);

            // Send immediate current room data
            const currentRoom = db.rooms.get(roomId);
            if (currentRoom) {
              res.write(`event: ROOM_UPDATE\ndata: ${JSON.stringify(currentRoom)}\n\n`);
            }

            // Send current messages
            const currentMsgs = db.messages.get(roomId) || [];
            res.write(`event: CHAT_UPDATE\ndata: ${JSON.stringify(currentMsgs)}\n\n`);

            // Heartbeat ping
            const pingInterval = setInterval(() => {
              try {
                res.write(': ping\n\n');
              } catch {
                clearInterval(pingInterval);
              }
            }, 15000);

            req.on('close', () => {
              clearInterval(pingInterval);
              const clients = db.clients.get(roomId);
              if (clients) {
                clients.delete(res);
              }
            });

            return;
          }

          next();
        } catch (serverErr) {
          console.error('[Multiplayer DB Error]:', serverErr);
          return sendJson(res, 500, { error: 'Internal server error in multiplayer db' });
        }
      });
    }
  };
}
