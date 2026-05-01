import React from 'react';
import { useNotif } from '../../context/NotifContext';

const Toast = () => {
  const { notifs, remove } = useNotif();

  return (
    <div className="toast-container">
      {notifs.map((n) => (
        <div key={n.id} className={`toast toast-${n.type}`}>
          <span className="toast-icon">
            {n.type === 'success' ? '✓' : n.type === 'error' ? '✕' : n.type === 'warning' ? '⚠' : 'ℹ'}
          </span>
          <span className="toast-message">{n.message}</span>
          <button className="toast-close" onClick={() => remove(n.id)}>×</button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
