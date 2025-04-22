<template>
  <div id="app">
    <button v-if="!sidebarOpen" class="menu-toggle" @click="sidebarOpen = true">
      ☰
    </button>

    <SidebarNav :open="sidebarOpen" @close="sidebarOpen = false" />
    <router-view />
  </div>
</template>

<script>
import SidebarNav from '@/views/NavBar.vue';

export default {
  components: { SidebarNav },
  data() {
    return {
      sidebarOpen: false
    };
  }
};
</script>

<style scoped>
.menu-toggle {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 50;
  background: #2f1b0c;
  color: white;
  border: none;
  font-size: 1.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
}
</style>
