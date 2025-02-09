describe('Accessibility Tests', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.injectAxe();
  });

  it('has no detectable accessibility violations on all main pages', () => {
    // Test landing page
    cy.checkA11y();
    
    // Test login page
    cy.visit('/login');
    cy.checkA11y();
    
    // Test registration page
    cy.visit('/register');
    cy.checkA11y();
    
    // Test chat page (requires authentication)
    cy.login(); // Custom command that handles authentication
    cy.visit('/chat');
    cy.checkA11y();
  });

  it('maintains accessibility during plant analysis flow', () => {
    cy.login();
    cy.visit('/chat');
    
    // Test file upload button accessibility
    cy.get('#imageAttachButton')
      .should('have.attr', 'aria-label', 'Upload plant image');
    
    // Test chat input accessibility
    cy.get('#textBox')
      .should('have.attr', 'aria-label', 'Chat message input');
    
    // Test message history accessibility
    cy.get('.messages-area')
      .should('have.attr', 'aria-live', 'polite');
    
    cy.checkA11y();
  });

  it('provides proper keyboard navigation in chat interface', () => {
    cy.login();
    cy.visit('/chat');
    
    // Test keyboard navigation sequence
    cy.get('body').tab();
    cy.focused().should('have.id', 'imageAttachButton');
    
    cy.tab();
    cy.focused().should('have.id', 'textBox');
    
    cy.tab();
    cy.focused().should('have.class', 'send-button');
  });

  it('announces screen reader messages appropriately', () => {
    cy.login();
    cy.visit('/chat');
    
    // Test message announcements
    cy.get('#textBox').type('Test message{enter}');
    cy.get('[aria-live="polite"]').should('contain', 'Message sent');
    
    // Test analysis announcements
    const testImage = 'test-plant.jpg';
    cy.get('input[type="file"]').attachFile(testImage);
    cy.get('[aria-live="polite"]').should('contain', 'Image uploaded');
  });
});