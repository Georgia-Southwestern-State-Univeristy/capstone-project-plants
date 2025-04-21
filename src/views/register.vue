# register.vue
<template id="wholeBackground">
  <section class="vh-100">
    <div class="container h-100">
      <div class="row d-flex justify-content-center align-items-center h-100">
        <div class="col-lg-12 col-xl-11">
          <div class="card text-black" style="border-radius: 25px;">
            <div class="card-body p-md-5">
              <div class="row justify-content-center">
                <div class="col-md-10 col-lg-6 col-xl-5 order-2 order-lg-1">
                  <p id="registerTitle" 
                     class="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4" 
                     style="color:#072d13; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                     Sign up
                  </p>

                  <form class="mx-1 mx-md-4" @submit.prevent="handleRegister">
                    <!-- Error display -->
                    <div v-if="error" class="alert alert-danger mb-4">
                      {{ error }}
                    </div>

                    <!-- Name input -->
                    <div class="d-flex flex-row align-items-center mb-4">
                      <i class="fas fa-user fa-lg me-3 fa-fw"></i>
                      <div class="form-outline flex-fill mb-0">
                        <input 
                          type="text" 
                          id="form3Example1c" 
                          class="form-control"
                          v-model="name" 
                          required />
                        <label 
                          style="color:#072d13; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-weight: bold;" 
                          class="form-label" 
                          for="form3Example1c">
                          Your Name
                        </label>
                      </div>
                    </div>

                    <!-- Email input -->
                    <div class="d-flex flex-row align-items-center mb-4">
                      <i class="fas fa-envelope fa-lg me-3 fa-fw"></i>
                      <div class="form-outline flex-fill mb-0">
                        <input 
                          type="email" 
                          id="form3Example3c" 
                          class="form-control"
                          v-model="email" 
                          required />
                        <label 
                          style="color:#072d13; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-weight: bold;" 
                          class="form-label" 
                          for="form3Example3c">
                          Your Email
                        </label>
                      </div>
                    </div>

                    <!-- Password input -->
                    <div class="d-flex flex-row align-items-center mb-4">
                      <i class="fas fa-lock fa-lg me-3 fa-fw"></i>
                      <div class="form-outline flex-fill mb-0">
                        <input 
                          type="password" 
                          id="form3Example4c" 
                          class="form-control"
                          v-model="password" 
                          required />
                        <label 
                          style="color:#072d13; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-weight: bold;" 
                          class="form-label" 
                          for="form3Example4c">
                          Password
                        </label>
                      </div>
                    </div>

                    <!-- Confirm Password input -->
                    <div class="d-flex flex-row align-items-center mb-4">
                      <i class="fas fa-key fa-lg me-3 fa-fw"></i>
                      <div class="form-outline flex-fill mb-0">
                        <input 
                          type="password" 
                          id="form3Example4cd" 
                          class="form-control"
                          v-model="confirmPassword" 
                          required />
                        <label 
                          style="color:#072d13; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-weight: bold;" 
                          class="form-label" 
                          for="form3Example4cd">
                          Repeat your password
                        </label>
                      </div>
                    </div>

                    <!-- Submit button -->
                    <div class="d-flex justify-content-around mx-4 mb-3 mb-lg-4 gap-2">
                      <!-- Register button -->
                      <button 
                        type="submit" 
                        class="btn btn-primary btn-lg flex-fill d-flex align-items-center justify-content-center"
                        style="background-color: #072d13; border: none; min-width: 180px; height: 48px;"
                      >
                        {{ isLoading ? 'Registering...' : 'Register' }}
                      </button>

                      <!-- Google button -->
                      <button 
                        type="button" 
                        @click="handleGoogleLogin"
                        class="btn btn-light btn-lg flex-fill d-flex align-items-center justify-content-center border"
                        style="min-width: 180px; height: 48px; white-space: nowrap; gap: 10px;"
                        :disabled="isLoading"
                      >
                        <img src="@/assets/google-icon.png" alt="Google" style="height: 20px;" />
                        Sign up with Google
                      </button>
                    </div>
                  </form>

                  <div class="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                    <p class="mb-3" style="color: #072d13;">
                      Already have an account? 
                      <router-link 
                        id="loginOffer" 
                        to="/login"
                        style="color: #4a9161">
                        Login here
                      </router-link>
                    </p>
                  </div>
                </div>
                <!-- Image section -->
                <div class="col-md-10 col-lg-6 col-xl-7 d-flex align-items-center order-1 order-lg-2">
                  <img src="@/assets/signFlowers.jpg" 
                       id="signFlowers"
                       class="img-fluid" 
                       alt="Sample image">
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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { registerUser } from '@/api';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { storeToRefs } from 'pinia';

