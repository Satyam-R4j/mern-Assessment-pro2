import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

interface WidgetContextType {
  isOpen: boolean;
  unreadCount: number;
  openWidget: () => void;
  closeWidget: () => void;
  markAsRead: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
}

const WidgetContext = createContext<WidgetContextType | null>(null);

const GUEST_STORAGE_KEY = 'changelog_last_viewed';

export const WidgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, markViewed } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const params: { lastViewed?: string } = {};
      if (!user) {
        const localDate = localStorage.getItem(GUEST_STORAGE_KEY);
        if (localDate) {
          params.lastViewed = localDate;
        }
      }

      const res = await api.get('/changelogs/unread-count', { params });
      if (typeof res.data?.unreadCount === 'number') {
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.log('fetch unread count err:', err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, [user]);

  const markAsRead = async () => {
    setUnreadCount(0);
    try {
      if (user) {
        await markViewed();
      } else {
        localStorage.setItem(GUEST_STORAGE_KEY, new Date().toISOString());
      }
    } catch (err) {
      console.log('mark read err:', err);
    }
  };

  const openWidget = () => {
    setIsOpen(true);
    markAsRead();
  };

  const closeWidget = () => {
    setIsOpen(false);
  };

  return (
    <WidgetContext.Provider
      value={{
        isOpen,
        unreadCount,
        openWidget,
        closeWidget,
        markAsRead,
        fetchUnreadCount,
      }}
    >
      {children}
    </WidgetContext.Provider>
  );
};

export const useWidget = () => {
  const ctx = useContext(WidgetContext);
  if (!ctx) {
    throw new Error('useWidget must be used within a WidgetProvider');
  }
  return ctx;
};
