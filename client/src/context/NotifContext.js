import React, { createContext, useContext, useState, useCallback } from 'react';

const NotifContext = createContext(null);

export const NotifProvider = ({ children }) => {
  const [notifs, setNotifs] = useState([]);

  const addNotif = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setNotifs(prev => [...prev, { id, message, type }]);
    setTimeout(() => setNotifs(prev => prev.filter(n => n.id !== id)), duration);
  }, []);

  const success = useCallback((msg) => addNotif(msg, 'success'), [addNotif]);
  const error = useCallback((msg) => addNotif(msg, 'error'), [addNotif]);
  const info = useCallback((msg) => addNotif(msg, 'info'), [addNotif]);
  const warn = useCallback((msg) => addNotif(msg, 'warning'), [addNotif]);

  const remove = (id) => setNotifs(prev => prev.filter(n => n.id !== id));

  return (
    <NotifContext.Provider value={{ notifs, success, error, info, warn, remove }}>
      {children}
    </NotifContext.Provider>
  );
};

export const useNotif = () => {
  const ctx = useContext(NotifContext);
  if (!ctx) throw new Error('useNotif must be used within NotifProvider');
  return ctx;
};

