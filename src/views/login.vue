<template>
    <section class="vh-100" style="background-color: #072d13;">
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
                          <!-- SVG path content -->
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
  
                      <div class="pt-1 mb-4">
                        <button id="logInButton" class="btn btn-lg btn-block" type="submit">Login</button>
                      </div>
  
                      <a id="forgotPasswordButton" class="small" href="#!" @click="forgotPassword">Forgot password?</a>
                      <p class="mb-5 pb-lg-2" style="color: #072d13;">Don't have an account? 
                        <router-link id="registerOffer" to="/register" style="color: #4a9161">Register here</router-link>
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
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { auth } from '@/utils/firebase'
  import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
  
  export default {
    name: 'LoginPage',
    setup() {
      const router = useRouter()
      const email = ref('')
      const password = ref('')
  
      const handleLogin = async () => {
        try {
          await signInWithEmailAndPassword(auth, email.value, password.value)
          router.push('/chat')
        } catch (error) {
          console.error(error)
        }
      }
  
      const forgotPassword = async () => {
        if (email.value) {
          try {
            await sendPasswordResetEmail(auth, email.value)
            alert('Password reset email sent!')
          } catch (error) {
            console.error(error)
          }
        }
      }
  
      return {
        email,
        password,
        handleLogin,
        forgotPassword
      }
    }
  }
  </script>
  
  <style scoped>
  @import '@/assets/styles/loginStyle.css';
  @import '@/assets/styles/generalStyle.css';
  </style>