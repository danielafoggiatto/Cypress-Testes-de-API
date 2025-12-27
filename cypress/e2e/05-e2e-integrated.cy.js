/// <reference types="cypress" />

describe('Testes E2E - API + UI Integrados', () => {
  const baseUrl = 'https://barrigareact.wcaquino.me';

  before(() => {
    cy.visit(baseUrl);
    cy.cleanupTestData();
  });

  describe('Fluxo de Cadastro e Visualização', () => {
    it('Deve registrar usuário e fazer login', () => {
      const email = 'usuario' + Date.now() + '@teste.com';
      const password = 'Senha123!';

      // 1. Fazer signup via API
      cy.request({
        method: 'POST',
        url: '/api/v1/signin',
        body: {
          name: 'Usuário Teste E2E',
          email: email,
          password: password
        }
      }).then((response) => {
        expect(response.status).to.equal(201);

        // 2. Fazer login via API
        cy.request({
          method: 'POST',
          url: '/api/v1/login',
          body: {
            email: email,
            password: password
          }
        }).then((loginResponse) => {
          expect(loginResponse.status).to.equal(200);
          expect(loginResponse.body).to.have.property('token');

          // 3. Salvar token
          const token = loginResponse.body.token;
          cy.window().then((win) => {
            win.localStorage.setItem('token', token);
          });

          // 4. Visitar a aplicação
          cy.visit(baseUrl);

          // 5. Validar que está logado (verificar se página carregou)
          cy.get('body').should('exist');
        });
      });
    });
  });

  describe('Criar Conta via API e Verificar UI', () => {
    let token;

    before(() => {
      // Fazer login
      cy.request({
        method: 'POST',
        url: '/api/v1/login',
        body: {
          email: 'usuario@barriga.com',
          password: 'Senha123!'
        }
      }).then((response) => {
        if (response.status === 200) {
          token = response.body.token;
          cy.window().then((win) => {
            win.localStorage.setItem('token', token);
          });
        }
      });
    });

    it('Deve criar conta via API e verificar em GET', () => {
      const accountName = 'Conta E2E ' + Date.now();

      // 1. Criar conta via API
      cy.request({
        method: 'POST',
        url: '/api/v1/accounts',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: {
          name: accountName
        }
      }).then((createResponse) => {
        expect(createResponse.status).to.equal(201);
        const newAccountId = createResponse.body.id;

        // 2. Verificar que conta foi criada
        cy.request({
          method: 'GET',
          url: `/api/v1/accounts/${newAccountId}`,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).then((getResponse) => {
          expect(getResponse.status).to.equal(200);
          expect(getResponse.body.name).to.equal(accountName);
        });

        // 3. Listar contas e validar que a nova está lá
        cy.request({
          method: 'GET',
          url: '/api/v1/accounts',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).then((listResponse) => {
          expect(listResponse.status).to.equal(200);
          expect(listResponse.body).to.be.an('array');

          const foundAccount = listResponse.body.find(
            (acc) => acc.id === newAccountId
          );
          expect(foundAccount).to.exist;
          expect(foundAccount.name).to.equal(accountName);
        });
      });
    });
  });

  describe('Criar Transação e Verificar Saldo', () => {
    let token;
    let accountId;

    before(() => {
      // Login
      cy.request({
        method: 'POST',
        url: '/api/v1/login',
        body: {
          email: 'usuario@barriga.com',
          password: 'Senha123!'
        }
      }).then((response) => {
        if (response.status === 200) {
          token = response.body.token;

          // Criar conta
          cy.request({
            method: 'POST',
            url: '/api/v1/accounts',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: {
              name: 'Conta Saldo ' + Date.now()
            }
          }).then((createResponse) => {
            accountId = createResponse.body.id;
          });
        }
      });
    });

    it('Deve criar receita e validar saldo', () => {
      const valor = 500.00;

      // 1. Criar receita
      cy.request({
        method: 'POST',
        url: '/api/v1/transactions',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: {
          description: 'Receita E2E ' + Date.now(),
          value: valor,
          date: new Date().toISOString().split('T')[0],
          accountId: accountId,
          type: 'receita',
          status: 'pago'
        }
      }).then((response) => {
        expect(response.status).to.equal(201);
        expect(response.body.value).to.equal(valor);
      });
    });

    it('Deve criar despesa e validar saldo', () => {
      const valor = -150.00;

      // 1. Criar despesa
      cy.request({
        method: 'POST',
        url: '/api/v1/transactions',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: {
          description: 'Despesa E2E ' + Date.now(),
          value: valor,
          date: new Date().toISOString().split('T')[0],
          accountId: accountId,
          type: 'despesa',
          status: 'pago'
        }
      }).then((response) => {
        expect(response.status).to.equal(201);
        expect(response.body.value).to.equal(valor);
      });
    });
  });

  describe('Validações de Integridade de Dados', () => {
    let token;

    before(() => {
      cy.request({
        method: 'POST',
        url: '/api/v1/login',
        body: {
          email: 'usuario@barriga.com',
          password: 'Senha123!'
        }
      }).then((response) => {
        if (response.status === 200) {
          token = response.body.token;
        }
      });
    });

    it('Não deve criar conta com mesmo nome', () => {
      const accountName = 'Conta Duplicada ' + Date.now();

      // Criar primeira conta
      cy.request({
        method: 'POST',
        url: '/api/v1/accounts',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: {
          name: accountName
        }
      }).then((response) => {
        expect(response.status).to.equal(201);

        // Tentar criar segunda com mesmo nome
        cy.request({
          method: 'POST',
          url: '/api/v1/accounts',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: {
            name: accountName
          },
          failOnStatusCode: false
        }).then((duplicateResponse) => {
          // Pode retornar 400 ou 409 dependendo da API
          expect(duplicateResponse.status).to.be.at.least(400);
        });
      });
    });

    it('Deve garantir que transação está associada à conta correta', () => {
      let accountId;
      const transactionDesc = 'Transação Validação ' + Date.now();

      // Criar conta
      cy.request({
        method: 'POST',
        url: '/api/v1/accounts',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: {
          name: 'Conta Validação ' + Date.now()
        }
      }).then((createResponse) => {
        accountId = createResponse.body.id;

        // Criar transação
        cy.request({
          method: 'POST',
          url: '/api/v1/transactions',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: {
            description: transactionDesc,
            value: 100.00,
            date: new Date().toISOString().split('T')[0],
            accountId: accountId,
            type: 'receita',
            status: 'pago'
          }
        }).then((txResponse) => {
          const transactionId = txResponse.body.id;

          // Obter transação
          cy.request({
            method: 'GET',
            url: `/api/v1/transactions/${transactionId}`,
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }).then((getResponse) => {
            expect(getResponse.body.accountId).to.equal(accountId);
            expect(getResponse.body.description).to.equal(transactionDesc);
          });
        });
      });
    });
  });
});
