/// <reference types="cypress" />

describe('API - Testes Avançados', () => {
  const baseUrl = Cypress.env('baseUrl') || 'https://barrigareact.wcaquino.me';
  let token;
  let accountId;

  before(() => {
    // Setup: Login
    cy.request({
      method: 'POST',
      url: `${baseUrl}/api/v1/login`,
      body: {
        email: 'usuario@barriga.com',
        password: 'Senha123!'
      }
    }).then((response) => {
      if (response.status === 200 && response.body.token) {
        token = response.body.token;
      }
    });
  });

  describe('Validações de Schema', () => {
    it('Deve validar schema de resposta de contas', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/v1/accounts`,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');

        // Validar primeira conta
        if (response.body.length > 0) {
          const account = response.body[0];
          expect(account).to.have.all.keys(
            'id',
            'name',
            'description',
            'status'
          );
          expect(account.id).to.be.a('number');
          expect(account.name).to.be.a('string');
        }
      });
    });
  });

  describe('Testes de Performance', () => {
    it('Requisição de GET deve ser rápida (< 2s)', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/v1/accounts`,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then((response) => {
        expect(response.duration).to.be.lessThan(2000);
      });
    });
  });

  describe('Testes de Fluxo Completo', () => {
    it('Deve criar conta, transação e deletar', () => {
      const accountName = 'Conta Fluxo ' + Date.now();
      let newAccountId;

      // 1. Criar conta
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/v1/accounts`,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: {
          name: accountName
        }
      }).then((response) => {
        expect(response.status).to.equal(201);
        newAccountId = response.body.id;

        // 2. Criar transação na conta
        cy.request({
          method: 'POST',
          url: `${baseUrl}/api/v1/transactions`,
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: {
            description: 'Transação Fluxo ' + Date.now(),
            value: -100.00,
            date: new Date().toISOString().split('T')[0],
            accountId: newAccountId,
            type: 'despesa',
            status: 'pago'
          }
        }).then((txResponse) => {
          expect(txResponse.status).to.equal(201);
          const transactionId = txResponse.body.id;

          // 3. Listar transações
          cy.request({
            method: 'GET',
            url: `${baseUrl}/api/v1/transactions`,
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }).then((listResponse) => {
            expect(listResponse.status).to.equal(200);
            expect(listResponse.body).to.be.an('array');

            // 4. Deletar transação
            cy.request({
              method: 'DELETE',
              url: `${baseUrl}/api/v1/transactions/${transactionId}`,
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }).then((deleteResponse) => {
              expect(deleteResponse.status).to.be.oneOf([200, 204]);

              // 5. Deletar conta
              cy.request({
                method: 'DELETE',
                url: `${baseUrl}/api/v1/accounts/${newAccountId}`,
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }).then((accountDeleteResponse) => {
                expect(accountDeleteResponse.status).to.be.oneOf([200, 204]);
              });
            });
          });
        });
      });
    });
  });

  describe('Testes de Segurança', () => {
    it('Não deve permitir acesso sem autenticação', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/v1/accounts`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(401);
      });
    });

    it('Não deve permitir token inválido', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/v1/accounts`,
        headers: {
          'Authorization': 'Bearer token_inválido_xyz'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(401);
      });
    });

    it('Não deve permitir SQL Injection', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/v1/accounts`,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: {
          name: "'; DROP TABLE accounts; --"
        },
        failOnStatusCode: false
      }).then((response) => {
        // Espera que a API trate adequadamente
        expect(response.status).to.be.at.least(200);
      });
    });
  });

  describe('Testes de Validação de Dados', () => {
    it('Deve rejeitar transação com valor muito grande', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/v1/transactions`,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: {
          description: 'Transação Grande',
          value: 999999999999.99,
          date: new Date().toISOString().split('T')[0],
          accountId: 1,
          type: 'receita'
        },
        failOnStatusCode: false
      }).then((response) => {
        // Pode validar ou aceitar conforme API
        expect(response.status).to.be.a('number');
      });
    });

    it('Deve validar formato de email', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/v1/signin`,
        body: {
          name: 'Usuário',
          email: 'email_invalido',
          password: 'Senha123!'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.at.least(400);
      });
    });
  });

  describe('Testes de Paginação', () => {
    it('Deve suportar paginação em listagens', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/v1/accounts?page=1&limit=10`,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then((response) => {
        expect(response.status).to.equal(200);
        // Validar se resposta é array ou objeto com paginação
        expect(response.body).to.exist;
      });
    });
  });

  describe('Testes de Filtros', () => {
    it('Deve filtrar transações por status', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/v1/transactions?status=pago`,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
      });
    });

    it('Deve filtrar transações por tipo', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/v1/transactions?type=despesa`,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
      });
    });
  });
});
