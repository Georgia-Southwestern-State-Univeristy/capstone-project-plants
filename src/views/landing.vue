<template>
    <div>
      <nav id="landingPageTitleBackground" class="navbar navbar-expand-lg navbar-dark">
        <div class="container px-5">
          <div class="d-flex align-items-center">
            <svg id="flowerLandingPage" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-flower3" viewBox="0 0 16 16">
              <!-- SVG path from original -->
            </svg>
            <router-link id="landingPageTitle" class="navbar-brand" to="/">Verdure AI</router-link>
          </div>

          <button 
      class="navbar-toggler" 
      type="button" 
      data-bs-toggle="collapse" 
      data-bs-target="#navbarSupportedContent" 
      aria-controls="navbarSupportedContent" 
      aria-expanded="false" 
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon"></span>
    </button>

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
        <div class="content-section">
          <div id="healthcareComment" class="card mb-4">
            <div class="card-body">
              The Best in Plant Healthcare
            </div>
          </div>
  
          <ul id="promotionBullets">
            <li>Photo Scanning</li>
            <li>Online Plant Database</li>
            <li>Quick Information and No Hassle</li>
          </ul>
          
          <div class="button-section">

            
            <router-link class="btn-link" to="/login" 
            style="text-decoration: none; color: inherit;">
              <button id="logInButton">Log in</button>
            </router-link>
              


              
            <router-link class="btn-link" to="/register" 
            style="text-decoration: none; color: inherit;">
            <button id="createAccountButton">Create Account</button>
            </router-link>
          

          
          </div>
        </div>
        

       <div class="image-section">
    <div class="circular-container">
      <img id="landingImagePlant" src="@/assets/mainPlantImage.png" alt="Plant">
    </div>
      </div>
    </div>
    </div>

    

      
    
  


  </template>
  
  <script>
  export default {
    name: 'LandingPage'
  }
  </script>
  
<style>

@import '@/assets/styles/generalStyle.css';

</style>


<style scoped>





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

/* Claude AI keyframes */
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
}
  
  /* Claude AI Transform Commands */
  .image-container img {
    will-change: transform;
    transform-origin: center center;
  }

img#landingImagePlant {
 
  max-width: 85%;
  max-height: 85%;
  animation: float 6s ease-in-out infinite; /* Claude AI */
  position: relative; /* Claude AI */
  object-fit: contain; /* Claude AI */
  transform-origin: center; /* Claude AI */
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;

}

.circular-container {
  width: min(400px, 100%); /* Use the smaller of 400px or 100% of parent width */
  height: min(400px, 100vw); /* Keep it circular by maintaining aspect ratio */
  border-radius: 50%;
  background: linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, rgba(144, 238, 144, 0.5) 100%);
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 5px solid white;
  position: relative;
}


img#landingPageImage {
  max-width: 85%;
  max-height: 85%;
  object-fit: contain;
  animation: float 6s ease-in-out infinite;
  transform-origin: center;
}

img#landingPageImageRim {
  height: 400px;
  width: 400px;
  position: absolute;
  left: 650px;
  bottom: 500px;
  top: 200px;
  right: 5px;
  border-style: solid; 
  border-color: white;
  border-width: 5px;
  animation: float 6s ease-in-out 0.5s infinite;
}

 svg#flowerLandingPage {
  color: white;
}

ul#promotionBullets{
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin-top: 75px;
  margin-left: 2.5rem;
  line-height: 2; /* Claude AI */
  font-size: clamp(0.875rem, 2vw, 1rem); /* Claude AI */
  margin-bottom: 2.5rem;
}

div#healthcareComment {

    background-color: #072d13;
    border-color: white;
    width: 20%;
    margin-left: 2.5rem;
    text-align: center;
    font-weight: bold;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    border: 5px solid;
    color: white;
    width: fit-content;
    padding: 0.75rem 1.5rem;
    border-radius: 20px;
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
}


