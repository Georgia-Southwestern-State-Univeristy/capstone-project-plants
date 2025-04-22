<template>
  <div id="app">
    <button
      v-if="!sidebarOpen && !hideNav"
      class="menu-toggle"
      @click="sidebarOpen = true"
    >
      ☰
    </button>

    <SidebarNav v-if="!hideNav" :open="sidebarOpen" @close="sidebarOpen = false" />

    <router-view />
  </div>
</template>

<script>
import { useRoute } from 'vue-router';
import SidebarNav from '@/views/NavBar.vue';

export default {
  components: { SidebarNav },
  data() {
    return {
      sidebarOpen: false
    };
  },
  computed: {
    hideNav() {
      const hiddenRoutes = ['/', '/login', '/register'];
      return hiddenRoutes.includes(this.$route.path);
    }
  }
};
</script>


<style scoped>
.menu-toggle {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 50;
  background: #593317;
  color: white;
  border: none;
  font-size: 1.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
}
</style>
