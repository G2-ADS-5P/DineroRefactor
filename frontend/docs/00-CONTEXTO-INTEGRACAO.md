# 00 — Contexto de Integração Frontend ↔ Backend (Dinero)

> **Leia este documento antes de pegar qualquer card.** Tudo que vale para os 5 cards
> (PIID-66 a PIID-70) está aqui. Os docs de cada card **referenciam** este arquivo e
> não repetem estas regras. Se algo aqui mudar, muda só aqui.

---

## 1. Mapa dos serviços (estado real do `dev`)

O backend é um monorepo NestJS com **4 microsserviços** Dinero, cada um no seu banco e
na sua porta. **Não existe API Gateway** — cada serviço responde direto na sua porta.

| Serviço      | Porta | Banco              | Card de integração      |
| ------------ | ----- | ------------------ | ----------------------- |
| `identity`   | 4008  | `dinero_identity`  | PIID-66 (Identity)      |
| `financial`  | 4009  | `dinero_financial` | PIID-67 (Financial)     |
| `openfinance`| 4006  | `dinero_openfinance`| PIID-68 (Open Finance) |
| `portfolio`  | 4007  | `dinero_portfolio` | PIID-69 (Portfolio)     |

Os serviços antigos de escola (`academic`, `attendance`, etc.) foram **removidos** no
PR #12 — ignore qualquer referência a eles.

---

## 2. Regras do backend que valem para TODO mundo

Estas 6 regras já causaram (ou vão causar) bug em quem não ler:

1. **Prefixo global `/v1`** em todas as rotas. Ex.: `POST http://localhost:4008/v1/auth/login`.
2. **JWT Bearer.** Só `login` e `register` são públicos. Todo o resto exige o header
   `Authorization: Bearer <accessToken>`. Sem token → **401**.
3. **`login` e `register` devolvem JSON puro** `{ accessToken, user }` (sem envelope HATEOAS).
   Guarde o `accessToken` e injete em todas as próximas requisições.
4. **ValidationPipe travado** (`whitelist: true` + `forbidNonWhitelisted: true`). Se o front
   mandar **qualquer campo a mais** do que o DTO espera, a request volta **400**. O payload
   tem que bater EXATO com o DTO documentado no card.
5. **Envelope HATEOAS** em listas e itens das rotas que usam o interceptor:
   - **Lista:** `{ "data": [ { ...campos, "_links": {...} } ], "meta": { "totalItems", "itemsPerPage", "currentPage", "totalPages" }, "_links": {...} }`
   - **Item:** `{ ...campos, "_links": {...} }`
   - O parser do front tem que ler `response.data` (lista) ou ignorar `_links` (item).
     O card diz quais rotas têm envelope.
6. **Paginação:** query params são `_page` e `_size` (com underscore!), não `page`/`size`.
   Default: `_page=1`, `_size=10`.

---

## 3. CORS e a estratégia de Docker do front

O `bootstrap-http-app.ts` **não habilita CORS**. Consequência: rodando o front como
**Flutter Web** (alvo da nossa demo), o navegador bloqueia toda chamada cross-origin
(porta do front ≠ porta da API).

**Solução adotada (mesmo padrão da IC):** subir o front como container `flutter-web`
servido por **nginx**, e usar o nginx como **reverse-proxy** das 4 APIs. Isso mata dois
problemas de uma vez:

- vira tudo **same-origin** → CORS deixa de existir;
- o front passa a ter **uma base URL só** (`/api/...`) em vez de 4 portas.

Mapeamento de proxy sugerido (a montar no `nginx.conf` do container):

```
location /api/identity/    → http://identity:4008/v1/
location /api/financial/   → http://financial:4009/v1/
location /api/openfinance/ → http://openfinance:4006/v1/
location /api/portfolio/   → http://portfolio:4007/v1/
```

> Em desenvolvimento (rodando o Flutter fora do container, ex. `flutter run -d chrome`),
> aí sim é preciso `enableCors()` no backend OU rodar o nginx local. O `AppConfig`
> (seção 5) deve permitir alternar a base entre `/api` (container) e `http://localhost:PORTA/v1` (dev).

