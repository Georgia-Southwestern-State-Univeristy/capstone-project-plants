export function useNotifications() {
  const showNotification = (message, type = 'info') => {
    console.log(`${type}: ${message}`);
  };
  
  return {
    showNotification
  };
}