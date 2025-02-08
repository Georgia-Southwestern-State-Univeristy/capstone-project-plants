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

            <button id="logInButton">
            <router-link to="/login" style="text-decoration: none; color: inherit;">
              Log in
            </router-link>
              </button>


              <button id="createAccountButton">
            <router-link to="/register" 
            style="text-decoration: none; color: inherit;">
              Create Account
            </router-link>
          </button>

            <router-link to="/chat">
        <button class="btn btn-primary" >Go to Chat</button>
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
    0% { transform: translateY(0px) scale(1); }
    50% { transform: translateY(-20px) scale(1.02); }
    100% { transform: translateY(0px) scale(1); }
  }
  
  /* Claude AI Transform Commands */
  .image-container img {
    will-change: transform;
    transform-origin: center center;
  }

img#landingImagePlant {
 
  max-width: 100%; /* Claude AI */
  animation: float 6s ease-in-out infinite; /* Claude AI */
  position: relative; /* Claude AI */
  height: auto; /* Claude AI */
  object-fit: contain; /* Claude AI */
  transform-origin: center; /* Claude AI */
}

.image-container {
  position: relative; /* Claude AI */
  width: 100%; /* Claude AI */
  aspect-ratio: 1; /* Claude AI */
  overflow: hidden; /* Claude AI */
}


img#landingPageImage {
  height: 400px;
  width: 400px;
  position: absolute;
  left: 700px;
  bottom: 500px;
  top: 200px;
  right: 5px;
  animation: float 6s ease-in-out infinite;
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
  margin-left: 100px;
  line-height: 1.5; /* Claude AI */
  font-size: clamp(0.875rem, 2vw, 1rem); /* Claude AI */
}

div#healthcareComment {

    background-color: #072d13;
    border-color: white;
    width: 20%;
    margin-left: 100px;
    text-align: center;
    font-weight: bold;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    border: 5px solid;
    color: white;
    width: fit-content;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    margin-bottom: 2rem;
}


button#logInButton {
  color: #072d13;
  background-color: white;
  border: none;
  width: 25%;
  padding: 12px;
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
  width: 25%;
  padding: 12px;
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
}

.button-container {
  display: flex; /* Claude AI */
  flex-direction: column; /* Claude AI */
  gap: 1rem; /* Claude AI */
  margin-top: 2rem; /* Claude AI */
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
  padding: 1rem; /* Claude AI */
  width: 100%; /* Claude AI */
}

.navbar-brand { /* Claude AI */
  align-items: center; /* Claude AI */
  gap: 0.5rem; /* Claude AI */
}


a#landingPageTitle {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-weight: bold;
}

header#greenHeaderPlantPicture {
  background-color: #072d13;
}

div#landingPageContentBody{
  background-color: #072d13;
  padding:clamp(1rem, 5vw, 4rem); /* Claude AI */
  min-height: calc(100vh - 76px); /* Claude AI */
  display: grid; /* Claude AI */
  grid-template-columns:  minmax(300px, 1fr) minmax(300px, 1fr); /* Claude AI */
  gap: var(--spacing-md); /* Claude AI */
  align-items: left; /* Claude AI */

}

/* Claude AI media queries */
@media (max-width: 768px) {
  div#landingPageContentBody {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm)
  }

  @media (max-width: 480px) {
    .image-container {
      aspect-ratio: 3/4;
    }
  }
  
  .button-container {
    align-items: center;
  }
  
  ul#promotionBullets {
    margin-left: 0;
    padding-left: 0;
    list-style-position: inside;
  }

  @media (min-width: 768px) and (max-width: 1024px) {
    .card-body {
      font-size: clamp(1.125rem, 3vw, 1.5rem);
    }
  }

  @media (screen-spanning: single-fold-vertical) {
    div#landingPageContentBody {
      grid-template-columns: 1fr;
      gap: var(--spacing-lg);
    }
  }
  
  /* iPads and tablets */
  @media only screen 
  and (min-device-width: 768px) 
  and (max-device-width: 1024px) {
    .image-container {
      max-width: 80%;
      margin: 0 auto;
    }
  }
  
  /* Smaller phones */
  @media only screen 
  and (max-device-width: 375px) {
    ul#promotionBullets {
      padding-left: var(--spacing-sm);
    }
    
    .card {
      margin: var(--spacing-sm);
    }
  }

  @media 
  (-webkit-min-device-pixel-ratio: 2), 
  (min-resolution: 192dpi) {
    img#landingImagePlant {
      transform: translateZ(0); /* Hardware acceleration */
    }
  }

  @media (orientation: landscape) and (max-height: 600px) {
    div#landingPageContentBody {
      min-height: auto;
      padding: var(--spacing-md);
    }
    
    .image-container {
      aspect-ratio: 16/9;
    }
  }
}



/* Claude AI card body rules */
.card-body {
  font-size: clamp(1rem, 2.5vw, 1.25rem);
}



  </style>