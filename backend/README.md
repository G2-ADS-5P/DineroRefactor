# School Control Monorepo

Projeto de estudo de microservicos para controle escolar, organizado como um monorepo com servicos NestJS independentes, bancos separados por contexto e comunicacao assincrona via RabbitMQ.

Cada micro-servico possui:

- API HTTP com prefixo global `/v1`
- documentacao Swagger em `/docs`
- banco PostgreSQL proprio
- integracao por eventos para manter projecoes locais entre contextos
- autenticacao JWT e autorizacao por permissoes

## O que o projeto cobre

O dominio foi separado em cinco contextos:

| Micro-servico | Porta padrao | Banco padrao | Responsabilidade principal |
| --- | --- | --- | --- |
| `academic` | `4001` | `school_academic` | Gerenciar alunos, professores e disciplinas |
| `class-offering` | `4002` | `school_class_offering` | Gerenciar ofertas de turma e seu status |
| `enrollment` | `4003` | `school_enrollment` | Matricular alunos em turmas |
| `attendance` | `4004` | `school_attendance` | Registrar e consultar presencas |
| `user-auth` | `4005` | `school_user_auth` | Gerenciar usuarios, login, JWT e permissoes |

## Relacao entre os servicos

| Micro-servico | Publica eventos | Consome eventos |
| --- | --- | --- |
| `academic` | `student.created/updated/deleted`, `teacher.created/updated/deleted`, `subject.created/updated/deleted` | Nenhum |
| `class-offering` | `class-offering.created/updated/canceled` | Professores e disciplinas do `academic` |
| `enrollment` | `enrollment.created/canceled` | Alunos do `academic` e turmas do `class-offering` |
| `attendance` | `attendance.registered` | Alunos do `academic`, turmas do `class-offering` e matriculas do `enrollment` |
| `user-auth` | Nenhum | Professores do `academic` |

Como os servicos mantem projecoes locais a partir de eventos, o ideal e subir todos antes de comecar a cadastrar dados.

## Pre-requisitos

- Node.js com `npm`
- PostgreSQL
- RabbitMQ
- Docker e Docker Compose

Voce pode usar uma unica instancia do PostgreSQL, desde que crie cinco bancos:

- `school_academic`
- `school_class_offering`
- `school_enrollment`
- `school_attendance`
- `school_user_auth`

## Variaveis de ambiente

Todos os servicos usam as mesmas quatro variaveis:

```env
PORT=4001
JWT_SECRET=super-secret
DATABASE_URL=postgres://postgres:postgres@localhost:5432/school_academic
RABBITMQ_URL=amqp://admin:admin@localhost:5672
```

Observacoes importantes:

- O `JWT_SECRET` deve ser o mesmo em todos os servicos.
- O `DATABASE_URL` muda de acordo com o banco de cada micro-servico.
- O `PORT` muda de acordo com o servico.
- Os arquivos de exemplo ja existem em `services/*/.env.example`.

## Como rodar

### Com Docker Compose

O jeito mais rapido de subir todo o ambiente e usar o `docker-compose.yml` da raiz. Ele sobe:

- os 5 micro-servicos
- 1 instancia do PostgreSQL com 5 bancos separados
- 1 instancia do RabbitMQ
- 1 instancia do Adminer

Subir tudo com build:

```bash
docker compose up --build
```

Subir em background:

```bash
docker compose up --build -d
```

Parar os containers sem remover volumes:

```bash
docker compose down
```

Parar e remover containers, rede e volumes:

```bash
docker compose down -v
```

Se quiser recriar as imagens do zero:

```bash
docker compose build --no-cache
docker compose up -d
```

Endpoints uteis depois que o ambiente subir:

- `academic`: `http://localhost:4001/docs`
- `class-offering`: `http://localhost:4002/docs`
- `enrollment`: `http://localhost:4003/docs`
- `attendance`: `http://localhost:4004/docs`
- `user-auth`: `http://localhost:4005/docs`
- `Adminer`: `http://localhost:8080`
- `RabbitMQ Management`: `http://localhost:15672`

Credenciais padrao:

- PostgreSQL: usuario `postgres`, senha `postgres`
- RabbitMQ: usuario `admin`, senha `admin`
- Usuario admin seedado no `user-auth`: email `admin@school.com`, senha `senha123`

No Adminer, use:

- Sistema: `PostgreSQL`
- Servidor: `postgres`
- Usuario: `postgres`
- Senha: `postgres`
- Base de dados: uma das bases do projeto, como `school_academic`

Observacao:

