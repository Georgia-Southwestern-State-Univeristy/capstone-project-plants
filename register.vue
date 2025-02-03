# register.vue
<template>
  <section class="vh-100" style="background-color: #072d13;">
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

                    <!-- Terms of service checkbox -->
                    <div class="form-check d-flex justify-content-center mb-5">
                      <input 
                        class="form-check-input me-2" 
                        type="checkbox"
                        v-model="termsAccepted"
                        id="form2Example3c" />
                      <label 
                        style="color:#072d13; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;" 
                        class="form-check-label" 
                        for="form2Example3">
                        I agree all statements in <a style="color: #4a9161" href="#!">Terms of service</a>
                      </label>
                    </div>

                    <!-- Submit button -->
                    <div class="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                      <button 
                        type="submit" 
                        style="background-color: #072d13; border: none;"
                        class="btn btn-primary btn-lg"
                        :disabled="isLoading || !isFormValid">
                        {{ isLoading ? 'Registering...' : 'Register' }}
                      </button>
                    </div>
                  </form>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { registerWithEmail } from '@/utils/firebase'
import { useStore } from 'vuex'

export default {
  name: 'RegisterPage',
  setup() {
    const router = useRouter()
    const store = useStore()
    
    // Form data
    const name = ref('')
    const email = ref('')
    const password = ref('')
    const confirmPassword = ref('')
    const termsAccepted = ref(false)
    const error = ref('')
    const isLoading = ref(false)

    // Computed property for form validation
    const isFormValid = computed(() => {
      return name.value.trim() &&
             email.value.trim() &&
             password.value &&
             password.value === confirmPassword.value &&
             termsAccepted.value
    })

    const handleRegister = async () => {
    if (!isFormValid.value) {
        error.value = 'Please fill all fields correctly and accept the terms';
        return;
    }

    try {
        isLoading.value = true;
        error.value = '';
        
        const user = await registerWithEmail(email.value, password.value, name.value);
        
        // Use the store to save user data
        store.commit('SET_USER', user);
        store.dispatch('addNotification', {
            type: 'success',
            message: 'Registration successful!'
        });
        
        router.push('/chat');
    } catch (err) {
        error.value = err.message;
        store.dispatch('addNotification', {
            type: 'error',
            message: 'Registration failed'
        });
    } finally {
        isLoading.value = false;
    }
};

    return {
      name,
      email,
      password,
      confirmPassword,
      termsAccepted,
      error,
      isLoading,
      isFormValid,
      handleRegister
    }
  }
}
</script>

<style scoped>
@import '@/assets/styles/registerStyle.css';
@import '@/assets/styles/generalStyle.css';

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