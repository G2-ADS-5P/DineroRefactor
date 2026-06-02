# Financial Service

Microsserviço responsável pelo domínio financeiro do Dinero: transações, cartões, categorias, saldo, conciliação de duplicatas e sincronização com o app mobile.

## Stack
- NestJS 11
- Drizzle ORM + PostgreSQL
- RabbitMQ (amqplib)
- Swagger
- HATEOAS via decorators do shared
- Biome (lint/format), Jest (test)

## Portas
- HTTP: 4007
- Swagger: http://localhost:4007/docs

## Módulos
- `users` — projeção local de usuários do Identity (via consumer RabbitMQ)
- `categories` — CRUD de categorias hierárquicas (parent/child)
- `cards` — CRUD de cartões
- `transactions` — CRUD de transações com soft delete + publish de eventos
- `balance` — agregação de saldo por período/categoria
- `reconciliation` — detecção e resolução de duplicatas
- `sync` — push/pull/status para o mobile com idempotência via clientUuid

## Mensageria

### Eventos publicados
- `financial.transactions.created.exchange` (rk: `transaction.created`)
- `financial.transactions.updated.exchange` (rk: `transaction.updated`)
- `financial.transactions.deleted.exchange` (rk: `transaction.deleted`)

### Eventos consumidos (do Identity)
- `identity.users.created.exchange` → `financial.identity-users.created.queue`
- `identity.users.updated.exchange` → `financial.identity-users.updated.queue`
- `identity.users.deleted.exchange` → `financial.identity-users.deleted.queue`

Optamos por uma queue por routing key (não uma queue única bound aos 3 exchanges) para permitir DLQ e métricas independentes por tipo de evento.

## UserId externo vs local
Cada user tem um `external_id` (do Identity) e um `id` local. O `UserService.ensureLocalUser(externalId)` cria stub local se não existir — resolve race entre primeira requisição autenticada e chegada do evento `user.created` no consumer.

## Banco

Banco dedicado: `dinero_financial` no Postgres da raiz (porta 5432).

### Migrations no Windows
`npm run db:migrate` trava por bug de TTY/spinner do drizzle-kit. Workaround:
- **Recomendado:** rodar via WSL, Docker, ou `docker compose` (que executa em Linux)
- **Alternativa:** aplicar SQL direto via `psql` + registrar manualmente em `__drizzle_migrations`

No CI (Linux) e no `docker-compose up` funciona normal.

## Como subir local

Via docker (recomendado):
```bash
docker compose up -d postgres rabbitmq
# espera healthchecks
docker compose up -d financial
docker compose logs -f financial
```

Via npm (sem docker):
```bash
cd services/financial
npm install
npm run db:migrate    # ou aplicação manual no Windows
npm run start:dev
```

## Endpoints principais

Prefixo global: `/v1`

| Método | Path | Descrição |
|---|---|---|
| GET | /transactions | Lista paginada |
| POST | /transactions | Cria transaction |
| GET | /transactions/:id | Busca por id |
| PATCH | /transactions/:id | Atualiza |
| DELETE | /transactions/:id | Soft delete |
| GET | /balance/summary | Saldo agregado |
| GET | /reconciliation/duplicates | Lista grupos de duplicatas |
| POST | /reconciliation/duplicates/resolve | Resolve grupos |
| POST | /sync/push | Push de transactions do mobile |
| GET | /sync/pull?since= | Pull incremental |
| GET | /sync/status | Último log de sync |

Documentação completa no Swagger.

## Testes

```bash
npm run test          # unit (Jest)
npm run typecheck     # tsc --noEmit
npm run check         # biome
```
