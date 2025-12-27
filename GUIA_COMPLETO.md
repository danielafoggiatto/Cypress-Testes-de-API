# Guia Completo - Testes de API com Cypress

## ✅ Status

**Projeto:** Testes de API com Cypress para Barriga React  
**Status:** ✅ Funcionando (19/19 testes passando)  
**Data:** Dezembro 2025

---

## 🚀 Quick Start

### 1. Abrir a Interface Gráfica do Cypress

```bash
npm run cypress:open
```

Depois selecione:

- **E2E Testing**
- **Chrome** (ou navegador de sua preferência)
- Clique no arquivo de teste desejado

### 2. Rodar Testes em Modo Headless

```bash
# Todos os testes
npm run cypress:run

# Teste específico
npm run cypress:run -- --spec "cypress/e2e/06-barriga-realista.cy.js"

# Com navegador específico
npm run cypress:run -- --browser chrome
```

---

## 📁 Arquivos de Teste

### `06-barriga-realista.cy.js` ⭐ **RECOMENDADO**

Testes funcionais reais para a API do Barriga React com 19 casos de teste:

**Testes de Autenticação:**

- ✅ Login com credenciais válidas
- ✅ Login com email inválido
- ✅ Login com senha incorreta
- ✅ Validações de campos obrigatórios

**Testes de Contas:**

- ✅ Listar contas
- ✅ Criar nova conta
- ✅ Validar campos obrigatórios

**Testes de Transações:**

- ✅ Listar transações
- ✅ Filtrar por mês/ano
- ✅ Criar despesa
- ✅ Criar receita

**Testes de Usuário:**

- ✅ Obter dados do usuário logado
- ✅ Validações de segurança/autenticação

### Outros Arquivos (Exemplos de Padrões)

- `01-accounts.cy.js` - Padrão básico de testes CRUD
- `02-transactions.cy.js` - Testes com dependências de dados
- `03-users.cy.js` - Testes de autenticação
- `04-advanced.cy.js` - Testes avançados (performance, fluxos, segurança)
- `05-e2e-integrated.cy.js` - Testes E2E integrados

---

## 🔑 Comandos Customizados Disponíveis

No arquivo `cypress/support/commands.js`:

### `cy.login(email, password)`

Faz login e armazena token no localStorage

```javascript
cy.login("admin@barriga.com", "Admin@123");
```

### `cy.cleanupTestData()`

Limpa localStorage e sessionStorage

```javascript
cy.cleanupTestData();
```

---

## 📊 Exemplos de Requisições

### GET Request

```javascript
cy.request({
  method: "GET",
  url: "https://barrigareact.wcaquino.me/api/contas",
  headers: {
    Authorization: "Bearer SEU_TOKEN",
  },
}).then((response) => {
  expect(response.status).to.equal(200);
  expect(response.body).to.be.an("array");
});
```

### POST Request

```javascript
cy.request({
  method: "POST",
  url: "https://barrigareact.wcaquino.me/api/contas",
  headers: {
    Authorization: "Bearer SEU_TOKEN",
  },
  body: {
    nome: "Minha Conta",
  },
}).then((response) => {
  expect(response.status).to.equal(201);
  expect(response.body).to.have.property("id");
});
```

### Requisição que Pode Falhar

```javascript
cy.request({
  method: "DELETE",
  url: "https://barrigareact.wcaquino.me/api/contas/999",
  failOnStatusCode: false, // Não falha se erro HTTP
}).then((response) => {
  expect(response.status).to.equal(404);
});
```

---

## 🎯 Endpoints da API Barriga

| Método | Endpoint          | Descrição              | Autenticação |
| ------ | ----------------- | ---------------------- | ------------ |
| POST   | `/api/login`      | Fazer login            | Não          |
| POST   | `/api/signup`     | Registrar novo usuário | Não          |
| GET    | `/api/contas`     | Listar contas          | Sim          |
| POST   | `/api/contas`     | Criar conta            | Sim          |
| GET    | `/api/contas/:id` | Obter conta específica | Sim          |
| PUT    | `/api/contas/:id` | Atualizar conta        | Sim          |
| DELETE | `/api/contas/:id` | Deletar conta          | Sim          |
| GET    | `/api/transacoes` | Listar transações      | Sim          |
| POST   | `/api/transacoes` | Criar transação        | Sim          |
| GET    | `/api/usuario`    | Dados do usuário       | Sim          |

---

## 🔐 Credenciais de Teste

```
Email: admin@barriga.com
Senha: Admin@123
```

