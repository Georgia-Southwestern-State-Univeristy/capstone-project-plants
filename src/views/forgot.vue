<template>
    <div class="forgot-password-container">
      <div class="card text-center" style="width: 300px;">
        <div class="card-header h5 text-white bg-verdure">Password Reset</div>
        <div class="card-body px-5">
          <p class="card-text py-2">
            Enter your email address and we'll send you an email with instructions to reset your password.
          </p>
          <div class="form-outline">
            <input 
              type="email" 
              id="typeEmail" 
              v-model="email" 
              class="form-control my-3" 
              placeholder="Email address"
            />
            <label class="form-label" for="typeEmail">Email input</label>
          </div>
          <button @click="resetPassword" class="btn bg-verdure text-white w-100">Reset password</button>
          <div class="d-flex justify-content-between mt-4">
            <router-link to="/login" class="verdure-link">Login</router-link>
            <router-link to="/register" class="verdure-link">Register</router-link>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ForgotPassword',
    data() {
      return {
        email: ''
      }
    },
    methods: {
      resetPassword() {
        // Validate email
        if (!this.validateEmail(this.email)) {
          alert('Please enter a valid email address');
          return;
        }
        
        // Here you would call your API to send the reset password email
        // For example:
        // this.sendResetEmail(this.email);
        
        alert('If your email exists in our system, you will receive password reset instructions shortly.');
        this.email = '';
      },
      validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
      }
    }
  }
  </script>
  
  <style scoped>
  .forgot-password-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #072d13;
    padding: 20px;
  }
  
  .bg-verdure {
    background-color: #072d13 !important;
  }
  
  .verdure-link {
    color: #072d13;
    text-decoration: none;
    font-weight: 500;
  }
  
  .verdure-link:hover {
    text-decoration: underline;
  }
  
  .card {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  </style>