---

## 4. Estado do frontend (Flutter)

- **Arquitetura:** MVVM + Riverpod + GoRouter. Padrões: Factory (`TransactionFactory`)
  e Facade (`FinanceFacade`). Regras completas em `frontend/claude.md`.
- **Hoje é 100% mock.** Não existe nenhum client HTTP no projeto (o `pubspec.yaml` não tem
  `http` nem `dio`). Todo dado vem de `lib/repositories/mock/*` e de `lib/core/constants/mock_data.dart`.
- **Ponto único de troca:** `lib/providers/providers.dart`. Os providers hoje apontam para
  `Mock...Repository`. A integração é trocar a implementação ligada à interface — **as Views e
  ViewModels não mudam** (esse é o ganho da arquitetura).

Interfaces de repositório que **já existem**:
`ITransactionRepository`, `ICategoryRepository`, `IAssetRepository`, `ICurrencyRepository`.

Interfaces que **não existem e cada card vai precisar criar** (auth, usuário, assinatura,
cartões, conexões bancárias, portfolio): ver o card correspondente.

---

## 5. Tarefas de FUNDAÇÃO (entram ANTES dos 5 cards)

Estas tarefas são pré-requisito de todos. **Responsável: Victor (líder).** Devem ser
mergeadas antes de qualquer card de feature começar a integrar.

1. **Adicionar client HTTP** ao `pubspec.yaml` (`http: ^1.2.0` ou `dio: ^5.x` — escolher um e padronizar).
2. **`lib/core/config/app_config.dart`** — base URL única (`/api` em prod, `http://localhost:PORTA/v1` em dev) e os sufixos por serviço.
3. **`lib/core/network/api_client.dart`** — wrapper do client com:
   - injeção automática do header `Authorization: Bearer <token>`;
   - tratamento central de erro (401 → logout, 400 → erro de validação, etc.);
   - **helper de desembrulho HATEOAS** (`unwrapList` / `unwrapItem`) para o resto não precisar saber de `_links`.
4. **`lib/core/network/token_storage.dart`** — guardar/ler o `accessToken` (em memória nesta fase; pode evoluir).
5. **Padrão de mapper** `DTO(JSON) → Model` — cada repositório HTTP terá seu mapper. Documentar um exemplo.

> O `providers.dart` vai ser o arquivo mais "disputado" — todo card mexe nele. Para reduzir
> conflito: cada dev altera **só a(s) linha(s) do seu provider**, e os merges entram na ordem
> da seção 6.

---

## 6. Ordem de execução e dependências

```
[FUNDAÇÃO: http client + AppConfig + ApiClient + HATEOAS helper]   ← Victor, primeiro
            │
            ▼
[PIID-66 IDENTITY]   ← obrigatoriamente o 1º feature (gera o token que todos usam)
            │
   ┌────────┼────────────────┐
   ▼        ▼                ▼
[PIID-67]  [PIID-68]      [PIID-69]   ← podem ir em paralelo (só consomem o token)
 Financial  OpenFinance    Portfolio
   └────────┴────────────────┘
            │
            ▼
[PIID-70 TESTES DE INTEGRAÇÃO]   ← por último, depende dos demais
```

**Por que Identity primeiro:** todo endpoint autenticado dos outros 3 serviços exige o
`Bearer <token>` que só o login do Identity produz. Sem ele, ninguém testa nada autenticado.

---

## 7. Definition of Done comum (todo card precisa cumprir)

- [ ] Implementação HTTP da(s) interface(s) criada em `lib/repositories/http/`.
- [ ] Mapper(s) `DTO → Model` cobrindo todos os campos da tabela de contrato do card.
- [ ] Linha trocada em `providers.dart` (de `Mock...` para `Http...`).
- [ ] Tela correspondente rodando com dado real (print/gif no PR).
- [ ] Endpoint testado por fora antes (curl/Insomnia) — comando no card.
- [ ] Sem campo extra no payload (lembrar do `whitelist` → 400).
- [ ] PR pequeno, com referência ao card (`PIID-XX`).
