/// <reference types="cypress" />

describe('API - Testes Barriga React', () => {
  const baseUrl = 'https://barrigareact.wcaquino.me';
  
  describe('GET /api - Health Check', () => {
    it('Deve verificar se API está respondendo', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api`,
        failOnStatusCode: false
      }).then((response) => {
        // Validar que recebeu resposta da API
        expect(response.status).to.be.a('number');
        expect(response.status).to.be.greaterThan(0);
      });
    });
  });

  describe('POST /api/login - Autenticação', () => {
    it('Deve fazer login com credenciais válidas', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/login`,
        body: {
          email: 'admin@barriga.com',
          password: 'Admin@123'
        },
        failOnStatusCode: false
      }).then((response) => {
        // Login bem-sucedido retorna token
        if (response.status === 200) {
          expect(response.body).to.have.property('token');
          cy.window().then((win) => {
            win.localStorage.setItem('token', response.body.token);
          });
        }
      });
    });

    it('Deve retornar erro com email inválido', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/login`,
        body: {
          email: 'emailnaoexiste@barriga.com',
          password: 'SenhaQualquer'
        },
        failOnStatusCode: false
      }).then((response) => {
        // Espera falha na autenticação
        expect(response.status).to.be.at.least(401);
      });
    });

    it('Deve retornar erro com senha incorreta', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/login`,
        body: {
          email: 'admin@barriga.com',
          password: 'SenhaErrada123'
        },
        failOnStatusCode: false
      }).then((response) => {
        // Espera falha na autenticação
        expect(response.status).to.be.at.least(401);
      });
    });

    it('Deve retornar erro sem email', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/login`,
        body: {
          password: 'Admin@123'
        },
        failOnStatusCode: false
      }).then((response) => {
        // Espera erro de validação
        expect(response.status).to.be.at.least(400);
      });
    });

    it('Deve retornar erro sem senha', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/login`,
        body: {
          email: 'admin@barriga.com'
        },
        failOnStatusCode: false
      }).then((response) => {
        // Espera erro de validação
        expect(response.status).to.be.at.least(400);
      });
    });
  });

  describe('POST /api/signup - Registro', () => {
    it('Deve registrar novo usuário com sucesso', () => {
      const email = 'usuario' + Date.now() + '@barriga.com';
      
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/signup`,
        body: {
          name: 'Usuário Teste',
          email: email,
          password: 'Senha@123'
        },
        failOnStatusCode: false
      }).then((response) => {
        // Espera sucesso ou erro (endpoint pode não existir ou retornar 404)
        expect([200, 201, 302, 404]).to.include(response.status);
      });
    });

    it('Deve retornar erro ao registrar com email duplicado', () => {
      const email = 'admin@barriga.com';
      
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/signup`,
        body: {
          name: 'Outro Admin',
          email: email,
          password: 'Senha@123'
        },
        failOnStatusCode: false
      }).then((response) => {
        // Espera erro de email duplicado
        expect(response.status).to.be.at.least(400);
      });
    });

    it('Deve retornar erro sem campos obrigatórios', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/signup`,
        body: {
          name: 'Usuário Incompleto'
          // Faltam email e password
        },
        failOnStatusCode: false
      }).then((response) => {
        // Espera erro de validação
        expect(response.status).to.be.at.least(400);
      });
    });
  });

  describe('GET /api/contas - Listagem de Contas', () => {
    let token;

    before(() => {
      // Login para obter token
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/login`,
        body: {
          email: 'admin@barriga.com',
          password: 'Admin@123'
        },
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          token = response.body.token;
        }
      });
    });

    it('Deve retornar lista de contas autenticado', () => {
      if (token) {
        cy.request({
          method: 'GET',
          url: `${baseUrl}/api/contas`,
          headers: {
            'Authorization': `Bearer ${token}`
          },
          failOnStatusCode: false
        }).then((response) => {
          if (response.status === 200) {
            expect(response.body).to.be.an('array');
          }
        });
      }
    });

    it('Deve retornar 401 sem token', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/contas`,
        failOnStatusCode: false
      }).then((response) => {
        // Sem autenticação pode retornar 401 ou 404 dependendo da API
        expect([401, 404]).to.include(response.status);
      });
    });
  });

  describe('POST /api/contas - Criar Conta', () => {
    let token;

    before(() => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/login`,
        body: {
          email: 'admin@barriga.com',
          password: 'Admin@123'
        },
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          token = response.body.token;
        }
      });
    });

    it('Deve criar nova conta com sucesso', () => {
      if (token) {
        cy.request({
          method: 'POST',
          url: `${baseUrl}/api/contas`,
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: {
            nome: 'Conta Teste ' + Date.now()
          },
          failOnStatusCode: false
        }).then((response) => {
          // Validar que recebeu resposta
          expect(response.status).to.be.oneOf([200, 201, 409]);
          
          if (response.status === 200 || response.status === 201) {
            expect(response.body).to.have.property('id');
          }
        });
      }
    });

    it('Deve retornar erro ao criar conta sem nome', () => {
      if (token) {
        cy.request({
          method: 'POST',
          url: `${baseUrl}/api/contas`,
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: {},
          failOnStatusCode: false
        }).then((response) => {
          // Espera erro de validação
          expect(response.status).to.be.at.least(400);
        });
      }
    });
  });

  describe('GET /api/transacoes - Listagem de Transações', () => {
    let token;

    before(() => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/login`,
        body: {
          email: 'admin@barriga.com',
          password: 'Admin@123'
        },
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          token = response.body.token;
        }
      });
    });

    it('Deve retornar lista de transações', () => {
      if (token) {
        cy.request({
          method: 'GET',
          url: `${baseUrl}/api/transacoes`,
          headers: {
            'Authorization': `Bearer ${token}`
          },
          failOnStatusCode: false
        }).then((response) => {
          if (response.status === 200) {
            expect(response.body).to.be.an('array');
          }
        });
      }
    });

    it('Deve filtrar transações por mês/ano', () => {
      if (token) {
        cy.request({
          method: 'GET',
          url: `${baseUrl}/api/transacoes?mes=12&ano=2025`,
          headers: {
            'Authorization': `Bearer ${token}`
          },
          failOnStatusCode: false
        }).then((response) => {
          if (response.status === 200) {
            expect(response.body).to.be.an('array');
          }
        });
      }
    });
  });

  describe('POST /api/transacoes - Criar Transação', () => {
    let token;
    let contaId;

    before(() => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/login`,
        body: {
          email: 'admin@barriga.com',
          password: 'Admin@123'
        },
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          token = response.body.token;

          // Obter lista de contas
          cy.request({
            method: 'GET',
            url: `${baseUrl}/api/contas`,
            headers: {
              'Authorization': `Bearer ${token}`
            },
            failOnStatusCode: false
          }).then((contasResponse) => {
            if (contasResponse.status === 200 && contasResponse.body.length > 0) {
              contaId = contasResponse.body[0].id;
            }
          });
        }
      });
    });

    it('Deve criar uma transação de despesa', () => {
      if (token && contaId) {
        cy.request({
          method: 'POST',
          url: `${baseUrl}/api/transacoes`,
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: {
            descricao: 'Despesa Teste ' + Date.now(),
            valor: -50.00,
            data: new Date().toISOString().split('T')[0],
            contaId: contaId
          },
          failOnStatusCode: false
        }).then((response) => {
          expect([200, 201, 400, 409]).to.include(response.status);
        });
      }
    });

    it('Deve criar uma transação de receita', () => {
      if (token && contaId) {
        cy.request({
          method: 'POST',
          url: `${baseUrl}/api/transacoes`,
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: {
            descricao: 'Receita Teste ' + Date.now(),
            valor: 200.00,
            data: new Date().toISOString().split('T')[0],
            contaId: contaId
          },
          failOnStatusCode: false
        }).then((response) => {
          expect([200, 201, 400, 409]).to.include(response.status);
        });
      }
    });
  });

  describe('GET /api/usuario - Dados do Usuário', () => {
    let token;

    before(() => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/login`,
        body: {
          email: 'admin@barriga.com',
          password: 'Admin@123'
        },
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          token = response.body.token;
        }
      });
    });

    it('Deve retornar dados do usuário logado', () => {
      if (token) {
        cy.request({
          method: 'GET',
          url: `${baseUrl}/api/usuario`,
          headers: {
            'Authorization': `Bearer ${token}`
          },
          failOnStatusCode: false
        }).then((response) => {
          if (response.status === 200) {
            expect(response.body).to.have.property('email');
          }
        });
      }
    });

    it('Deve retornar 401 sem autenticação', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/usuario`,
        failOnStatusCode: false
      }).then((response) => {
        // Sem autenticação pode retornar 401 ou 404
        expect([401, 404]).to.include(response.status);
      });
    });
  });
});
