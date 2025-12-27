# ⚡ Quick Start - Testes Cypress API

## 🎯 Comece Aqui em 3 Passos

### 1. Abra a Interface Gráfica
```bash
npm run cypress:open
```

### 2. Selecione o Teste
- Clique em `E2E Testing`
- Selecione `Chrome`
- Clique em `06-barriga-realista.cy.js`

### 3. Veja os Testes Rodando ✅
Todos os 19 testes devem passar!

---

## 🖥️ Ou Rode no Terminal

```bash
# Todos os testes
npm run cypress:run

# Apenas o teste da API real
npm run cypress:run -- --spec "cypress/e2e/06-barriga-realista.cy.js"
```

---

## 📖 Documentação

- **Guia Completo:** Leia `GUIA_COMPLETO.md`
- **Sumário do Projeto:** Leia `PROJECT_SUMMARY.md`
- **Detalhes da API:** Leia `README.md`

---

## 🔑 Credenciais de Teste

```
Email: admin@barriga.com
Senha: Admin@123
```

---

## ✅ Testes Implementados

✅ 19 testes passando
- 5 testes de autenticação
- 3 testes de contas
- 3 testes de transações
- 2 testes de usuário
- 3 testes de signup
- 2 testes de filtros
- 1 teste de health check

---

## 💡 Dicas Rápidas

**Ver detalhes de um teste:**
```bash
npm run cypress:run -- --spec "cypress/e2e/06-barriga-realista.cy.js" --headed
```

**Rodar com navegador diferente:**
```bash
npm run cypress:run -- --browser firefox
```

**Gerar relatório:**
```bash
npm run cypress:run -- --reporter html
```

---

## 🔗 Links Úteis

- [Documentação Cypress](https://docs.cypress.io/)
- [Barriga React](https://barrigareact.wcaquino.me/)
- [HTTP Status Codes](https://httpcat.com/)

---

**Pronto para testar? Execute `npm run cypress:open` agora!** 🚀
