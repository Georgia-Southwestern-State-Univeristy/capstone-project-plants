<template id="wholeBackground">
  <section class="vh-100">
    <div class="container py-5 h-100">
      <div class="row d-flex justify-content-center align-items-center h-100">
        <div class="col col-xl-10">
          <div class="card" style="border-radius: 1rem;">
            <div class="row g-0">
              <div class="col-md-6 col-lg-5 d-none d-md-block">
                <img src="@/assets/logFlowers.jpg" 
                  id="logFlowers" 
                  alt="login form" 
                  class="img-fluid object-fit-cover"
                  style="border-radius: 1rem;"
                  loading="lazy" />
              </div>
              <div class="col-md-6 col-lg-7 d-flex align-items-center">
                <div class="card-body p-4 p-lg-5 text-black">
                  <form @submit.prevent="handleLogin">
                    <div class="d-flex align-items-center mb-3 pb-1">
                      <svg id="flowerLogPage" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-flower3" viewBox="0 0 16 16">
                        <path d="M11.424 8c.437-.052.811-.136 1.04-.268a2 2 0 0 0-2-3.464c-.229.132-.489.414-.752.767C9.886 4.63 10 4.264 10 4a2 2 0 1 0-4 0c0 .264.114.63.288 1.035-.263-.353-.523-.635-.752-.767a2 2 0 0 0-2 3.464c.229.132.603.216 1.04.268-.437.052-.811.136-1.04.268a2 2 0 1 0 2 3.464c.229-.132.489-.414.752-.767C6.114 11.37 6 11.736 6 12a2 2 0 1 0 4 0c0-.264-.114-.63-.288-1.035.263.353.523.635.752.767a2 2 0 1 0 2-3.464c-.229-.132-.603-.216-1.04-.268M9 4a2 2 0 0 1-.045.205q-.059.2-.183.484a13 13 0 0 1-.637 1.223L8 6.142l-.135-.23a13 13 0 0 1-.637-1.223 4 4 0 0 1-.183-.484A2 2 0 0 1 7 4a1 1 0 1 1 2 0M3.67 5.5a1 1 0 0 1 1.366-.366 2 2 0 0 1 .156.142q.142.15.326.4c.245.333.502.747.742 1.163l.13.232-.265.002a13 13 0 0 1-1.379-.06 4 4 0 0 1-.51-.083 2 2 0 0 1-.2-.064A1 1 0 0 1 3.67 5.5m1.366 5.366a1 1 0 0 1-1-1.732l.047-.02q.055-.02.153-.044.202-.048.51-.083a13 13 0 0 1 1.379-.06q.135 0 .266.002l-.131.232c-.24.416-.497.83-.742 1.163a4 4 0 0 1-.327.4 2 2 0 0 1-.155.142M9 12a1 1 0 0 1-2 0 2 2 0 0 1 .045-.206q.058-.198.183-.483c.166-.378.396-.808.637-1.223L8 9.858l.135.23c.241.415.47.845.637 1.223q.124.285.183.484A1.3 1.3 0 0 1 9 12m3.33-6.5a1 1 0 0 1-.366 1.366 2 2 0 0 1-.2.064q-.202.048-.51.083c-.412.045-.898.061-1.379.06q-.135 0-.266-.002l.131-.232c.24-.416.497-.83.742-1.163a4 4 0 0 1 .327-.4q.07-.074.114-.11l.041-.032a1 1 0 0 1 1.366.366m-1.366 5.366a2 2 0 0 1-.155-.141 4 4 0 0 1-.327-.4A13 13 0 0 1 9.74 9.16l-.13-.232.265-.002c.48-.001.967.015 1.379.06q.308.035.51.083.098.024.153.044l.048.02a1 1 0 1 1-1 1.732zM8 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2"></path>
                      </svg>
                      <router-link to="/">
                        <span id="logInTitle" class="h1 fw-bold mb-0">Verdure AI</span>
                      </router-link>
                    </div>

                    <h5 id="signInCommand" style="letter-spacing: 1px;">Sign into your account</h5>

                    <div class="form-outline mb-4">
                      <input 
                        type="email" 
                        id="form2Example17" 
                        class="form-control form-control-lg"
                        v-model="email" />
                      <label id="emailLogIn" class="form-label" for="form2Example17">Email address</label>
                    </div>

                    <div class="form-outline mb-4">
                      <input 
                        type="password" 
                        id="form2Example27" 
                        class="form-control form-control-lg"
                        v-model="password" />
                      <label id="passwordLogIn" class="form-label" for="form2Example27">Password</label>
                    </div>

                    <!-- Error message display -->
                    <div v-if="error" class="alert alert-danger" role="alert">
                      {{ error }}
                    </div>

                    <div class="pt-1 mb-4">
                      <button 
                        id="logInButton" 
                        class="btn btn-lg btn-block" 
                        type="submit"
                        :disabled="isLoading">
                        {{ isLoading ? 'Logging in...' : 'Login' }}
                      </button>
                    </div>

                    <!-- Google login button with original styling -->
                    <div class="pt-1 mb-4">
                      <button 
                        type="button"
                        @click="handleGoogleLogin"
                        :disabled="isLoading"
                        class="btn btn-lg btn-block"
                        style="background-color: white; color: #072d13; border: 1px solid #072d13;">
                        Sign in with Google
                      </button>
                    </div>

                    <a 
                      id="forgotPasswordButton" 
                      class="small" 
                      href="#!"
                      @click.prevent="forgotPassword">
                      Forgot password?
                    </a>
                    <p class="mb-5 pb-lg-2" style="color: #072d13;">
                      Don't have an account? 
                      <router-link 
                        id="registerOffer" 
                        to="/register"
                        style="color: #4a9161">
                        Register here
                      </router-link>
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/store/authStore';  // ✅ Import Pinia store

