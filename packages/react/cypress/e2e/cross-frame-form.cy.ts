function getIframe() {
  return cy
    .get('iframe')
    .its('0.contentDocument')
    .should('exist')
    .its('body')
    .should('not.be.undefined')
    .then(cy.wrap)
}

describe('Cross-Frame rendering', () => {
  it('should work correctly when rendering inside frames', () => {
    cy.visit('/cross-frame-form')
    getIframe().find('input[type="text"]').type('test')
    getIframe().find('input[type="radio"][value="a"]').click()
    getIframe().find('input[type="radio"][value="b"]').click()
    getIframe().find('pre').should('contain.text', '{"input":"test","radio":"b"}')
  })
})
