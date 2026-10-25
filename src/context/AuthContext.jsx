import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  isFirebaseConfigured, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  fbSignOut, 
  onAuthStateChanged,
  updateProfile,
  signInAnonymously,
  db,
  doc,
  setDoc,
  getDoc
} from '../services/firebase';
import { AVATARS } from '../utils/avatars';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    history: []
  });

  const loadLocalUser = () => {
    try {
      const sessionUser = sessionStorage.getItem('tp_session_user');
      const savedStats = localStorage.getItem('tp_stats');

      if (sessionUser) {
        setCurrentUser(JSON.parse(sessionUser));
      } else {
        // Auto-create a unique guest profile for this tab/device
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)].id;
        const defaultGuest = {
          uid: `player_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          displayName: `Player_${randomNum}`,
          email: `guest${randomNum}@togetherplay.gg`,
          avatar: randomAvatar,
          isGuest: true
        };
        sessionStorage.setItem('tp_session_user', JSON.stringify(defaultGuest));
        setCurrentUser(defaultGuest);
      }

      if (savedStats) {
        setUserStats(JSON.parse(savedStats));
      }
    } catch (err) {
      console.error('Error loading local user', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          // Fetch extra profile data from Firestore
          let avatar = 'cyber-ninja';
          try {
            if (db) {
              const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
              if (userDoc.exists()) {
                const data = userDoc.data();
                avatar = data.avatar || avatar;
                if (data.stats) setUserStats(data.stats);
              }
            }
          } catch {
            // ignore
          }

          const userObj = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || 'Gamer',
            avatar: avatar,
            isGuest: fbUser.isAnonymous
          };
          setCurrentUser(userObj);
          localStorage.setItem('tp_user', JSON.stringify(userObj));
        } else {
          loadLocalUser();
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      loadLocalUser();
    }
  }, []);

  const signup = async (email, password, displayName, avatarId = 'cyber-ninja') => {
    if (isFirebaseConfigured && auth) {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName });
      
      const profile = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: displayName || 'Gamer',
        avatar: avatarId,
        isGuest: false
      };

      if (db) {
        try {
          await setDoc(doc(db, 'users', cred.user.uid), {
            displayName,
            email,
            avatar: avatarId,
            createdAt: Date.now(),
            stats: userStats
          });
        } catch (e) {
          console.warn('Could not save user profile doc:', e);
        }
      }

      setCurrentUser(profile);
      sessionStorage.setItem('tp_session_user', JSON.stringify(profile));
      return profile;
    } else {
      // Local account simulation
      const localUser = {
        uid: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        displayName: displayName || 'Gamer',
        email,
        avatar: avatarId,
        isGuest: false
      };
      setCurrentUser(localUser);
      sessionStorage.setItem('tp_session_user', JSON.stringify(localUser));
      return localUser;
    }
  };

  const login = async (email, password) => {
    if (isFirebaseConfigured && auth) {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      let avatar = 'cyber-ninja';
      try {
        if (db) {
          const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
          if (userDoc.exists()) {
            avatar = userDoc.data().avatar || avatar;
          }
        }
      } catch {
        // ignore
      }

      const profile = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName || 'Gamer',
        avatar,
        isGuest: false
      };
      setCurrentUser(profile);
      sessionStorage.setItem('tp_session_user', JSON.stringify(profile));
      return profile;
    } else {
      // Local login fallback
      const localUser = {
        uid: `user_${Date.now()}`,
        displayName: email.split('@')[0],
        email,
        avatar: 'cyber-ninja',
        isGuest: false
      };
      setCurrentUser(localUser);
      sessionStorage.setItem('tp_session_user', JSON.stringify(localUser));
      return localUser;
    }
  };

  const loginAsGuest = async (customName = '', avatarId = 'cyber-ninja') => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const name = customName.trim() || `Player_${randomNum}`;

    if (isFirebaseConfigured && auth) {
      try {
        const cred = await signInAnonymously(auth);
        await updateProfile(cred.user, { displayName: name });
        const profile = {
          uid: cred.user.uid,
          displayName: name,
          email: 'guest@togetherplay.gg',
          avatar: avatarId,
          isGuest: true
        };
        setCurrentUser(profile);
        sessionStorage.setItem('tp_session_user', JSON.stringify(profile));
        return profile;
      } catch (err) {
        console.warn('Anonymous sign-in failed, continuing with local guest:', err);
      }
    }

    const guestProfile = {
      uid: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      displayName: name,
      email: 'guest@togetherplay.gg',
      avatar: avatarId,
      isGuest: true
    };
    setCurrentUser(guestProfile);
    sessionStorage.setItem('tp_session_user', JSON.stringify(guestProfile));
    return guestProfile;
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await fbSignOut(auth);
      } catch (err) {
        console.warn('Firebase signOut error:', err);
      }
    }
    // Reset to fresh guest
    localStorage.removeItem('tp_user');
    loadLocalUser();
  };

  const updateAvatar = async (newAvatarId) => {
    if (!currentUser) return;
    const updated = { ...currentUser, avatar: newAvatarId };
    setCurrentUser(updated);
    localStorage.setItem('tp_user', JSON.stringify(updated));

    if (isFirebaseConfigured && db && currentUser.uid) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), { avatar: newAvatarId }, { merge: true });
      } catch (err) {
        console.warn('Could not update avatar in Firestore:', err);
      }
    }
  };

  const updateUsername = async (newName) => {
    if (!currentUser || !newName.trim()) return;
    const updated = { ...currentUser, displayName: newName.trim() };
    setCurrentUser(updated);
    localStorage.setItem('tp_user', JSON.stringify(updated));

    if (isFirebaseConfigured && auth?.currentUser) {
      try {
        await updateProfile(auth.currentUser, { displayName: newName.trim() });
      } catch (e) {
        // ignore
      }
    }

    if (isFirebaseConfigured && db && currentUser.uid) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), { displayName: newName.trim() }, { merge: true });
      } catch (err) {
        console.warn('Could not update username in Firestore:', err);
      }
    }
  };

  const recordMatchResult = (gameName, opponentName, result) => {
    // result: 'win' | 'loss' | 'draw'
    setUserStats(prev => {
      const newStats = {
        gamesPlayed: prev.gamesPlayed + 1,
        wins: result === 'win' ? prev.wins + 1 : prev.wins,
        losses: result === 'loss' ? prev.losses + 1 : prev.losses,
        draws: result === 'draw' ? prev.draws + 1 : prev.draws,
        history: [
          {
            id: `match_${Date.now()}`,
            game: gameName,
            opponent: opponentName,
            result,
            timestamp: Date.now()
          },
          ...(prev.history || []).slice(0, 19) // Keep last 20 matches
        ]
      };
      localStorage.setItem('tp_stats', JSON.stringify(newStats));

      if (isFirebaseConfigured && db && currentUser?.uid) {
        try {
          setDoc(doc(db, 'users', currentUser.uid), { stats: newStats }, { merge: true });
        } catch {
          // ignore
        }
      }

      return newStats;
    });
  };

  const value = {
    currentUser,
    userStats,
    loading,
    signup,
    login,
    loginAsGuest,
    logout,
    updateAvatar,
    updateUsername,
    recordMatchResult,
    isFirebaseConfigured
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