export default {
  name: 'LoginPage',
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();  // ✅ Use Pinia store
    const { user } = storeToRefs(authStore);  // ✅ Keep user state reactive

    const email = ref('');
    const password = ref('');
    const error = ref('');
    const isLoading = ref(false);

    // ✅ Watch Pinia user state, redirect if logged in
    watchEffect(() => {
      if (user.value) {
        console.log("✅ User logged in, redirecting to /userprofile...");
        router.push('/userprofile');  // ✅ Ensure this matches your route
      }
    });

    // ✅ API-based Login (Pinia action)
    const handleLogin = async () => {
      try {
        isLoading.value = true;
        error.value = '';

        // ✅ Log in via Pinia action
        const response = await authStore.login(email.value, password.value);

        console.log("✅ Login successful:", response);

        // ✅ Redirect on successful login
        if (user.value) {
          console.log("➡️ Redirecting to /userprofile...");
          router.push('/userprofile');
        }
      } catch (err) {
        console.error('❌ Login error:', err);
        error.value = err.response?.data?.error || 'Login failed';

        authStore.addNotification({
          type: 'error',
          message: error.value
        });
      } finally {
        isLoading.value = false;
      }
    };

    return {
      email,
      password,
      error,
      isLoading,
      handleLogin
    };
  }
};
</script>





<style>
@import '@/assets/styles/generalStyle.css';

</style>


<style scoped>


section.vh-100 {
  min-height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
  background-color: #072d13;
  display: flex;
  flex-direction: column;
  overflow-y: auto;  /* Allows scrolling */
}



a:link { 
  text-decoration: none; 
} 
a:visited { 
  text-decoration: none; 
} 
a:hover { 
  text-decoration: none; 
} 
a:active { 
  text-decoration: none; 
}



  img#logFlowers {
    margin-top: 1rem;
    margin-left: 1rem;
    margin-bottom: 1rem;
  }

  span#logInTitle {
    color: #072d13;
    font-size: 30px;
    font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    text-decoration: none;
  }

  svg#flowerLogPage {
  color: #072d13;
  }

  h5#signInCommand {
    font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #072d13;
  }

  label#emailLogIn {
    color: #072d13;
  }

  label#passwordLogIn {
    color: #072d13;
  }

  button#logInButton {
    background-color: #072d13;
    color: white;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-weight: bold;
   
  }

  a#forgotPasswordButton {
    color: #4a9161;
    text-decoration: underline;

  }

  a#registerOffer {
    text-decoration: underline;
  }

/* Claude AI Container CSS */
.container {
  width: 100%;

  padding-right: 1rem;
  padding-left: 1rem;
  margin-right: auto;
  margin-left: auto;
  flex: 1;
}


/* Claude AI Card CSS */
.card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

/* Claude AI Form Control CSS */
.form-control {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  transition: border-color 0.15s ease-in-out;
  
}

/* Claude AI media queries */
@media (max-width: 576px) {
  .card-body {
      padding: 1.5rem;
  }
  
  #logInTitle {
      font-size: 1.5rem;
  }
}

@media (min-width: 577px) and (max-width: 768px) {
  .card-body {
      padding: 2rem;
  }
}

@media (min-width: 769px) {
  .container {
      max-width: 1140px;
  }
  
  .card-body {
      padding: 2.5rem;
  }
}



</style>