export default {
  name: 'RegisterPage',
  setup() {
    const router = useRouter();
    const authStore = useAuthStore(); // ✅ Use Pinia store
    const { user } = storeToRefs(authStore); // ✅ Reactive state
    const notificationStore = useNotificationStore();

    // Form data
    const name = ref('');
    const email = ref('');
    const password = ref('');
    const confirmPassword = ref('');
    const error = ref('');
    const isLoading = ref(false);

    // Computed property for form validation
    const isFormValid = computed(() => {
      return name.value.trim() &&
             email.value.trim() &&
             password.value &&
             password.value === confirmPassword.value;
            
    });

    const handleRegister = async () => {
      if (!isFormValid.value) {
        error.value = 'Please fill all fields correctly.';
        return;
      }

      try {
        isLoading.value = true;
        error.value = '';

        // ✅ Call the backend API instead of Firebase directly
        const response = await registerUser(email.value, password.value, name.value);

        if (!response.success) {
          throw new Error(response.error || 'Registration failed');
        }

        // ✅ Use Pinia store to save user data
        authStore.user = response.user;
        notificationStore.addNotification({
          type: 'success',
          message: 'Registration successful!'
        });

        // ✅ Navigate after successful registration
        router.push('/chat');
      } catch (err) {
        console.error("❌ Registration error:", err);
        error.value = err.message;

        notificationStore.addNotification({
          type: 'error',
          message: err.message || 'Registration failed'
        });
      } finally {
        isLoading.value = false;
      }
    };

    const handleGoogleLogin = async () => {
      try {
        await authStore.googleLogin();
        router.push('/userprofile');
      } catch (error) {
        console.error("Google login failed:", error);
      }
    };

    return {
      name,
      email,
      password,
      confirmPassword,
      error,
      isLoading,
      isFormValid,
      handleRegister,
      handleGoogleLogin
    };
  }
};
</script>


<style>
@import '@/assets/styles/generalStyle.css';

</style>


<style scoped>

a#loginOffer {
    text-decoration: underline;
    
  }


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




img#logFlowers {
    margin-top: 50px;
    margin-left: 20px;
  }

  span#logInTitle {
    color: #072d13;
    font-size: 30px;
    font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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

  }

  /* Claude AI media queries */
  @media (max-width: 576px) {
    .form-outline {
      width: 100%;
    }
    
    .card-body {
      padding: 1rem !important;
    }
  }
  
  @media (min-width: 577px) and (max-width: 768px) {
    .card-body {
      padding: 1.5rem !important;
    }
  }
  
  /* Ensure proper spacing on various screen sizes */
  .form-control {
    padding: clamp(0.5rem, 2vw, 0.75rem);
    font-size: clamp(14px, 2vw, 16px);
  }
  
  /* Improve touch targets for mobile devices */
  .form-check-input {
    min-width: 20px;
    min-height: 20px;
    margin-top: 0.2rem;
  }
  
  /* Better button sizing for different devices */
  .btn-lg {
    padding: clamp(0.5rem, 2vw, 1rem) clamp(1rem, 4vw, 2rem);
    font-size: clamp(14px, 2vw, 16px);
  }






/* Additional functional styles */
.alert {
  margin-bottom: 1rem;
  padding: 0.75rem 1.25rem;
  border-radius: 0.375rem;
}

.alert-danger {
  background-color: #f8d7da;
  border-color: #f5c2c7;
  color: #842029;
}

button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}



</style>