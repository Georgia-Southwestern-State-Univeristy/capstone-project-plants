<!-- src/App.vue -->

<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import { useChatStore } from '@/store/chatStore';

export default {
  setup() {
    const chatStore = useChatStore();

    console.log("🌐 Global Chat Store Initialized:", chatStore);
    console.log("🌐 Current Messages in Store:", chatStore.messages);

    return { chatStore };
  }
};

</script>

<style>
@import '@/assets/styles/generalStyle.css';
</style>
