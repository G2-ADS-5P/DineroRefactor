# Dinero — Gestor de Finanças Pessoais

Aplicação full-stack de gestão financeira pessoal com suporte a múltiplas moedas, integração com Open Finance e rastreamento de portfólio de investimentos.

## Visão Geral

O Dinero é composto por um app mobile Flutter e um backend de microsserviços NestJS. A arquitetura separa claramente as responsabilidades em quatro serviços independentes comunicando-se via RabbitMQ, com um banco de dados PostgreSQL por serviço.

## Tecnologias

| Camada | Stack |
|---|---|
| Mobile | Flutter · Dart 3.3+ · Riverpod · GoRouter · fl_chart |
| Backend | NestJS 11 · TypeScript · Drizzle ORM · PostgreSQL 16 |
| Mensageria | RabbitMQ 3 |
| Infra | Docker · Docker Compose |
| Qualidade | Biome · Jest · flutter_lints |

## Estrutura do Repositório

```
DineroRefactor/
├── backend/                    # Monorepo NestJS
│   ├── services/
│   │   ├── identity/           # Autenticação e usuários         (porta 4008)
│   │   ├── financial/          # Transações, cartões, categorias (porta 4009)
│   │   ├── portfolio/          # Portfólio de investimentos      (porta 4007)
│   │   └── openfinance/        # Integração Open Banking (Pluggy)(porta 4006)
│   ├── shared/                 # Módulos compartilhados (auth, HATEOAS, messaging)
│   ├── docker-compose.yml
│   └── Dockerfile.service
└── frontend/                   # App Flutter
    ├── lib/
    │   ├── core/               # Design system, config, utilitários
    │   ├── models/             # Modelos de domínio
    │   ├── repositories/       # Camada de acesso a dados
    │   ├── viewmodels/         # Lógica de negócio (MVVM)
    │   ├── providers/          # Injeção de dependência (Riverpod)
    │   ├── views/              # Telas
    │   └── widgets/            # Componentes reutilizáveis
    └── docs/                   # Contratos de integração
```

## Microsserviços

### Identity (4008)
Gerencia cadastro, login e perfil de usuário. Emite tokens JWT e publica eventos `user.*` no RabbitMQ.

### Financial (4009)
Transações (receita/despesa/transferência), cartões de crédito/débito, categorias com orçamento e consolidação de saldo. Suporta sincronização offline-first e detecção de duplicatas.

### Portfolio (4007)
Rastreamento de ativos (ações, ETFs, cripto) com cotações em tempo real via Brapi API e histórico de preços.

### OpenFinance (4006)
Conexão com contas bancárias externas via Pluggy API (sandbox) para sincronização automática de saldo.

## Funcionalidades do App

- **Dashboard** — saldo total, resumo mensal e transações recentes
- **Transações** — criação com teclado numérico, categorização e suporte a BRL/USD/EUR
- **Categorias** — 8 categorias padrão, gráfico donut de gastos e alertas de orçamento
- **Portfólio** — lista de ativos, gráfico de evolução e sparklines por ativo
- **Cartões** — rastreamento de fatura e vencimento
- **Configurações** — moeda padrão, tema claro/escuro e gerenciamento de perfil

## Pré-requisitos

- Docker e Docker Compose
- Node.js 20+
- Flutter SDK 3.3+
- Dart 3.3+

## Como Executar

### Backend

```bash
cd backend

# Subir infraestrutura (PostgreSQL, RabbitMQ, Adminer)
docker-compose up -d

# Instalar dependências
npm install

# Rodar serviços individualmente
npm run start:identity
npm run start:financial
npm run start:portfolio
npm run start:openfinance
```

Cada serviço requer variáveis de ambiente configuradas. Consulte o README de cada serviço em `backend/services/<nome>/`.

### Frontend

```bash
cd frontend

flutter pub get
flutter run
```

> Em emulador Android, o endereço do backend é `10.0.2.2`. Em dispositivo físico ou web, use o IP da máquina host.

## Convenções de API

- Todas as rotas seguem o prefixo `/v1/*`
- Autenticação via `Authorization: Bearer <token>` (exceto login e cadastro)
- Respostas paginadas seguem o envelope HATEOAS: `{ data, meta, _links }`
- Parâmetros de paginação: `_page` e `_size`
- Payload com campos extras retorna HTTP 400 (whitelist de validação ativa)

## Eventos RabbitMQ

| Publicador | Evento |
|---|---|
| Identity | `user.created`, `user.updated`, `user.deleted` |
| Financial | `transaction.created`, `transaction.updated`, `transaction.deleted` |
| OpenFinance | `bank-connection.created`, `bank-connection.revoked` |

## Qualidade

```bash
# Backend — verificação completa
cd backend && npm run validate:all

# Backend — testes
npm run test:identity
npm run test:financial

# Frontend — análise estática
cd frontend && flutter analyze
```

## Arquitetura Frontend

O app segue o padrão **MVVM + Riverpod**:

```
View (dumb) → ViewModel (StateNotifier) → Repository (interface) → API/Mock
```

Padrões aplicados: Factory para criação de transações, Facade para consolidação financeira, Repository com implementações intercambiáveis (mock → HTTP).

## Documentação Adicional