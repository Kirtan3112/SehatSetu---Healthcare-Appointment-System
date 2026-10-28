import React, { useState, useEffect } from 'react';
import { api } from '../services/4631_api';
import { Bell, CheckCheck, Clock } from 'lucide-react';

export default function NotificationDropdown({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, readStatus: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notification-dropdown">
      <div className="notification-header">
        <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Bell size={15} color="var(--primary-400)" />
          Notifications
        </span>
        <button
          onClick={handleMarkAllRead}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: 'var(--primary-400)', 
            fontSize: '0.78rem', 
            cursor: 'pointer', 
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <CheckCheck size={14} />
          Mark all read
        </button>
      </div>

      <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
        {loading ? (
          <p style={{ padding: '28px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Loading alerts...
          </p>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '36px 20px', textAlign: 'center' }}>
            <Bell size={28} color="var(--text-light)" style={{ marginBottom: '8px', opacity: 0.5 }} />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              No notifications yet.
            </p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n._id}
              className={`notification-item ${!n.readStatus ? 'unread' : ''}`}
              onClick={() => handleMarkRead(n._id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary-400)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {n.type.replace('_', ' ')}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Clock size={11} />
                  {new Date(n.sentAt || n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.4 }}>
                {n.message}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
