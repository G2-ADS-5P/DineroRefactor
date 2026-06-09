# [PIID-67] Integração da API Financial com o Frontend

> **Responsável (board):** VN (Victor) · **Serviço:** `financial` · **Porta:** `4009` · **Base:** `/api/financial` (prod) ou `http://localhost:4009/v1` (dev)
> **Leia antes:** `00-CONTEXTO-INTEGRACAO.md`. **Depende de:** PIID-66 (token).

Este é o serviço **mais completo** — cobre o coração do app (transações, categorias, cartões,
saldo, sync). É também o que mais mexe nas telas centrais.

---

## 1. Escopo deste card

- `views/transactions/*` + `viewmodels/transactions_viewmodel.dart` + `add_transaction_viewmodel.dart`
- `views/dashboard/*` + `viewmodels/dashboard_viewmodel.dart` (saldo, receitas, despesas)
- `views/categories/*` + `viewmodels/categories_viewmodel.dart` + `category_detail_viewmodel.dart`
- `views/cards/*` + `viewmodels/cards_viewmodel.dart` ← **a tela "Cartões" mapeia AQUI** (não no OpenFinance)
- Interfaces existentes reaproveitadas: `ITransactionRepository`, `ICategoryRepository`

> **Cartões — atenção:** existe `cards` no Financial (CRUD manual, este card) e `cards` no
> OpenFinance (read-only, vem do banco — PIID-68). A tela "Cartões" do front (`CardModel`:
> name/brand/lastDigits/creditLimit/currentBill/dueDay) casa com o **Financial**.

---

## 2. Endpoints disponíveis

### Transações (autenticado, escopo por usuário)
| Método | Rota                | Body                  | Notas |
| ------ | ------------------- | --------------------- | ----- |
| GET    | `/v1/transactions`  | — (query `_page`,`_size`) | lista paginada (HATEOAS) |
| POST   | `/v1/transactions`  | `CreateTransactionDto`| item (HATEOAS) |
| GET    | `/v1/transactions/:id` | —                  | item |
| PATCH  | `/v1/transactions/:id` | `UpdateTransactionDto` (campos parciais) | |
| DELETE | `/v1/transactions/:id` | —                  | **soft delete** (204) |

### Categorias
| Método | Rota               | Body              |
| ------ | ------------------ | ----------------- |
| GET    | `/v1/categories`   | —                 |
| POST   | `/v1/categories`   | `CreateCategoryDto` |
| GET/PATCH/DELETE | `/v1/categories/:id` | `UpdateCategoryDto` (no PATCH) |

### Cartões
| Método | Rota          | Body            |
| ------ | ------------- | --------------- |
| GET    | `/v1/cards`   | —               |
| POST   | `/v1/cards`   | `CreateCardDto` |
| GET/PATCH/DELETE | `/v1/cards/:id` | `UpdateCardDto` (no PATCH) |

### Saldo / Resumo
| Método | Rota                  | Query                       |
| ------ | --------------------- | --------------------------- |
| GET    | `/v1/balance/summary` | `startDate`, `endDate` (ISO, **obrigatórios**) |

### Sync (offline-first — opcional nesta fase, mas o backend suporta)
| Método | Rota             | Body / Query        |
| ------ | ---------------- | ------------------- |
| POST   | `/v1/sync/push`  | `{ items: [SyncItem] }` |
| GET    | `/v1/sync/pull`  | `?since=<ISO>` (ou tudo) |
| GET    | `/v1/sync/status`| —                   |

### Reconciliação (duplicatas)
| Método | Rota                            | Body        |
| ------ | ------------------------------- | ----------- |
| GET    | `/v1/reconciliation/duplicates` | —           |
| POST   | `/v1/reconciliation/duplicates/resolve` | `{ ids }` (soft delete) |

---

## 3. Contratos

**`CreateTransactionDto`:**
```
amount        number  obrigatório (positivo)
currency      string  obrigatório ("BRL")
amountBrl     number  opcional
exchangeRate  number  opcional
type          "income" | "expense" | "transfer"   obrigatório
description   string  obrigatório
date          string  obrigatório (ISO "2026-05-26T00:00:00Z")
cardId        string  opcional (UUID)
categoryId    string  opcional (UUID)
isRecurring   boolean opcional
recurringRule string  opcional
notes         string  opcional
tags          string[] opcional
clientUuid    string  opcional (UUID p/ idempotência no sync)
```

**`TransactionResponseDto`** = tudo acima + `id, userId, createdAt, updatedAt, deletedAt`.

**`CreateCategoryDto`:** `name`, `type` (`income|expense`), `color` (`"#00FF00"`), `icon` (`"money"`), `parentId?`
**`CategoryResponseDto`** = + `id, userId, createdAt, updatedAt`.

**`CreateCardDto`:** `name`, `brand`, `lastDigits` (4 chars), `creditLimit`, `dueDay` (1–31)
**`CardResponseDto`** = + `id, userId, currentBill, createdAt, updatedAt`.

