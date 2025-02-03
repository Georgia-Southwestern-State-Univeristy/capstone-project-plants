<template>
    <div>
      <nav id="landingPageTitleBackground" class="navbar navbar-expand-lg navbar-dark">
        <div class="container px-5">
          <div class="fs-4 mb-3">
            <svg id="flowerLandingPage" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-flower3" viewBox="0 0 16 16">
              <!-- SVG path from original -->
            </svg>
            <router-link id="landingPageTitle" class="navbar-brand" to="/">Verdure AI</router-link>
          </div>
          <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
              <li id="landingPageLogLink" class="nav-item">
                <router-link class="nav-link" to="/login">Login</router-link>
              </li>
              <li id="landingPageSignLink" class="nav-item">
                <router-link class="nav-link" to="/register">Sign Up</router-link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
  
      <div id="landingPageContentBody">
        <div>
          <div id="healthcareComment" class="card">
            <div class="card-body">
              The Best in Plant Healthcare
            </div>
          </div>
  
          <ul id="promotionBullets">
            <li>Photo Scanning</li>
            <li>Online Plant Database</li>
            <li>Quick Information and No Hassle</li>
          </ul>
          
          <div id="button-container">
            <router-link to="/login">
              <button id="logInButton" class="btn btn-primary">Log in</button>
            </router-link>
            <router-link to="/register">
              <button id="createAccountButton" class="btn btn-outline-light">Create Account</button>
            </router-link>
          </div>
        </div>
        
        <div class="img-container">
          <img id="landingPageImageRim" src="@/assets/landingPagePicBackgroundRim.jpg" class="rounded-circle">
          <img id="landingPageImage" src="@/assets/landingPagePicBackground.jpg" class="rounded-circle">
          <img id="landingImagePlant" src="@/assets/mainPlantImage.png">
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'LandingPage'
  }
  </script>
  
  <style scoped>
  /* Import original CSS */
  @import '@/assets/styles/indexStyle.css';
  @import '@/assets/styles/generalStyle.css';
  </style>