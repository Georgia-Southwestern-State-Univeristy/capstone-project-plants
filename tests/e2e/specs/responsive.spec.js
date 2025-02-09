describe('Responsive Design Tests', () => {
  const viewports = [
    { width: 375, height: 667, device: 'mobile' },
    { width: 768, height: 1024, device: 'tablet' },
    { width: 1920, height: 1080, device: 'desktop' }
  ];

  viewports.forEach(({ width, height, device }) => {
    describe(`${device} viewport (${width}x${height})`, () => {
      beforeEach(() => {
        cy.viewport(width, height);
      });

      it('correctly displays plant analysis interface', () => {
        cy.login();
        cy.visit('/chat');
        
        // Test chat container responsiveness
        cy.get('.chat-container').should('be.visible')
          .and('have.css', 'display', 'flex');
        
        // Test image upload interface
        if (device === 'mobile') {
          cy.get('#imageAttachButton').should('have.css', 'position', 'fixed');
        } else {
          cy.get('#imageAttachButton').should('not.have.css', 'position', 'fixed');
        }
        
        // Test message display
        cy.get('.messages-area').should('have.css', 'max-height')
          .and('not.eq', '0px');
      });

      it('handles plant image analysis flow responsively', () => {
        cy.login();
        cy.visit('/chat');
        
        // Upload test image
        const testImage = 'test-plant.jpg';
        cy.get('input[type="file"]').attachFile(testImage);
        
        // Check image preview responsiveness
        cy.get('.image-message img')
          .should('have.css', 'max-width', '100%')
          .and('be.visible');
        
        // Check analysis results display
        cy.get('.message-card').should('be.visible');
      });

      it('maintains usability during interactions', () => {
        cy.login();
        cy.visit('/chat');
        
        // Test input interactions
        cy.get('#textBox').type('How do I care for roses?');
        cy.get('.send-button').click();
        
        // Verify response visibility
        cy.get('.message-card').should('be.visible');
        
        if (device === 'mobile') {
          // Test mobile-specific interactions
          cy.get('.chat-textarea-container').should('have.css', 'position', 'fixed');
        }
      });
    });
  });
});