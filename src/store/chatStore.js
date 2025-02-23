import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useChatStore = defineStore('chat', () => {
  const messages = ref([]); // ✅ Ensure messages is a reactive array

  const sendMessage = (message) => {
    if (!message || typeof message !== "object") {
      console.error("❌ Cannot add undefined or invalid message to chatStore.", message);
      return;
    }

    console.log("📢 [Chat Store] Adding Message:", message);
    messages.value.push(message); // ✅ Access .value when modifying reactive state
    console.log("✅ [Chat Store] Updated Messages:", messages.value);
  };

  return { messages, sendMessage };
});