- O script de criacao dos bancos roda na inicializacao do Postgres. Se voce ja tiver um volume antigo sem os bancos criados, rode `docker compose down -v` antes de subir novamente.
- A seed do `user-auth` e aplicada na criacao inicial do banco. Se voce quiser garantir o usuario padrao `admin@school.com` com senha `admin123`, recrie o ambiente com `docker compose down -v` e depois suba novamente.

### Rodando manualmente

Fluxo recomendado:

1. Inicie PostgreSQL e RabbitMQ.
2. Copie o `.env.example` para `.env` em cada servico.
3. Instale as dependencias de cada servico com `npm install`.
4. Rode as migrations de cada banco com `npm run db:migrate`.
5. Suba os servicos com `npm run start:dev`.

## Como rodar cada micro-servico

### `academic`

Responsabilidade:
Gerencia os cadastros base do sistema: alunos, professores e disciplinas.

Principais rotas:
- `GET/POST /v1/students`
- `GET/PUT/DELETE /v1/students/:id`
- `GET/POST /v1/teachers`
- `GET/PUT/DELETE /v1/teachers/:id`
- `GET/POST /v1/subjects`
- `GET/PUT/DELETE /v1/subjects/:id`

Comandos:

```bash
cd services/academic
cp .env.example .env
npm install
npm run db:migrate
npm run start:dev
```

Swagger:
`http://localhost:4001/docs`

### `class-offering`

Responsabilidade:
Gerencia turmas ofertadas, vinculando professores e disciplinas que chegam do `academic`.

Principais rotas:
- `GET/POST /v1/classOfferings`
- `GET /v1/classOfferings/:id`
- `PATCH /v1/classOfferings/:id/activate`
- `PATCH /v1/classOfferings/:id/deactivate`

Comandos:

```bash
cd services/class-offering
cp .env.example .env
npm install
npm run db:migrate
npm run start:dev
```

Swagger:
`http://localhost:4002/docs`

### `enrollment`

Responsabilidade:
Gerencia matriculas de alunos em turmas, usando projecoes locais de alunos e ofertas de turma.

Principais rotas:
- `GET /v1/enrollments?class_offering_id=<id>`
- `POST /v1/enrollments`
- `PATCH /v1/enrollments/:id/cancel`

Comandos:

```bash
cd services/enrollment
cp .env.example .env
npm install
npm run db:migrate
npm run start:dev
```

Swagger:
`http://localhost:4003/docs`

### `attendance`

Responsabilidade:
Registra e consulta presencas com base nas projecoes de alunos, turmas e matriculas.

Principais rotas:
- `GET /v1/attendances?class_offering_id=<id>`
- `GET /v1/attendances?class_offering_id=<id>&student_id=<id>`
- `POST /v1/attendances`

Comandos:

```bash
cd services/attendance
cp .env.example .env
npm install
npm run db:migrate
npm run start:dev
```

Swagger:
`http://localhost:4004/docs`

### `user-auth`

Responsabilidade:
Gerencia usuarios, autentica login, emite JWT e aplica autorizacao por permissoes. Tambem consome eventos de professores para manter o relacionamento entre usuario e docente.

Principais rotas:
- `POST /v1/auth/login`
- `GET/POST /v1/users`
- `GET/PUT/DELETE /v1/users/:id`

Comandos:

```bash
cd services/user-auth
cp .env.example .env
npm install
npm run db:migrate
npm run start:dev
```

Swagger:
`http://localhost:4005/docs`

## Atalhos a partir da raiz

Depois que as dependencias de cada servico estiverem instaladas, voce tambem pode subir os processos a partir da raiz do monorepo:

```bash
npm run start:academic
npm run start:class-offering
npm run start:enrollment
npm run start:attendance
npm run start:user-auth
```

## Autenticacao e permissoes

- O login e feito em `POST /v1/auth/login`.
- O token JWT emitido pelo `user-auth` deve ser enviado como `Bearer Token` nos demais servicos.
- As permissoes usadas no projeto seguem o formato `recurso:acao`, por exemplo:
  - `students:read`
  - `students:write`
  - `teachers:read`
  - `class-offerings:write`
  - `enrollments:delete`
  - `attendances:write`

## Ordem sugerida para testes integrados

Se a ideia for testar o fluxo completo do dominio, esta ordem ajuda:

1. `user-auth`
2. `academic`
3. `class-offering`
4. `enrollment`
5. `attendance`

Fluxo de negocio esperado:

1. Cadastrar professores, disciplinas e alunos no `academic`
2. Criar turmas no `class-offering`
3. Matricular alunos no `enrollment`
4. Registrar presencas no `attendance`
5. Autenticar e testar autorizacao pelo `user-auth`
