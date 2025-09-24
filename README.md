# PixelGate

PixelGate é uma plataforma web para gerenciamento de jogos, usuários, permissões, categorias e vendas, desenvolvida como projeto acadêmico.  
O sistema possui painel administrativo completo, autenticação, controle de permissões, CRUDs para todas as entidades e integração com banco de dados relacional.

---

## 📦 Funcionalidades

- Cadastro e autenticação de usuários
- Gerenciamento de cargos e permissões (ACL)
- CRUD de jogos, categorias, usuários, cargos, permissões
- Biblioteca de jogos do usuário
- Carrinho de compras
- Painel administrativo protegido por permissões
- Responsividade e usabilidade aprimoradas

---

## 🗄️ Modelo do Banco de Dados

O banco de dados foi modelado conforme o diagrama abaixo:

![DER do Banco de Dados](DER_BD/DER_PixelGate.png)

---

## 🚀 Como rodar o projeto

1. Clone o repositório
2. Instale as dependências do backend e frontend
3. Configure o banco de dados do projeto no arquivo database.js e pgAdmin
4. Execute os scripts de criação e inserção que estão em `/backend/data/createTables.sql` e `/backend/data/insert.sql`
5. Para iniciar o servidor:
   ```bash
   npm install
   cd backend
   node server.js
   ```
6. Inicie o frontend, abrindo o link do servidor no console

---

## 🛠️ Testes das APIs

Todas as APIs REST foram testadas utilizando o [Postman](https://www.postman.com/), garantindo o funcionamento dos endpoints de autenticação, CRUDs e permissões.

---

## 📹 Vídeo no Youtube

*https://youtu.be/VYo7f5ZxfyE*
