describe('Performance Tests', () => {
    beforeEach(() => {
      // Clear caches and set up clean test environment
      cy.clearLocalStorage();
      cy.clearCookies();
    });
  
    describe('Page Load Performance', () => {
      it('loads landing page within performance budget', () => {
        cy.visit('/', {
          onBeforeLoad: (win) => {
            // Create performance observer to monitor key metrics
            const observer = new win.PerformanceObserver((list) => {
              const entries = list.getEntries();
              entries.forEach((entry) => {
                // Verify key performance metrics
                if (entry.entryType === 'largest-contentful-paint') {
                  expect(entry.startTime).to.be.lessThan(2500); // 2.5s threshold
                }
                if (entry.entryType === 'first-input-delay') {
                  expect(entry.duration).to.be.lessThan(100); // 100ms threshold
                }
              });
            });
            
            observer.observe({ 
              entryTypes: ['largest-contentful-paint', 'first-input-delay']
            });
          }
        });
  
        // Verify time to interactive
        cy.window().its('performance').then((p) => {
          const navigationEntry = p.getEntriesByType('navigation')[0];
          expect(navigationEntry.domInteractive).to.be.lessThan(3000); // 3s threshold
        });
      });
    });
  
    describe('Chat Interface Performance', () => {
      beforeEach(() => {
        cy.login(); // Custom command for authentication
        cy.visit('/chat');
      });
  
      it('handles message sending with acceptable latency', () => {
        const messageText = 'How do I care for roses?';
        
        // Measure time to send and receive response
        cy.window().its('performance').then((p) => {
          const startTime = p.now();
          
          cy.get('#textBox').type(messageText);
          cy.get('.send-button').click();
          
          // Wait for response and verify timing
          cy.get('.message-card').last()
            .should('contain', messageText)
            .then(() => {
              const endTime = p.now();
              const responseTime = endTime - startTime;
              expect(responseTime).to.be.lessThan(2000); // 2s threshold
            });
        });
      });
  
      it('maintains performance during image analysis', () => {
        // Test image upload and analysis performance
        const testImage = 'test-plant.jpg';
        
        cy.window().its('performance').then((p) => {
          const startTime = p.now();
          
          cy.get('input[type="file"]').attachFile(testImage);
          
          // Wait for analysis completion and verify timing
          cy.get('.message-card').last()
            .should('contain', 'analysis')
            .then(() => {
              const endTime = p.now();
              const analysisTime = endTime - startTime;
              expect(analysisTime).to.be.lessThan(5000); // 5s threshold for image analysis
            });
        });
      });
    });
  
    describe('Resource Usage', () => {
      it('maintains acceptable memory usage during extended chat sessions', () => {
        cy.login();
        cy.visit('/chat');
        
        // Simulate extended chat session
        const messages = Array(20).fill('Test message');
        
        cy.window().then((win) => {
          const initialMemory = win.performance.memory.usedJSHeapSize;
          
          // Send multiple messages
          messages.forEach((message, index) => {
            cy.get('#textBox').type(`${message} ${index}{enter}`);
            cy.wait(500); // Wait for message processing
          });
          
          // Verify memory usage hasn't grown excessively
          const finalMemory = win.performance.memory.usedJSHeapSize;
          const memoryIncrease = finalMemory - initialMemory;
          expect(memoryIncrease).to.be.lessThan(50 * 1024 * 1024); // 50MB threshold
        });
      });
  
      it('efficiently handles image caching', () => {
        cy.login();
        cy.visit('/chat');
        
        // Upload same image multiple times
        const testImage = 'test-plant.jpg';
        
        cy.window().then((win) => {
          // First upload - should take normal time
          cy.get('input[type="file"]').attachFile(testImage);
          cy.get('.message-card').last().should('be.visible');
          
          // Second upload - should be faster due to caching
          const startTime = win.performance.now();
          cy.get('input[type="file"]').attachFile(testImage);
          cy.get('.message-card').last().should('be.visible').then(() => {
            const endTime = win.performance.now();
            const cachedResponseTime = endTime - startTime;
            expect(cachedResponseTime).to.be.lessThan(1000); // 1s threshold for cached response
          });
        });
      });
    });
  });