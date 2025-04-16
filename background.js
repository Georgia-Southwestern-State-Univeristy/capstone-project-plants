<style scoped>


.message-content {
  margin-bottom: 12px; /* Space between text and image */
}


 
.chat-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 120px;
  background: url('/images/plant-frame-bg.jpg') no-repeat center center fixed;


  background-size: cover;
  z-index: 1;
}


.chat-container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7); /* 白色半透明遮罩 */
  z-index: 0;
  pointer-events: none;
}


.messages-area::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}


.messages-area {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}




.message-card {
  max-width: 75%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: white;
  animation: fadeInUp 0.3s ease-out;
  transition: transform 0.2s ease;
}


.card-header {
  font-weight: bold;
  color: #22543d;
  background-color: #edf2f7;
  padding: 0.75rem 1rem;
}


.card-body {
  padding: 1rem;
  color: #2d3748;
}


.image-message img {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 12px;
  margin-top: 0.75rem;
}


.chat-input-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 1rem;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}


.input-group {
  display: flex;
  align-items: center;
  max-width: 900px;
  margin: 0 auto;
  gap: 0.5rem;
}


.chat-textarea {
  flex: 1;
  resize: none;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  background-color: #f7fafc;
  border: 1px solid #cbd5e0;
}


.attach-button,
.send-button {
  background-color: #edf2f7;
  border: none;
  border-radius: 8px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}


.attach-button:hover,
.send-button:hover {
  background-color: #e2e8f0;
}


.account-circle {
  width: 40px;
  height: 40px;
  background-color: #2f855a;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}


.account-dropdown {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  padding: 0.5rem 0;
  position: absolute;
  right: 0;
  z-index: 1000;
  display: none;
  min-width: 180px;
  list-style: none;
}


.account-dropdown.show {
  display: block;
}


.account-dropdown li {
  list-style-type: none;
}


.dropdown-item {
  padding: 0.75rem 1rem;
  font-weight: 500;
  color: #2d3748;
  cursor: pointer;
  display: block;
  text-decoration: none;
}


.dropdown-item:hover {
  background-color: #f0fff4;
}


@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}


@media (max-width: 600px) {
  .message-card {
    max-width: 100%;
  }


  .input-group {
    flex-direction: column;
    align-items: stretch;
  }


  .chat-textarea {
    width: 100%;
  }
}
</style>


