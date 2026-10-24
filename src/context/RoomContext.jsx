import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { 
  createRoom, 
  joinRoomByCode, 
  leaveRoom, 
  subscribeToRoom, 
  subscribeToRoomMessages, 
  updateRoomGameState, 
  selectRoomGame, 
  restartCurrentGame, 
  sendRoomChatMessage 
} from '../services/roomService';
import { soundFx } from '../utils/soundEffects';

const RoomContext = createContext(null);

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};

export const RoomProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingRoom, setLoadingRoom] = useState(false);
  const [roomError, setRoomError] = useState(null);

  // Check if current user is host
  const isHost = Boolean(currentRoom && currentUser && currentRoom.host?.id === currentUser.uid);

  // Opponent player
  const opponent = currentRoom 
    ? (isHost ? currentRoom.guest : currentRoom.host) 
    : null;

  // Subscribe to room updates
  useEffect(() => {
    if (!currentRoom?.id) return;

    const unsubscribeRoom = subscribeToRoom(
      currentRoom.id,
      (updatedRoom) => {
        setCurrentRoom(prev => {
          // Play notification if guest just joined
          if (!prev?.guest && updatedRoom?.guest) {
            soundFx.join();
          }
          return updatedRoom;
        });
      },
      (errorMsg) => {
        setRoomError(errorMsg);
      }
    );

    const unsubscribeMessages = subscribeToRoomMessages(
      currentRoom.id,
      (newMessages) => {
        setMessages(newMessages);
      }
    );

    return () => {
      unsubscribeRoom();
      unsubscribeMessages();
    };
  }, [currentRoom?.id]);

  const handleCreateRoom = async (defaultGame = 'tictactoe') => {
    if (!currentUser) return null;
    setLoadingRoom(true);
    setRoomError(null);
    try {
      soundFx.click();
      const { roomId, roomCode, room } = await createRoom(currentUser, defaultGame);
      setCurrentRoom(room);
      setLoadingRoom(false);
      navigate(`/room/${roomId}`);
      return { roomId, roomCode };
    } catch (err) {
      setRoomError(err.message || 'Failed to create room.');
      setLoadingRoom(false);
      soundFx.error();
      return null;
    }
  };

  const handleJoinRoom = async (code) => {
    if (!currentUser || !code) return false;
    setLoadingRoom(true);
    setRoomError(null);
    try {
      soundFx.click();
      const result = await joinRoomByCode(code, currentUser);
      if (result.success) {
        setCurrentRoom(result.room);
        soundFx.join();
        setLoadingRoom(false);
        navigate(`/room/${result.roomId}`);
        return true;
      } else {
        setRoomError(result.error);
        soundFx.error();
        setLoadingRoom(false);
        return false;
      }
    } catch (err) {
      setRoomError(err.message || 'Failed to join room.');
      soundFx.error();
      setLoadingRoom(false);
      return false;
    }
  };

  const handleLeaveRoom = async () => {
    if (!currentRoom || !currentUser) return;
    try {
      soundFx.click();
      await leaveRoom(currentRoom.id, currentUser.uid);
      setCurrentRoom(null);
      setMessages([]);
      navigate('/lobby');
    } catch (err) {
      console.warn('Error leaving room:', err);
      setCurrentRoom(null);
      navigate('/lobby');
    }
  };

  const handleSwitchGame = async (gameId) => {
    if (!currentRoom || !currentUser) return;
    try {
      soundFx.click();
      await selectRoomGame(
        currentRoom.id, 
        gameId, 
        currentRoom.host?.id, 
        currentRoom.guest?.id
      );
    } catch (err) {
      console.warn('Error switching game:', err);
    }
  };

  const handleRestartGame = async () => {
    if (!currentRoom) return;
    try {
      soundFx.click();
      await restartCurrentGame(
        currentRoom.id,
        currentRoom.selectedGame,
        currentRoom.host?.id,
        currentRoom.guest?.id
      );
    } catch (err) {
      console.warn('Error restarting game:', err);
    }
  };

  const handleUpdateGameState = async (newGameState, updatedScores = null) => {
    if (!currentRoom) return;
    try {
      await updateRoomGameState(currentRoom.id, newGameState, updatedScores);
    } catch (err) {
      console.warn('Error updating game state:', err);
    }
  };

  const handleSendMessage = async (text) => {
    if (!currentRoom || !currentUser || !text.trim()) return;
    try {
      soundFx.chat();
      await sendRoomChatMessage(currentRoom.id, currentUser, text);
    } catch (err) {
      console.warn('Error sending message:', err);
    }
  };

  const value = {
    currentRoom,
    messages,
    loadingRoom,
    roomError,
    isHost,
    opponent,
    createRoom: handleCreateRoom,
    joinRoom: handleJoinRoom,
    leaveRoom: handleLeaveRoom,
    switchGame: handleSwitchGame,
    restartGame: handleRestartGame,
    updateGameState: handleUpdateGameState,
    sendMessage: handleSendMessage,
    setRoomError,
    setCurrentRoom
  };

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
};
