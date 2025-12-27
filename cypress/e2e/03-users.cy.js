/// <reference types="cypress" />

describe('API - Usuários (Users)', () => {
  const testUserEmail = 'usuario' + Date.now() + '@barriga.com';
  const testPassword = 'Senha123!';
  let userId;

  describe('POST /api/v1/signin', () => {
    it('Deve fazer signup de um novo usuário', () => {
      cy.request({
        method: 'POST',
        url: '/api/v1/signin',
        body: {
          name: 'Usuário Teste',
          email: testUserEmail,
          password: testPassword
        }
      }).then((response) => {
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('id');
        expect(response.body.email).to.equal(testUserEmail);
        userId = response.body.id;
      });
    });

    it('Deve retornar erro ao registrar com email duplicado', () => {
      cy.request({
        method: 'POST',
        url: '/api/v1/signin',
        body: {
          name: 'Outro Usuário',
          email: testUserEmail,
          password: testPassword
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.at.least(400);
      });
    });

    it('Deve retornar erro sem campo obrigatório', () => {
      cy.request({
        method: 'POST',
        url: '/api/v1/signin',
        body: {
          name: 'Usuário Incompleto'
          // faltam email e password
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.at.least(400);
      });
    });
  });

  describe('POST /api/v1/login', () => {
    it('Deve fazer login com sucesso', () => {
      cy.request({
        method: 'POST',
        url: '/api/v1/login',
        body: {
          email: testUserEmail,
          password: testPassword
        }
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('token');
        // Armazenar token para próximas requisições autenticadas
        cy.window().then((win) => {
          win.localStorage.setItem('token', response.body.token);
        });
      });
    });

    it('Deve retornar erro com email incorreto', () => {
      cy.request({
        method: 'POST',
        url: '/api/v1/login',
        body: {
          email: 'naoexiste@barriga.com',
          password: testPassword
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(401);
      });
    });

    it('Deve retornar erro com senha incorreta', () => {
      cy.request({
        method: 'POST',
        url: '/api/v1/login',
        body: {
          email: testUserEmail,
          password: 'senhaerrada'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(401);
      });
    });
  });

  describe('GET /api/v1/user', () => {
    let token;

    before(() => {
      // Fazer login para obter token
      cy.request({
        method: 'POST',
        url: '/api/v1/login',
        body: {
          email: testUserEmail,
          password: testPassword
        }
      }).then((response) => {
        token = response.body.token;
      });
    });

    it('Deve retornar dados do usuário logado', () => {
      cy.request({
        method: 'GET',
        url: '/api/v1/user',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.email).to.equal(testUserEmail);
        expect(response.body).to.have.property('id');
      });
    });

    it('Deve retornar 401 sem token', () => {
      cy.request({
        method: 'GET',
        url: '/api/v1/user',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(401);
      });
    });

    it('Deve retornar 401 com token inválido', () => {
      cy.request({
        method: 'GET',
        url: '/api/v1/user',
        headers: {
          'Authorization': 'Bearer tokeninvalido'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(401);
      });
    });
  });

  describe('PUT /api/v1/user', () => {
    let token;

    before(() => {
      cy.request({
        method: 'POST',
        url: '/api/v1/login',
        body: {
          email: testUserEmail,
          password: testPassword
        }
      }).then((response) => {
        token = response.body.token;
      });
    });

    it('Deve atualizar dados do usuário', () => {
      cy.request({
        method: 'PUT',
        url: '/api/v1/user',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: {
          name: 'Novo Nome Usuário'
        }
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.name).to.equal('Novo Nome Usuário');
      });
    });
  });

  describe('POST /api/v1/logout', () => {
    let token;

    before(() => {
      cy.request({
        method: 'POST',
        url: '/api/v1/login',
        body: {
          email: testUserEmail,
          password: testPassword
        }
      }).then((response) => {
        token = response.body.token;
      });
    });

    it('Deve fazer logout com sucesso', () => {
      cy.request({
        method: 'POST',
        url: '/api/v1/logout',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 204]);
      });
    });
  });
});
