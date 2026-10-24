export const AVATARS = [
  { id: 'cyber-ninja', name: 'Cyber Ninja', icon: '⚡', color: '#8b5cf6', bg: 'linear-gradient(135deg, #6d28d9, #8b5cf6)' },
  { id: 'neon-viper', name: 'Neon Viper', icon: '🐍', color: '#10b981', bg: 'linear-gradient(135deg, #059669, #10b981)' },
  { id: 'apex-titan', name: 'Apex Titan', icon: '🛡️', color: '#3b82f6', bg: 'linear-gradient(135deg, #2563eb, #3b82f6)' },
  { id: 'solar-phoenix', name: 'Solar Phoenix', icon: '🔥', color: '#f59e0b', bg: 'linear-gradient(135deg, #d97706, #f59e0b)' },
  { id: 'ghost-hacker', name: 'Ghost Hacker', icon: '👾', color: '#06b6d4', bg: 'linear-gradient(135deg, #0891b2, #06b6d4)' },
  { id: 'quantum-knight', name: 'Quantum Knight', icon: '⚔️', color: '#ec4899', bg: 'linear-gradient(135deg, #db2777, #ec4899)' },
  { id: 'void-walker', name: 'Void Walker', icon: '🌌', color: '#a855f7', bg: 'linear-gradient(135deg, #7e22ce, #a855f7)' },
  { id: 'astro-pilot', name: 'Astro Pilot', icon: '🚀', color: '#14b8a6', bg: 'linear-gradient(135deg, #0d9488, #14b8a6)' },
];

export const getAvatarById = (id) => {
  return AVATARS.find(a => a.id === id) || AVATARS[0];
};