#healthcareComment .card-body {
  color: white;
  font-weight: bold;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 0;
  text-align: center;
}


button#logInButton {
  color: #072d13;
  background-color: white;
  border: none;
  padding-left: 35px;
  padding-right: 35px;
  padding-top: 10px;
  padding-bottom: 10px;
  display: flex; /* Claude AI */
  flex-direction: column; /* Claude AI */
  gap: 1rem; /* Claude AI */
  margin-top: 2rem; /* Claude AI */
  margin-left: 6rem; /* Claude AI */
  font-weight: bold;
  border-radius: 4px;
  align-items: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  text-decoration: none;
}

button#createAccountButton {
  padding-left: 35px;
  padding-right: 35px;
  padding-top: 10px;
  padding-bottom: 10px;
  margin-top: 2rem; /* Claude AI */
  margin-left: 6rem; /* Claude AI */
  font-weight: bold;
  border-radius: 4px;
  align-items: center;
  display: flex; /* Claude AI */
  flex-direction: column; /* Claude AI */
  gap: 1rem; /* Claude AI */
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  text-decoration: none;
  color: white;
  background-color: #072d13;
  border-color: white;
  border: solid;
}



/* Add this to the <style scoped> section in landing.vue */
.button-section .btn-link {
  display: inline-block;
  width: 28%; /* Match the width of your buttons */
}

.button-section button {
  width: 100% !important; /* Override the 28% width in the original styles */
  margin-left: 0 !important; /* Remove the margin from buttons */
}

/* Add a proper margin to the container instead */
.button-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 6rem; /* Move the left margin here */
  gap: 2rem; /* This replaces the top margin between buttons */
}



.button-container {
  display: flex; /* Claude AI */
  flex-direction: column; /* Claude AI */
  gap: 1rem; /* Claude AI */
  max-width: 300px;
}

 li#landingPageLogLink{
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-weight: bold;
}

li#landingPageSignLink{
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-weight: bold;
}

 nav#landingPageTitleBackground {
  background-color: #072d13;
  padding: 1rem 0; /* Claude AI */
  width: 100%; /* Claude AI */
}

.navbar-brand { /* Claude AI */
  align-items: center; /* Claude AI */
  gap: 0.5rem; /* Claude AI */
}


a#landingPageTitle {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-weight: bold;
  color: white;
  text-decoration: none;
}

header#greenHeaderPlantPicture {
  background-color: #072d13;
}

div#landingPageContentBody{
  background-color: #072d13;
  padding: clamp(1rem, 5vw, 4rem);
  min-height: calc(100vh - 76px);
  display: grid;
  grid-template-columns: minmax(300px, 1fr) minmax(300px, 1fr); /* Keep two columns */
  gap: var(--spacing-md);
  align-items: center;
  overflow-x: hidden; /* Prevent horizontal scrolling */
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

}

.image-section {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.content-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 1rem;
}


/* Claude AI media queries */


/* Claude AI card body rules */
.card-body {
  font-size: clamp(1rem, 2.5vw, 1.25rem);
}

@media (max-width: 992px) {
  #landingPageContentBody {
    grid-template-columns: 1fr;
  }
  
  .content-section {
    text-align: center;
    align-items: center;
  }
  
  .button-section {
    margin: 0 auto;
  }
  
  .image-section {
    margin-top: 2rem;
  }
  
  .circular-container {
    width: 300px;
    height: 300px;
  }
  
  #promotionBullets {
    text-align: left;
    display: inline-block;
  }
}

@media (max-width: 576px) {
  .circular-container {
    width: 250px;
    height: 250px;
  }
  
  #healthcareComment {
    width: auto;
    max-width: 80%;
  }
  
  .button-section {
    width: 100%;
    max-width: 100%;
  }
}

/* Ensure hamburger works correctly */
.navbar-toggler:focus {
  box-shadow: none;
}

.navbar-toggler-icon {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%28255, 255, 255, 1%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
}

  </style>