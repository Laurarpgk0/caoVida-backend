# CaoVida — Backend

## 1. Descrição do projeto

O CaoVida é um aplicativo desenvolvido para auxiliar no gerenciamento de consultas e vacinas de cães e gatos.

O backend disponibiliza uma API REST responsável pela autenticação das requisições, cadastro e gerenciamento de consultas, controle de acesso por perfil e integração com serviços em nuvem.

## 2. Arquitetura

O projeto utiliza:

- Node.js para execução do servidor.
- Express para criação da API REST.
- MongoDB com Mongoose para persistência dos dados das consultas.
- Supabase Auth para autenticação dos usuários.
- Supabase Profiles para gerenciamento dos perfis e identificação dos responsáveis.
- Render para hospedagem do backend.

## 3. Endereço da API

URL de produção:

https://caovida-backend.onrender.com

Verificação de funcionamento:

GET /health

## 4. Estrutura do projeto

- `server.js`: implementação do servidor, autenticação e rotas.
- `package.json`: dependências e scripts.
- `package-lock.json`: versões das dependências.
- `.gitignore`: arquivos que não devem ser enviados ao repositório.
- `.env`: configurações locais e credenciais, não versionadas.

## 5. Dependências

- express
- mongoose
- @supabase/supabase-js
- cors
- dotenv

## 6. Variáveis de ambiente

Criar um arquivo `.env` na raiz do projeto, utilizando as seguintes variáveis:

```env
MONGODB_URI=
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
PORT=3000
```

Os valores devem ser preenchidos com as configurações dos serviços utilizados.

Não compartilhar ou publicar chaves, senhas ou strings de conexão.

## 7. Instalação e execução

Pré-requisito: Node.js e npm instalados.

Clonar o repositório:

```bash
git clone https://github.com/Laurarpgk0/caoVida-backend.git
```

Entrar na pasta:

```bash
cd caoVida-backend
```

Instalar dependências:

```bash
npm install
```

Configurar o arquivo `.env`.

Iniciar o servidor:

```bash
npm start
```

## 8. Endpoints da API

### Verificação

| Método | Endpoint | Finalidade |
|---|---|---|
| GET | `/health` | Verificar funcionamento da API |

### Consultas

| Método | Endpoint | Finalidade |
|---|---|---|
| GET | `/api/consultas` | Listar consultas do usuário autenticado |
| POST | `/api/consultas` | Cadastrar consulta |
| PATCH | `/api/consultas/:id` | Atualizar consulta |
| DELETE | `/api/consultas/:id` | Excluir consulta |

As rotas de consultas exigem autenticação.

### Administração

| Método | Endpoint | Finalidade |
|---|---|---|
| GET | `/api/admin/resumo` | Consultar indicadores administrativos |
| GET | `/api/admin/consultas` | Consultar registros e responsáveis |

As rotas administrativas exigem autenticação e perfil de administrador.

## 9. Dados das consultas

Os registros utilizam os seguintes campos:

- `petNome`: nome do animal.
- `raca`: raça do animal.
- `tipoConsulta`: consulta ou vacina cadastrada.
- `dataDaVacina`: data informada.
- `applied`: situação de aplicação.
- `clientMutationId`: identificador de operação utilizado na sincronização.
- `userId`: identificador do usuário responsável.

O backend utiliza uma restrição de unicidade por usuário e identificador da operação para ajudar a evitar registros duplicados durante a sincronização.

## 10. Perfis de teste

O sistema possui dois perfis:

**Administrador**
- Acesso ao painel administrativo.
- Visualização do resumo das consultas.
- Visualização das consultas cadastradas e seus responsáveis.

**Aluno**
- Cadastro de consultas.
- Visualização das próprias consultas.
- Atualização e exclusão dos próprios registros.

Utilizar contas de teste previamente cadastradas no Supabase. As credenciais não devem ser publicadas neste repositório.

## 11. Roteiro de validação

1. Acessar a API pelo endpoint `/health`.
2. Realizar login com um usuário aluno.
3. Cadastrar uma consulta.
4. Verificar se o registro foi salvo no banco de dados.
5. Consultar os registros do aluno autenticado.
6. Atualizar e excluir uma consulta.
7. Entrar com o perfil administrador.
8. Acessar o resumo administrativo.
9. Consultar os registros de diferentes usuários.
10. Tentar acessar uma rota administrativa com perfil de aluno e verificar o bloqueio.
11. Testar o aplicativo sem internet e verificar a sincronização após recuperar a conexão.
12. Confirmar que a sincronização não gera registros duplicados.

## 12. Segurança

- Autenticação das requisições por token Supabase.
- Controle de acesso por perfil.
- Consultas vinculadas ao usuário autenticado.
- Proteção das rotas administrativas.
- Credenciais armazenadas em variáveis de ambiente.
- Arquivo `.env` excluído do controle de versão.

## 13. Repositório

Código-fonte do backend:

https://github.com/Laurarpgk0/caoVida-backend

## 14. Hospedagem

Backend publicado em:

https://caovida-backend.onrender.com

Banco de dados: MongoDB em nuvem.

Autenticação e perfis: Supabase.