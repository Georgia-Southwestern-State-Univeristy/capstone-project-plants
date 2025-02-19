import { defineStore } from 'pinia';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
  }),

  actions: {
    addNotification(notification) {
      this.notifications.push({
        id: Date.now(),
        ...notification
      });

      setTimeout(() => {
        this.notifications = this.notifications.filter(n => n.id !== notification.id);
      }, notification.timeout || 5000);
    }
  },

  getters: {
    getNotifications: (state) => state.notifications,
  }
});
