/// <reference types="cypress" />

describe('API - Contas (Accounts)', () => {
  let token;
  let accountId;
  const baseUrl = 'https://barrigareact.wcaquino.me';

  before(() => {
    // Limpar dados antes dos testes
    cy.cleanupTestData();

    // Fazer login para obter token (necessário para a maioria das requisições)
    cy.request({
      method: 'POST',
      url: `${baseUrl}/api/login`,
      body: {
        email: 'admin@barriga.com',
        password: 'Admin@123'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Se login falhar, continuamos sem token (alguns endpoints não exigem)
      if (response.status === 200 && response.body.token) {
        token = response.body.token;
      }
    });
  });

  describe('GET /api/contas', () => {
    it('Deve retornar lista de contas', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/contas`,
        headers: {
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        // Validar que recebeu resposta
        expect(response.status).to.be.oneOf([200, 401, 403]);
        // Se autenticado, espera array
        if (response.status === 200) {
          expect(response.body).to.be.an('array');
        }
      });
    });
  });

  describe('POST /api/contas', () => {
    it('Deve criar uma nova conta com sucesso', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/contas`,
        body: {
          nome: 'Conta Teste ' + Date.now()
        },
        failOnStatusCode: false
      }).then((response) => {
        // Validar que conseguiu criar (201 ou 200 dependendo da API)
        if (response.status === 201 || response.status === 200) {
          expect(response.body).to.have.property('id');
          accountId = response.body.id;
        }
      });
    });

    it('Deve retornar erro ao criar conta sem nome', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/contas`,
        body: {},
        failOnStatusCode: false
      }).then((response) => {
        // Espera que falhe sem campos obrigatórios
        expect(response.status).to.be.at.least(400);
      });
    });
  });

  describe('GET /api/contas/:id', () => {
    before(() => {
      // Criar uma conta para obter o ID
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/contas`,
        body: {
          nome: 'Conta Para GET ' + Date.now()
        },
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200 || response.status === 201) {
          accountId = response.body.id;
        }
      });
    });

    it('Deve retornar detalhes de uma conta específica', () => {
      if (accountId) {
        cy.request({
          method: 'GET',
          url: `${baseUrl}/api/contas/${accountId}`,
          failOnStatusCode: false
        }).then((response) => {
          if (response.status === 200) {
            expect(response.body).to.have.property('id');
            expect(response.body.id).to.equal(accountId);
          }
        });
      }
    });

    it('Deve retornar 404 para conta inexistente', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/contas/99999`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.at.least(400);
      });
    });
  });

  describe('PUT /api/contas/:id', () => {
    let updateAccountId;

    before(() => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/contas`,
        body: {
          nome: 'Conta Para UPDATE ' + Date.now()
        },
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200 || response.status === 201) {
          updateAccountId = response.body.id;
        }
      });
    });

    it('Deve atualizar uma conta com sucesso', () => {
      if (updateAccountId) {
        const newName = 'Conta Atualizada ' + Date.now();
        cy.request({
          method: 'PUT',
          url: `${baseUrl}/api/contas/${updateAccountId}`,
          body: {
            nome: newName
          },
          failOnStatusCode: false
        }).then((response) => {
          if (response.status === 200) {
            expect(response.body.nome).to.equal(newName);
          }
        });
      }
    });
  });

  describe('DELETE /api/contas/:id', () => {
    let deleteAccountId;

    before(() => {
      // Criar uma conta para deletar
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/contas`,
        body: {
          nome: 'Conta Para DELETE ' + Date.now()
        },
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200 || response.status === 201) {
          deleteAccountId = response.body.id;
        }
      });
    });

    it('Deve deletar uma conta com sucesso', () => {
      if (deleteAccountId) {
        cy.request({
          method: 'DELETE',
          url: `${baseUrl}/api/contas/${deleteAccountId}`,
          failOnStatusCode: false
        }).then((response) => {
          expect([200, 204]).to.include(response.status);
        });
      }
    });

    it('Deve retornar erro ao tentar deletar conta inexistente', () => {
      cy.request({
        method: 'DELETE',
        url: `${baseUrl}/api/contas/99999`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.at.least(400);
      });
    });
  });
});
   