**`BalanceSummaryDto`:**
```
totalIncome, totalExpense, netBalance,
period: { startDate, endDate },
byCategory: [ { categoryId, totalIncome, totalExpense } ],
byType: { income, expense }
```

---

## 4. Tabela de contrato — campo a campo

### Transação (`Transaction`: value, currency, exchangeRate, valueInBrl, type, categoryId, description, date, isPendingSync)
| Front           | Backend        | Status |
| --------------- | -------------- | ------ |
| value           | amount         | **MUDOU** (renomear no mapper) |
| valueInBrl      | amountBrl      | **MUDOU** (renomear) |
| exchangeRate    | exchangeRate   | igual |
| type (income/expense) | type (income/expense/**transfer**) | **MUDOU** (backend tem 3º tipo) |
| categoryId      | categoryId     | igual |
| description     | description    | igual |
| date            | date           | igual |
| isPendingSync   | (sync via clientUuid) | **MUDOU** (vira controle de sync) |
| —               | cardId         | **NOVO** (vincular transação a cartão) |
| —               | notes, tags, isRecurring | **NOVO** |

### Categoria (`Category`: id, name, emoji, color, isDefault, budgetAmount)
| Front       | Backend  | Status |
| ----------- | -------- | ------ |
| name, color | name, color | igual |
| emoji       | icon     | **MUDOU** (front usa emoji, backend usa nome de ícone) |
| —           | type     | **NOVO** |
| —           | parentId | **NOVO** (subcategorias) |
| isDefault   | —        | **SOME** (sem equivalente) |
| budgetAmount| —        | **SEM BACKEND** (não há orçamento; ver abaixo) |

> **Orçamento (`Budget`):** não há endpoint de budget no Financial. As telas/uso de orçamento
> (`budget_progress_bar`, `getBudget`) ficam **SEM BACKEND** → manter mock ou anotar pendência.

### Saldo (dashboard)
| Front (`ITransactionRepository`) | Backend | Status |
| -------------------------------- | ------- | ------ |
| getTotalBalance()                | `balance/summary` → netBalance | **MUDOU** (vem pronto) |
| getMonthlyIncome()               | byType.income / totalIncome    | **MUDOU** |
| getMonthlyExpenses()             | byType.expense / totalExpense  | **MUDOU** |
| getMonthlySpentByCategory(id)    | byCategory[id].totalExpense    | **MUDOU** |

### Cartão (`CardModel`: name, currentBill, dueDays, color, lastFour, creditLimit, network, isDebit)
| Front        | Backend (`CardResponseDto`) | Status |
| ------------ | --------------------------- | ------ |
| name         | name        | igual |
| lastFour     | lastDigits  | **MUDOU** (renomear) |
| creditLimit  | creditLimit | igual |
| currentBill  | currentBill | igual |
| dueDays      | dueDay      | **MUDOU** (singular) |
| network      | brand       | **MUDOU** |
| color        | —           | **SOME** (definir no front a partir de `brand`) |
| isDebit      | —           | **SOME** (backend só trata crédito) |

---

## 5. Arquivos a criar / editar (front)

Criar:
```
lib/repositories/http/http_transaction_repository.dart   (implements ITransactionRepository)
lib/repositories/http/http_category_repository.dart      (implements ICategoryRepository)
lib/repositories/interfaces/i_card_repository.dart        (NOVO)
lib/repositories/http/http_card_repository.dart
```
Editar:
- `providers/providers.dart` → `transactionRepositoryProvider` e `categoryRepositoryProvider` de `Mock...` para `Http...`; adicionar `cardRepositoryProvider`.
- `viewmodels/cards_viewmodel.dart` → receber `ICardRepository` (hoje lê de `mock_data.dart`).
- **Usar `TransactionFactory`** ao montar `Transaction` (regra do `claude.md`, nunca instanciar direto).

## 6. Como testar

```bash
TOKEN=<token do login no identity>
curl http://localhost:4009/v1/transactions -H "Authorization: Bearer $TOKEN"
curl -X POST http://localhost:4009/v1/transactions -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":2500,"currency":"BRL","type":"income","description":"Salário","date":"2026-06-01T00:00:00Z"}'
curl "http://localhost:4009/v1/balance/summary?startDate=2026-06-01&endDate=2026-06-30" -H "Authorization: Bearer $TOKEN"
```

## 7. Pegadinhas

- `whitelist` ligado: nada de campo extra no payload → 400.
- `balance/summary` **exige** `startDate` e `endDate`, senão 400.
- DELETE é **soft delete** — a transação some da listagem mas não some do banco.
- Lista de transações vem **paginada e com HATEOAS** (`response.data` + `meta`).
- `emoji` (front) ≠ `icon` (backend): decidir o mapeamento no mapper de categoria.
