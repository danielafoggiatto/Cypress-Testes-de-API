/// <reference types="cypress" />

describe('API - Transações (Transactions)', () => {
  let accountId;
  let transactionId;

  before(() => {
    // Criar uma conta para os testes
    cy.request({
      method: 'POST',
      url: '/api/v1/accounts',
      body: {
        name: 'Conta Transações ' + Date.now()
      }
    }).then((response) => {
      accountId = response.body.id;
    });
  });

  describe('GET /api/v1/transactions', () => {
    it('Deve retornar lista de transações', () => {
      cy.request({
        method: 'GET',
        url: '/api/v1/transactions',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
      });
    });

    it('Deve filtrar transações por data', () => {
      cy.request({
        method: 'GET',
        url: '/api/v1/transactions?startDate=2024-01-01&endDate=2024-12-31'
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
      });
    });
  });

  describe('POST /api/v1/transactions', () => {
    it('Deve criar uma transação de despesa', () => {
      cy.request({
        method: 'POST',
        url: '/api/v1/transactions',
        body: {
          description: 'Despesa Teste ' + Date.now(),
          value: -100.00,
          date: new Date().toISOString().split('T')[0],
          accountId: accountId,
          type: 'despesa',
          status: 'pago'
        }
      }).then((response) => {
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('id');
        expect(response.body.value).to.equal(-100.00);
        transactionId = response.body.id;
      });
    });

    it('Deve criar uma transação de receita', () => {
      cy.request({
        method: 'POST',
        url: '/api/v1/transactions',
        body: {
          description: 'Receita Teste ' + Date.now(),
          value: 500.00,
          date: new Date().toISOString().split('T')[0],
          accountId: accountId,
          type: 'receita',
          status: 'pago'
        }
      }).then((response) => {
        expect(response.status).to.equal(201);
        expect(response.body.value).to.equal(500.00);
      });
    });

    it('Deve retornar erro ao criar transação sem descrição', () => {
      cy.request({
        method: 'POST',
        url: '/api/v1/transactions',
        body: {
          value: -100.00,
          date: new Date().toISOString().split('T')[0],
          accountId: accountId
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.at.least(400);
      });
    });

    it('Deve retornar erro se valor for zero', () => {
      cy.request({
        method: 'POST',
        url: '/api/v1/transactions',
        body: {
          description: 'Transação Inválida',
          value: 0,
          date: new Date().toISOString().split('T')[0],
          accountId: accountId
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.at.least(400);
      });
    });
  });

  describe('GET /api/v1/transactions/:id', () => {
    before(() => {
      // Criar uma transação
      cy.request({
        method: 'POST',
        url: '/api/v1/transactions',
        body: {
          description: 'Transação GET ' + Date.now(),
          value: -50.00,
          date: new Date().toISOString().split('T')[0],
          accountId: accountId,
          type: 'despesa',
          status: 'pago'
        }
      }).then((response) => {
        transactionId = response.body.id;
      });
    });

    it('Deve retornar detalhes de uma transação específica', () => {
      cy.request({
        method: 'GET',
        url: `/api/v1/transactions/${transactionId}`
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.id).to.equal(transactionId);
      });
    });
  });

  describe('PUT /api/v1/transactions/:id', () => {
    let updateTransactionId;

    before(() => {
      cy.request({
        method: 'POST',
        url: '/api/v1/transactions',
        body: {
          description: 'Transação UPDATE ' + Date.now(),
          value: -75.00,
          date: new Date().toISOString().split('T')[0],
          accountId: accountId,
          type: 'despesa',
          status: 'pago'
        }
      }).then((response) => {
        updateTransactionId = response.body.id;
      });
    });

    it('Deve atualizar uma transação', () => {
      cy.request({
        method: 'PUT',
        url: `/api/v1/transactions/${updateTransactionId}`,
        body: {
          description: 'Transação Atualizada',
          value: -150.00,
          status: 'pendente'
        }
      }).then((response) => {
        expect(response.status).to.equal(200);
      });
    });
  });

  describe('DELETE /api/v1/transactions/:id', () => {
    let deleteTransactionId;

    before(() => {
      cy.request({
        method: 'POST',
        url: '/api/v1/transactions',
        body: {
          description: 'Transação DELETE ' + Date.now(),
          value: -25.00,
          date: new Date().toISOString().split('T')[0],
          accountId: accountId,
          type: 'despesa',
          status: 'pago'
        }
      }).then((response) => {
        deleteTransactionId = response.body.id;
      });
    });

    it('Deve deletar uma transação', () => {
      cy.request({
        method: 'DELETE',
        url: `/api/v1/transactions/${deleteTransactionId}`
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 204]);
      });
    });
  });
});
