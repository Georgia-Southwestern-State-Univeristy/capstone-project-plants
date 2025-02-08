describe('Accessibility Tests', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.injectAxe();
    });
  
    it('has no detectable accessibility violations on load', () => {
      cy.checkA11y();
    });
  
    it('maintains accessibility after user interactions', () => {
      cy.get('#logInButton').click();
      cy.checkA11y();
      
      cy.get('input[type="email"]').type('test@example.com');
      cy.checkA11y();
    });
  
    it('supports keyboard navigation', () => {
      cy.get('body').tab();
      cy.focused().should('have.attr', 'id', 'logInButton');
      
      cy.tab();
      cy.focused().should('have.attr', 'id', 'createAccountButton');
    });
  
    it('has proper ARIA labels', () => {
      cy.get('button').should('have.attr', 'aria-label');
      cy.get('input').should('have.attr', 'aria-label');
    });
  });
  