import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  lastFetchTime: null,
};

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setNotifications: (state, action) => {
      state.notifications = action.payload;
      state.lastFetchTime = Date.now();
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (action.payload.status_c === 'unread') {
        state.unreadCount += 1;
      }
    },
    updateNotification: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.notifications.findIndex(n => n.Id === id);
      if (index !== -1) {
        const wasUnread = state.notifications[index].status_c === 'unread';
        const isNowRead = updates.status_c === 'read';
        
        state.notifications[index] = { ...state.notifications[index], ...updates };
        
        if (wasUnread && isNowRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    },
    removeNotification: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n.Id === notificationId);
      if (notification && notification.status_c === 'unread') {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter(n => n.Id !== notificationId);
    },
    markAsRead: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n.Id === notificationId);
      if (notification && notification.status_c === 'unread') {
        notification.status_c = 'read';
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    bulkMarkAsRead: (state, action) => {
      const notificationIds = action.payload;
      let updatedCount = 0;
      
      notificationIds.forEach(id => {
        const notification = state.notifications.find(n => n.Id === id);
        if (notification && notification.status_c === 'unread') {
          notification.status_c = 'read';
          updatedCount++;
        }
      });
      
      state.unreadCount = Math.max(0, state.unreadCount - updatedCount);
    },
    clearError: (state) => {
      state.error = null;
    },
    resetNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.loading = false;
      state.error = null;
      state.lastFetchTime = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setNotifications,
  setUnreadCount,
  addNotification,
  updateNotification,
  removeNotification,
  markAsRead,
  bulkMarkAsRead,
  clearError,
  resetNotifications
} = notificationSlice.actions;

export default notificationSlice.reducer;