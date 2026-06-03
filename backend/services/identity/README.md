# Dinero — Identity Service

Microsservico de **identidade** do Dinero.
Responsavel por cadastro/login de usuario, gestao de perfil (nome, email, telefone,
data de nascimento, localizacao), preferencias (moeda padrao e tema) e publicacao
de eventos via RabbitMQ para os demais contextos (Financial, Portfolio, OpenFinance).

## Stack

| Item | Tecnologia |
| --- | --- |
| Framework | NestJS 11 |
| ORM | Drizzle ORM (PostgreSQL via `pg` pool) |
| Mensageria | RabbitMQ (`amqplib`) |
| Auth | JWT global guard + decorator `@Public()` |
| Docs | Swagger em `/docs` |
| HATEOAS | Decorators `@HateoasItem` / `@HateoasList` |
| Lint/Format | Biome (aspas duplas) |
| Testes | Jest + ts-jest |
| Hash de senha | bcryptjs (salt 10) |

## Estrutura

```
services/identity/
├── .env.example
├── drizzle.config.ts
├── drizzle/                       # migracoes geradas (0000, 0001) + seed (0002)
├── jest.config.ts
├── nest-cli.json
├── package.json
├── tsconfig.json / tsconfig.build.json
├── src/
│   ├── main.ts                    # bootstrapHttpApp() do shared
│   ├── app.module.ts
│   └── modules/
│       ├── auth/                  # login, register, emissao de JWT
│       ├── users/                 # CRUD de usuario, dominio, repo, messaging
│       └── preferences/           # moeda padrao + dark mode
└── test/                          # testes unitarios (.spec.ts)
```

Cada modulo segue as camadas `application/` (dto + services), `domain/`
(models + repositories) e `infra/` (controllers + database + repositories).

## Entidades

- **User**: `name`, `email`, `passwordHash`, `phone?`, `birthDate?`, `location?`
- **UserPreference**: `userId`, `defaultCurrency` (`BRL` | `USD` | `EUR`), `darkMode`

Ao registrar um usuario, uma preferencia padrao (`BRL`, `darkMode: true`) e criada
automaticamente.

## Endpoints

Prefixo global: `/v1`.

| Metodo | Rota | Auth | Descricao |
| --- | --- | --- | --- |
| `POST` | `/v1/auth/register` | Public | Cadastro (retorna JWT + user) |
| `POST` | `/v1/auth/login` | Public | Login (retorna JWT + user) |
| `GET` | `/v1/users` | JWT | Listar usuarios (paginado, HATEOAS) |
| `GET` | `/v1/users/me` | JWT | Perfil do usuario autenticado |
| `GET` | `/v1/users/:id` | JWT | Buscar usuario por ID |
| `PUT` | `/v1/users/:id` | JWT | Atualizar perfil (`204`) |
| `DELETE` | `/v1/users/:id` | JWT | Remover conta (`204`) |
| `GET` | `/v1/preferences/me` | JWT | Preferencias do autenticado |
| `PUT` | `/v1/preferences/currency` | JWT | Atualizar moeda padrao |

Paginacao em `GET /v1/users` via query `_page` e `_size`.

## Eventos RabbitMQ publicados

O Identity e **upstream**: publica eventos para que outros servicos mantenham
projecoes locais do usuario.

| Exchange | Routing key | Disparo |
| --- | --- | --- |
| `identity.users.created.exchange` | `user.created` | Apos `POST /v1/auth/register` |
| `identity.users.updated.exchange` | `user.updated` | Apos `PUT /v1/users/:id` |
| `identity.users.deleted.exchange` | `user.deleted` | Apos `DELETE /v1/users/:id` |

Todas as exchanges sao `direct` e `durable`, declaradas no startup do servico.

## Variaveis de ambiente

Copie `.env.example` para `.env`:

```env
PORT=4006
JWT_SECRET=super-secret
DATABASE_URL=postgres://postgres:postgres@localhost:5432/dinero_identity
RABBITMQ_URL=amqp://admin:admin@localhost:5672
```

> O `JWT_SECRET` deve ser o mesmo nos demais servicos do Dinero.
> A porta padrao e `4006` (a `4001` ja e usada pelo servico `academic` do projeto-modelo).

## Como rodar

### Opcao A — Docker Compose (recomendado)

A partir de `backend/`, sobe Postgres + RabbitMQ + o servico identity:

```bash
docker compose up -d --build postgres rabbitmq identity
```

O container do identity roda automaticamente `npm run db:migrate` (aplica schema +
seed do admin) e depois `npm run start:prod`.

Servico disponivel em `http://localhost:4006` · Swagger em `http://localhost:4006/docs`.

> Se o volume do Postgres ja existir sem o banco `dinero_identity`, crie-o uma vez:
> `docker compose exec postgres psql -U postgres -c "CREATE DATABASE dinero_identity;"`
> ou recrie o ambiente com `docker compose down -v`.

### Opcao B — Local (sem Docker para o servico)

```bash
cd services/identity
cp .env.example .env
npm install
npm run db:migrate     # aplica migracoes 0000, 0001 e o seed 0002
npm run start:dev      # hot reload
```

Requer um PostgreSQL acessivel em `DATABASE_URL` e um RabbitMQ em `RABBITMQ_URL`.

## Scripts uteis

| Comando | Acao |
| --- | --- |
| `npm run start:dev` | Sobe com hot reload |
| `npm run build` | Compila para `dist/` |
| `npm run start:prod` | Roda o build (`dist/services/identity/src/main.js`) |
| `npm run db:generate` | Gera nova migracao a partir dos schemas Drizzle |
| `npm run db:migrate` | Aplica as migracoes pendentes |
| `npm run db:studio` | Abre o Drizzle Studio |
| `npm test` | Roda os testes unitarios (Jest) |
| `npm run typecheck` | Checagem de tipos sem emitir |
| `npm run check` | Lint + format check (Biome) |

## Usuario seed

A migracao `0002_seed_admin.sql` cria um usuario administrador:

- email: `admin@dinero.app`
- senha: `Admin123`
