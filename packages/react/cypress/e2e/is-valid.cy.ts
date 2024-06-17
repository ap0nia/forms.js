describe('isValid', () => {
  it('should showing valid correctly with build in validation', () => {
    cy.visit('/is-valid/build-in/defaultValue')
    cy.get('#isValid').contains('false')

    cy.get('input[name="firstName"]').type('test')
    cy.get('#isValid').contains('false')
    cy.get('input[name="lastName"]').type('test')
    cy.get('#isValid').contains('true')
    cy.get('#renderCount').contains('3')
    cy.get('#toggle').click()
    cy.get('#isValid').contains('false')
    cy.get('#toggle').click()
    cy.get('#isValid').contains('true')
  })

  it('should showing valid correctly with build in validation and default values supplied', () => {
    cy.visit('/is-valid/build-in/defaultValues')
    cy.get('#isValid').contains('true')

    cy.get('input[name="firstName"]').clear()
    cy.get('#isValid').contains('false')
    cy.get('#renderCount').contains('4')
    cy.get('#toggle').click()
    cy.get('#isValid').contains('false')
  })

  it('should showing valid correctly with schema validation', () => {
    cy.visit('/is-valid/schema/defaultValue')
    cy.get('#isValid').contains('false')

    cy.get('input[name="firstName"]').type('test')
    cy.get('#isValid').contains('false')
    cy.get('input[name="lastName"]').type('test')
    cy.get('#isValid').contains('true')
    cy.get('#renderCount').contains('2')
    cy.get('#toggle').click()
    cy.get('#isValid').contains('false')
    cy.get('#toggle').click()
    cy.get('input[name="firstName"]').type('test')
    cy.get('#isValid').contains('true')
    cy.get('#renderCount').contains('7')
  })

  it('should showing valid correctly with schema validation and default value supplied', () => {
    cy.visit('/is-valid/schema/defaultValues')
    cy.get('#isValid').contains('true')

    cy.get('input[name="firstName"]').clear()
    cy.get('#isValid').contains('false')
    cy.get('#renderCount').contains('3')
    cy.get('input[name="firstName"]').type('test')
    cy.get('#isValid').contains('true')
    cy.get('#toggle').click()
    cy.get('#isValid').contains('false')
    cy.get('#toggle').click()
    cy.get('input[name="firstName"]').type('t')
    cy.get('#isValid').contains('true')
  })
})
