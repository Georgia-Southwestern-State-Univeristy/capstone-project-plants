<template>
    <div>
      <!-- Overlay -->
      <div
        v-if="open"
        class="sidebar-overlay"
        @click="$emit('close')"
      ></div>
  
      <!-- Sidebar -->
      <aside :class="['sidebar-drawer', { open }]">
        <div class="sidebar-header">
          <!-- <img src="@/assets/leaf-icon.svg" class="logo" /> -->
          <span class="app-name">Verdure AI</span>
          <button class="close-btn" @click="$emit('close')">✕</button>
        </div>
  
        <nav class="sidebar-links">
          <router-link to="/chat" @click="$emit('close')">Chat</router-link>
          <router-link to="/plantboard" @click="$emit('close')">Plant Gallery</router-link>
          <router-link to="/userProfile" @click="$emit('close')">Profile</router-link>
          <button class="logout-btn" @click="handleSignOut">Sign Out</button>
        </nav>
      </aside>
    </div>
  </template>
  
  <script>
  import { useAuthStore } from '@/store/authStore';
  import { useRouter } from 'vue-router';
  
  export default {
    props: {
      open: Boolean
    },
    setup() {
      const authStore = useAuthStore();
      const router = useRouter();

      // 🔹 Handle user sign-out
      const handleSignOut = async () => {
        await authStore.logout();
        router.push('/login');
      };
  
    return { 
      handleSignOut
      };
    }
  };
  </script>
  
  <style scoped>
  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 30;
  }
  
  .sidebar-drawer {
    position: fixed;
    top: 0;
    left: -260px;
    height: 100%;
    width: 240px;
    background-color: #2f1b0c;
    color: white;
    z-index: 40;
    transition: left 0.3s ease;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    box-shadow: 2px 0 12px rgba(0, 0, 0, 0.25);
  }
  
  .sidebar-drawer.open {
    left: 0;
  }
  
  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .logo {
    width: 24px;
    height: 24px;
  }
  
  .app-name {
    font-weight: bold;
    font-size: 1.1rem;
    margin-left: 0.5rem;
  }
  
  .close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 1.25rem;
    cursor: pointer;
  }
  
  .sidebar-links {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .sidebar-links a,
  .logout-btn {
    color: white;
    text-decoration: none;
    font-weight: 500;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    padding: 0.25rem 0;
  }
  
  .sidebar-links a:hover,
  .logout-btn:hover {
    color: #9ef09e;
  }
  </style>
  