import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useChatStore = defineStore('chat', {
  state: () => ({
    chatHistory: [],
  }),

  actions: {
    sendMessage(message) {
      this.chatHistory.push(message);
    },

    loadChatHistory(userId) {
      // Load chat history from Firebase or API
      return new Promise((resolve) => {
        setTimeout(() => resolve([]), 500);
      });
    }
  },

  getters: {
    getChatHistory: (state) => state.chatHistory,
  }
});
