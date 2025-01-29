<template>
    <section class="vh-100" style="background-color: #072d13;">
      <div class="container h-100">
        <div class="row d-flex justify-content-center align-items-center h-100">
          <div class="col-lg-12 col-xl-11">
            <div class="card text-black" style="border-radius: 25px;">
              <div class="card-body p-md-5">
                <div class="row justify-content-center">
                  <div class="col-md-10 col-lg-6 col-xl-5 order-2 order-lg-1">
                    <p id="registerTitle" class="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4">Sign up</p>
  
                    <form class="mx-1 mx-md-4" @submit.prevent="handleRegister">
                      <div class="d-flex flex-row align-items-center mb-4">
                        <i class="fas fa-user fa-lg me-3 fa-fw"></i>
                        <div class="form-outline flex-fill mb-0">
                          <input 
                            type="text" 
                            id="form3Example1c" 
                            class="form-control"
                            v-model="name" />
                          <label class="form-label" for="form3Example1c">Your Name</label>
                        </div>
                      </div>
  
                      <div class="d-flex flex-row align-items-center mb-4">
                        <i class="fas fa-envelope fa-lg me-3 fa-fw"></i>
                        <div class="form-outline flex-fill mb-0">
                          <input 
                            type="email" 
                            id="form3Example3c" 
                            class="form-control"
                            v-model="email" />
                          <label class="form-label" for="form3Example3c">Your Email</label>
                        </div>
                      </div>
  
                      <div class="d-flex flex-row align-items-center mb-4">
                        <i class="fas fa-lock fa-lg me-3 fa-fw"></i>
                        <div class="form-outline flex-fill mb-0">
                          <input 
                            type="password" 
                            id="form3Example4c" 
                            class="form-control"
                            v-model="password" />
                          <label class="form-label" for="form3Example4c">Password</label>
                        </div>
                      </div>
  
                      <div class="d-flex flex-row align-items-center mb-4">
                        <i class="fas fa-key fa-lg me-3 fa-fw"></i>
                        <div class="form-outline flex-fill mb-0">
                          <input 
                            type="password" 
                            id="form3Example4cd" 
                            class="form-control"
                            v-model="confirmPassword" />
                          <label class="form-label" for="form3Example4cd">Repeat your password</label>
                        </div>
                      </div>
  
                      <div class="form-check d-flex justify-content-center mb-5">
                        <input 
                          class="form-check-input me-2" 
                          type="checkbox" 
                          v-model="termsAccepted"
                          id="form2Example3c" />
                        <label class="form-check-label" for="form2Example3">
                          I agree to the <a href="#!">Terms of service</a>
                        </label>
                      </div>
  
                      <div class="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                        <button type="submit" class="btn btn-primary btn-lg">Register</button>
                      </div>
                    </form>
                  </div>
                  <div class="col-md-10 col-lg-6 col-xl-7 d-flex align-items-center order-1 order-lg-2">
                    <img src="@/assets/signFlowers.jpg" class="img-fluid" alt="Sample image">
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
  import { auth, db } from '@/utils/firebase'
  import { createUserWithEmailAndPassword } from 'firebase/auth'
  import { doc, setDoc } from 'firebase/firestore'
  
  export default {
    name: 'RegisterPage',
    setup() {
      const router = useRouter()
      const name = ref('')
      const email = ref('')
      const password = ref('')
      const confirmPassword = ref('')
      const termsAccepted = ref(false)
  
      const handleRegister = async () => {
        if (password.value !== confirmPassword.value) {
          alert('Passwords do not match')
          return
        }
  
        if (!termsAccepted.value) {
          alert('Please accept the terms of service')
          return
        }
  
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            name: name.value,
            email: email.value
          })
          router.push('/chat')
        } catch (error) {
          console.error(error)
        }
      }
  
      return {
        name,
        email,
        password,
        confirmPassword,
        termsAccepted,
        handleRegister
      }
    }
  }
  </script>
  
  <style scoped>
  @import '@/assets/styles/registerStyle.css';
  @import '@/assets/styles/generalStyle.css';
  </style>