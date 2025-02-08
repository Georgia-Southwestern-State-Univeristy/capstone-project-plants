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
          cy.visit('/');
        });
  
        it('displays navigation correctly', () => {
          if (device === 'mobile') {
            cy.get('.navbar-toggler').should('be.visible');
          } else {
            cy.get('.navbar-nav').should('be.visible');
          }
        });
  
        it('maintains readable text size', () => {
          cy.get('p').should(($p) => {
            const fontSize = parseFloat(window.getComputedStyle($p[0]).fontSize);
            expect(fontSize).to.be.at.least(12);
          });
        });
  
        it('properly arranges chat interface', () => {
          cy.visit('/chat');
          cy.get('.chat-container').should('be.visible');
          cy.get('.chat-textarea').should('be.visible');
        });
      });
    });
  });