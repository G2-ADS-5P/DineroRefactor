# Dinero Backend Monorepo

Backend de microsserviços do **Dinero**, app de gestão de finanças pessoais.

## Serviços

| Serviço | Porta | Banco | Responsabilidade |
| --- | --- | --- | --- |
| identity | 4008 | dinero_identity | Usuários, autenticação, perfil, preferências, planos/trial |
| financial | 4009 | dinero_financial | Cartões, transações, categorias, saldo |
| portfolio | 4007 | dinero_portfolio | Carteira de investimentos, cotações via Brapi |
| openfinance | 4006 | dinero_openfinance | Integração Open Finance via Pluggy (sandbox) |

## Eventos RabbitMQ

| Serviço | Publica | Consome |
| --- | --- | --- |
| identity | user.created/updated/deleted | — |
| financial | transaction.created/updated/deleted | user.* do identity |
| portfolio | — | user.* do identity |
| openfinance | bank-connection.created/revoked | user.* do identity |

## Stack

- NestJS + TypeScript
- Drizzle ORM + PostgreSQL (database per service)
- RabbitMQ (mensageria assíncrona)
- JWT (autenticação global) + Permissions (autorização)
- Swagger (docs em `/docs` por serviço)
- HATEOAS (links de navegação nas respostas)
- Biome (lint + format)

## Subir o ambiente

```bash
docker compose up --build -d
```

Aguardar ~30s para PostgreSQL e RabbitMQ ficarem healthy. Os serviços rodam migrações e iniciam automaticamente.

Acessar:
- Swagger: `http://localhost:{porta}/docs`
- RabbitMQ Management: http://localhost:15672 (admin/admin)
- Adminer (DB): http://localhost:8080

## Desenvolvimento local

```bash
docker compose up -d postgres rabbitmq adminer
cd services/<serviço> && npm run db:migrate && npm run start:dev
```

## Scripts raiz

```bash
npm run start:<serviço>       # inicia em modo dev
npm run typecheck:all         # typecheck de todos os serviços
npm run lint:all              # lint de todos os serviços
npm run check:all             # biome check de todos os serviços
npm run validate:all          # check + typecheck
npm run test:<serviço>        # testes unitários do serviço
```