**Nota:** Essas são credenciais de exemplo. Você pode registrar novas contas usando `/api/signup`.

---

## 📈 Assertions Comuns

```javascript
// Status Code
expect(response.status).to.equal(200);
expect(response.status).to.be.oneOf([200, 201]);
expect(response.status).to.be.at.least(400);

// Body Properties
expect(response.body).to.have.property("id");
expect(response.body.nome).to.equal("Teste");
expect(response.body).to.be.an("array");

// Headers
expect(response.headers["content-type"]).to.include("application/json");

// Textos
expect(response.body.message).to.contain("sucesso");
```

---

## 🛠️ Estrutura de Arquivo de Teste

```javascript
/// <reference types="cypress" />

describe("API - Descrição do Grupo", () => {
  let token;
  const baseUrl = "https://barrigareact.wcaquino.me";

  before(() => {
    // Setup: executado uma vez antes de todos os testes
    cy.request({
      method: "POST",
      url: `${baseUrl}/api/login`,
      body: { email: "admin@barriga.com", password: "Admin@123" },
    }).then((response) => {
      token = response.body.token;
    });
  });

  describe("GET /api/contas", () => {
    it("Deve retornar lista de contas", () => {
      // Arrange (preparar), Act (agir), Assert (validar)
      cy.request({
        method: "GET",
        url: `${baseUrl}/api/contas`,
        headers: { Authorization: `Bearer ${token}` },
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an("array");
      });
    });
  });
});
```

---

## 📋 Checklist de Testes Implementados

### Autenticação ✅

- [x] Login bem-sucedido
- [x] Email inválido
- [x] Senha incorreta
- [x] Campos obrigatórios

### Contas ✅

- [x] Listar contas
- [x] Criar nova conta
- [x] Validar campos

### Transações ✅

- [x] Listar transações
- [x] Filtrar por período
- [x] Criar transação

### Segurança ✅

- [x] Requisições sem autenticação
- [x] Tokens inválidos
- [x] Validação de dados

---

## 🐛 Troubleshooting

### "Network Error" na requisição

- Verifique se está online
- Verifique se a URL está correta
- Valide o status da API em https://barrigareact.wcaquino.me

### "401 Unauthorized"

- Token expirado ou inválido
- Faça login novamente antes do teste
- Valide se token está sendo passado corretamente

### "Cypress won't open"

```bash
# Limpar cache do Cypress
npx cypress cache clear

# Reinstalar dependências
rm -r node_modules package-lock.json
npm install
```

### "Timeout"

- Aumentar timeout em `cypress.config.js`
- Validar conexão de rede
- Verificar se a API está respondendo

---

## 📚 Recursos Adicionais

- [Cypress Documentation](https://docs.cypress.io/)
- [Cypress API Testing](https://docs.cypress.io/api/commands/request)
- [Barriga React](https://barrigareact.wcaquino.me/)
- [HTTP Status Codes](https://http.cat/)

---

## 💡 Dicas e Boas Práticas

### 1. Use `failOnStatusCode: false` para Validar Erros

```javascript
cy.request({
  method: "POST",
  url: "/api/contas",
  body: {},
  failOnStatusCode: false, // Não falha no erro
}).then((response) => {
  expect(response.status).to.be.at.least(400);
});
```

### 2. Armazene Dados em Variáveis

```javascript
let contaId;
cy.request({...}).then((response) => {
  contaId = response.body.id;  // Salve para usar depois
});
```

### 3. Teste Fluxos Completos

```javascript
// 1. Criar conta → 2. Criar transação → 3. Listar → 4. Deletar
```

### 4. Use Timestamps para Dados Únicos

```javascript
const nomeConta = "Conta " + Date.now(); // Sempre único
```

### 5. Valide a Resposta Completamente

```javascript
expect(response.status).to.equal(200);
expect(response.body).to.have.property("id");
expect(response.body.nome).to.be.a("string");
```

---

## 🎓 Próximos Passos

1. **Explorar a Interface Gráfica:** Abra `npm run cypress:open`
2. **Rodar os Testes:** Execute `npm run cypress:run`
3. **Criar Novos Testes:** Adicione casos personalizados em `cypress/e2e/`
4. **Integrar CI/CD:** Configure em GitHub Actions ou Jenkins
5. **Adicionar Relatórios:** Use plugins de relatório do Cypress

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique o README.md
2. Consulte a documentação do Cypress
3. Valide as credenciais e URLs
4. Limpe o cache: `npx cypress cache clear`

---

**Desenvolvido com ❤️ em Dezembro 2025**
