// Custom commands para testes de API

// Comando para login
Cypress.Commands.add('login', (email, password) => {
  cy.request({
    method: 'POST',
    url: '/api/login',
    body: {
      email: email,
      password: password
    }
  }).then((response) => {
    expect(response.status).to.equal(200)
    // Armazenar token se a API retornar
    if (response.body.token) {
      cy.window().then((win) => {
        win.localStorage.setItem('token', response.body.token)
      })
    }
  })
})

// Comando para fazer requisição autenticada
Cypress.Commands.add('authenticatedRequest', (method, url, body = null) => {
  cy.window().then((win) => {
    const token = win.localStorage.getItem('token')
    const options = {
      method: method,
      url: url,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
    if (body) {
      options.body = body
    }
    return cy.request(options)
  })
})

// Comando para limpar dados de teste
Cypress.Commands.add('cleanupTestData', () => {
  cy.window().then((win) => {
    win.localStorage.clear()
    win.sessionStorage.clear()
  })
})
