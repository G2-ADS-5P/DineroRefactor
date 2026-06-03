# CLAUDE.md — Dinero: Your Money, Smarter
## Guia Completo de Desenvolvimento Flutter

> **Contexto:** Este projeto é a migração completa de um protótipo React (gerado pelo Lovable) para Flutter/Dart. O objetivo é replicar o visual com **máxima fidelidade** ao design original, implementando a arquitetura acadêmica correta (MVVM + Riverpod + Factory + Facade). Todos os dados são **mockados** — zero backend nesta fase.

---

## 1. REGRAS ABSOLUTAS (nunca viole)

1. **NUNCA use StatefulWidget para lógica de negócio.** A View é burra — só mostra o que o ViewModel diz.
2. **NUNCA coloque lógica nas Views.** Cálculos, formatações complexas, decisões de estado → ViewModel.
3. **NUNCA crie objetos Transaction diretamente.** Sempre use `TransactionFactory`.
4. **NUNCA chame repositórios diretamente de Views ou Providers.** Sempre via ViewModel.
5. **NUNCA use dados hardcoded nas Views.** Tudo vem do MockRepository via ViewModel.
6. **NUNCA altere a paleta de cores.** Use apenas as constantes de `AppColors`.
7. **NUNCA use `Navigator.push` direto nas Views.** Use `GoRouter` com rotas nomeadas.
8. **NUNCA quebre a estrutura de pastas** definida na seção 4.

---

## 2. STACK TÉCNICA

```
Flutter SDK: ^3.19.0
Dart: ^3.3.0

Dependências obrigatórias (pubspec.yaml):
  flutter_riverpod: ^2.5.1       # state management
  riverpod_annotation: ^2.3.5    # code generation
  go_router: ^13.2.0             # navegação
  fl_chart: ^0.67.0              # gráficos (donut, linha, barra)
  intl: ^0.19.0                  # formatação de moeda e data (pt_BR)
  google_fonts: ^6.2.1           # tipografia

Dev dependencies:
  flutter_lints: ^4.0.0
  riverpod_generator: ^2.4.0
  build_runner: ^2.4.9
```

---

## 3. DESIGN SYSTEM — FIDELIDADE OBRIGATÓRIA

### 3.1 Paleta de Cores (`lib/core/theme/app_colors.dart`)

```dart
class AppColors {
  // Backgrounds
  static const Color background    = Color(0xFF0A0A0A);  // tela principal
  static const Color surface       = Color(0xFF141414);  // cards primários
  static const Color surfaceAlt    = Color(0xFF1C1C1C);  // cards secundários
  static const Color surfaceInput  = Color(0xFF1E1E1E);  // campos de input

  // Brand
  static const Color primary       = Color(0xFF22C55E);  // verde — FAB, destaque, positivo
  static const Color primaryDark   = Color(0xFF16A34A);  // verde escuro — pressed state

  // Semânticas
  static const Color income        = Color(0xFF22C55E);  // entradas (verde)
  static const Color expense       = Color(0xFFEF4444);  // saídas (vermelho)
  static const Color warning       = Color(0xFFF59E0B);  // alerta 80% orçamento
  static const Color danger        = Color(0xFFEF4444);  // alerta 100% orçamento

  // Texto
  static const Color textPrimary   = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFF9CA3AF);
  static const Color textMuted     = Color(0xFF6B7280);

  // Bordas
  static const Color border        = Color(0xFF262626);
  static const Color borderLight   = Color(0xFF2D2D2D);

  // Categorias (cores do donut chart — exatamente como no Lovable)
  static const Color catMoradia      = Color(0xFF3B82F6);  // azul
  static const Color catAlimentacao  = Color(0xFFF97316);  // laranja
  static const Color catTransporte   = Color(0xFF22C55E);  // verde
  static const Color catLazer        = Color(0xFFA855F7);  // roxo
  static const Color catAssinaturas  = Color(0xFF06B6D4);  // ciano
  static const Color catSaude        = Color(0xFFEC4899);  // rosa
  static const Color catEducacao     = Color(0xFFF59E0B);  // amarelo
  static const Color catOutros       = Color(0xFF64748B);  // cinza

  // Cartões
  static const Color nubank         = Color(0xFF8B5CF6);  // roxo
  static const Color inter          = Color(0xFFFF6B00);  // laranja
}
```

### 3.2 Tipografia (`lib/core/theme/app_theme.dart`)

- **Fonte:** Inter (via google_fonts) para textos. Display numbers podem usar peso 700.
- **Tamanhos:**
  - Display grande (saldo): 32px, FontWeight.w700
  - Título de seção: 20px, FontWeight.w700
  - Corpo: 14px, FontWeight.w400
  - Caption/label: 12px, FontWeight.w400, cor textSecondary

### 3.3 Componentes Visuais Obrigatórios

**Cards:**
```
decoration: BoxDecoration(
  color: AppColors.surface,
  borderRadius: BorderRadius.circular(16),
  border: Border.all(color: AppColors.border, width: 1),
)
```

**Botão FAB central (verde, elevado):**
```
FloatingActionButton com backgroundColor: AppColors.primary
Ícone: Icons.add com cor branca
Shape: CircleBorder com elevation: 8
```

**Bottom Navigation:**
- 4 itens + FAB central
- Fundo: AppColors.surface
- Item ativo: AppColors.primary
- Item inativo: AppColors.textSecondary
- Itens: Home (grid icon) | Categorias (label icon) | [FAB] | Portfólio (trending_up) | Config (settings)

**Chips de categoria (tela AddTransaction):**
```
Container arredondado (borderRadius: 20)
Selecionado: border verde + fundo levemente verde
Não selecionado: fundo surfaceAlt + border sutil
```

**Progress bars de orçamento:**
```
ClipRRect com borderRadius: 4
Fundo: AppColors.surfaceAlt
Preenchimento: cor da categoria
Altura: 6px
```

**Keypad numérico (tela AddTransaction):**
```
Grid 3x4 de botões
Cada botão: fundo surfaceAlt, borderRadius 12, texto branco 20px bold
Backspace: ícone Icons.backspace_outlined
Separador decimal: ','
```

---

## 4. ESTRUTURA DE PASTAS (obrigatória, não altere)

```
lib/
├── core/
│   ├── patterns/
│   │   ├── factory/
│   │   │   └── transaction_factory.dart
│   │   └── facade/
│   │       └── finance_facade.dart
│   ├── theme/
│   │   ├── app_colors.dart
│   │   └── app_theme.dart
│   ├── constants/
│   │   ├── mock_data.dart
│   │   └── app_constants.dart
│   └── utils/
│       ├── currency_formatter.dart
│       └── date_formatter.dart
│
├── models/
│   ├── transaction.dart
│   ├── category.dart
│   ├── currency.dart
│   ├── asset.dart
│   ├── card_model.dart
│   ├── budget.dart
│   └── user.dart
│
├── repositories/
│   ├── interfaces/
│   │   ├── i_transaction_repository.dart
│   │   ├── i_category_repository.dart
│   │   ├── i_asset_repository.dart
│   │   └── i_currency_repository.dart
│   └── mock/
│       ├── mock_transaction_repository.dart
│       ├── mock_category_repository.dart
│       ├── mock_asset_repository.dart
│       └── mock_currency_repository.dart
│
├── viewmodels/
│   ├── auth_viewmodel.dart
│   ├── dashboard_viewmodel.dart
│   ├── transactions_viewmodel.dart
│   ├── add_transaction_viewmodel.dart
│   ├── categories_viewmodel.dart
│   ├── category_detail_viewmodel.dart
│   ├── assets_viewmodel.dart
│   ├── asset_detail_viewmodel.dart
│   ├── portfolio_viewmodel.dart
│   ├── cards_viewmodel.dart
│   ├── currencies_viewmodel.dart
│   ├── notifications_viewmodel.dart
│   └── settings_viewmodel.dart
│
├── providers/
│   └── providers.dart
│
├── views/
│   ├── auth/
│   │   └── login_screen.dart
│   ├── dashboard/
│   │   └── dashboard_screen.dart
│   ├── transactions/
│   │   ├── transactions_screen.dart
│   │   └── add_transaction_screen.dart
│   ├── categories/
│   │   ├── categories_screen.dart
│   │   └── category_detail_screen.dart
│   ├── assets/
│   │   ├── assets_screen.dart
│   │   └── asset_detail_screen.dart
│   ├── portfolio/
│   │   └── portfolio_screen.dart
│   ├── cards/
│   │   └── cards_screen.dart
│   ├── currencies/
│   │   └── currencies_screen.dart
│   ├── notifications/
│   │   └── notifications_screen.dart
│   └── settings/
│       ├── settings_screen.dart
│       ├── profile_screen.dart
│       └── change_password_screen.dart
│
├── widgets/
│   ├── layout/
│   │   ├── main_shell.dart          # scaffold com bottom nav + FAB
│   │   └── page_shell.dart          # scaffold para telas sem nav
│   ├── common/
│   │   ├── stat_card.dart
│   │   ├── transaction_item.dart
│   │   ├── category_chip.dart
│   │   ├── budget_progress_bar.dart
│   │   └── asset_row.dart
│   └── charts/
│       ├── donut_chart_widget.dart
│       ├── line_chart_widget.dart
│       └── sparkline_widget.dart
│
├── router/
│   └── app_router.dart
│
└── main.dart
```

---

## 5. MODELS (contratos de dados)

### `transaction.dart`
```dart
enum TransactionType { income, expense }

class Transaction {
  final String id;
  final double value;           // valor original
  final String currency;        // 'BRL', 'USD', 'EUR'
  final double exchangeRate;    // cotação usada (1.0 para BRL)
  final double valueInBrl;      // valor convertido
  final TransactionType type;
  final String categoryId;
  final String description;
  final DateTime date;
  final bool isPendingSync;     // RN019

  const Transaction({...});
}
```

### `category.dart`
```dart
class Category {
  final String id;
  final String name;
  final String emoji;
  final Color color;
  final bool isDefault;         // categorias padrão não podem ser excluídas (RN025)
  final double? budgetAmount;   // orçamento mensal (nullable)

  const Category({...});
}
```

### `asset.dart`
```dart
class Asset {
  final String id;
  final String ticker;          // ex: 'MXRF11'
  final String name;            // ex: 'Maxi Renda'
  final int quantity;
  final double currentPrice;
  final double changePercent;   // variação % do dia
  final List<double> priceHistory; // para sparkline
  final String currency;

  const Asset({...});
}
```

### `card_model.dart`
```dart
class CardModel {
  final String id;
  final String name;            // ex: 'Nubank'
  final double currentBill;
  final int dueDays;            // vence em X dias
  final Color color;
  final String icon;

  const CardModel({...});
}
```

---

## 6. PADRÕES DE PROJETO (implementação obrigatória)

### 6.1 TransactionFactory (`lib/core/patterns/factory/transaction_factory.dart`)

```dart
// RF015, RN015 — OBRIGATÓRIO
class TransactionFactory {
  static final Map<String, double> _mockRates = {
    'BRL': 1.0,
    'USD': 5.85,
    'EUR': 6.40,
  };

  static Transaction createExpense({
    required double value,
    required String currency,
    required String categoryId,
    required String description,
    DateTime? date,
  }) {
    final rate = _mockRates[currency] ?? 1.0;
    return Transaction(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      value: value,
      currency: currency,
      exchangeRate: rate,
      valueInBrl: value * rate,
      type: TransactionType.expense,
      categoryId: categoryId,
      description: description,
      date: date ?? DateTime.now(),
      isPendingSync: currency != 'BRL', // RN019
    );
  }

  static Transaction createIncome({
    required double value,
    required String currency,
    required String categoryId,
    required String description,
    DateTime? date,
  }) {
    // mesma lógica, type: TransactionType.income
  }
}
```

### 6.2 FinanceFacade (`lib/core/patterns/facade/finance_facade.dart`)

```dart
// RF016, RN016 — OBRIGATÓRIO
// Coordena: Factory → Repository → BudgetCheck → Notify
class FinanceFacade {
  final ITransactionRepository _transactionRepo;
  final ICategoryRepository _categoryRepo;

  FinanceFacade(this._transactionRepo, this._categoryRepo);

  Future<Transaction> registerExpense({
    required double value,
    required String currency,
    required String categoryId,
    required String description,
  }) async {
    // 1. Criar via Factory
    final transaction = TransactionFactory.createExpense(
      value: value,
      currency: currency,
      categoryId: categoryId,
      description: description,
    );

    // 2. Salvar no repositório
    await _transactionRepo.save(transaction);

    // 3. Verificar orçamento (RN029)
    final budget = await _categoryRepo.getBudget(categoryId);
    if (budget != null) {
      final spent = await _transactionRepo.getMonthlySpentByCategory(categoryId);
      final percent = spent / budget.amount;
      if (percent >= 1.0) {
        // TODO: disparar notificação (alerta vermelho)
      } else if (percent >= 0.8) {
        // TODO: disparar notificação (alerta amarelo)
      }
    }

    return transaction;
  }

  Future<double> getTotalBalance() async {
    return await _transactionRepo.getTotalBalance();
  }

  Future<Map<String, double>> getMonthlyStats() async {
    final income = await _transactionRepo.getMonthlyIncome();
    final expenses = await _transactionRepo.getMonthlyExpenses();
    return {'income': income, 'expenses': expenses};
  }
}
```

---

## 7. VIEWMODELS (padrão Riverpod StateNotifier)

```dart
// Exemplo: DashboardViewModel
class DashboardState {
  final double totalBalance;
  final double monthlyIncome;
  final double monthlyExpenses;
  final List<Transaction> recentTransactions;
  final List<CardModel> cards;
  final bool isLoading;

  const DashboardState({...});
  DashboardState copyWith({...}) {...}
}

class DashboardViewModel extends StateNotifier<DashboardState> {
  final FinanceFacade _facade;

  DashboardViewModel(this._facade) : super(const DashboardState(isLoading: true)) {
    _load();
  }

  Future<void> _load() async {
    final balance = await _facade.getTotalBalance();
    final stats = await _facade.getMonthlyStats();
    // ... carregar demais dados
    state = state.copyWith(
      totalBalance: balance,
      monthlyIncome: stats['income']!,
      monthlyExpenses: stats['expenses']!,
      isLoading: false,
    );
  }
}
```

---

## 8. PROVIDERS (`lib/providers/providers.dart`)

```dart
// Repositories
final transactionRepositoryProvider = Provider<ITransactionRepository>(
  (ref) => MockTransactionRepository(),
);
final categoryRepositoryProvider = Provider<ICategoryRepository>(
  (ref) => MockCategoryRepository(),
);
final assetRepositoryProvider = Provider<IAssetRepository>(
  (ref) => MockAssetRepository(),
);

// Facade
final financeFacadeProvider = Provider<FinanceFacade>((ref) {
  return FinanceFacade(
    ref.watch(transactionRepositoryProvider),
    ref.watch(categoryRepositoryProvider),
  );
});

// ViewModels
final dashboardViewModelProvider =
    StateNotifierProvider<DashboardViewModel, DashboardState>((ref) {
  return DashboardViewModel(ref.watch(financeFacadeProvider));
});

// ... demais providers
```

---

## 9. DADOS MOCK (`lib/core/constants/mock_data.dart`)

### Categorias (exatamente as 8 do RN025 + emojis do Lovable):
```dart
static const List<Category> categories = [
  Category(id: 'moradia',      name: 'Moradia',      emoji: '🏠', color: AppColors.catMoradia,     isDefault: true, budgetAmount: 2500.00),
  Category(id: 'alimentacao',  name: 'Alimentação',  emoji: '🍔', color: AppColors.catAlimentacao,  isDefault: true, budgetAmount: 1000.00),
  Category(id: 'transporte',   name: 'Transporte',   emoji: '🚗', color: AppColors.catTransporte,   isDefault: true, budgetAmount: 500.00),
  Category(id: 'lazer',        name: 'Lazer',        emoji: '🎮', color: AppColors.catLazer,        isDefault: true, budgetAmount: 400.00),
  Category(id: 'assinaturas',  name: 'Assinaturas',  emoji: '📱', color: AppColors.catAssinaturas,  isDefault: true, budgetAmount: 350.00),
  Category(id: 'saude',        name: 'Saúde',        emoji: '❤️', color: AppColors.catSaude,        isDefault: true, budgetAmount: 300.00),
  Category(id: 'educacao',     name: 'Educação',     emoji: '📚', color: AppColors.catEducacao,     isDefault: true, budgetAmount: 200.00),
  Category(id: 'outros',       name: 'Outros',       emoji: '💼', color: AppColors.catOutros,       isDefault: true, budgetAmount: null),
];
```

### Transações (20+, misturando BRL/USD/EUR):
```dart
// Despesas
Transaction(id: 't1',  value: 287.43, currency: 'BRL', exchangeRate: 1.0, valueInBrl: 287.43,  type: expense, categoryId: 'alimentacao', description: 'Supermercado Condor',  date: today),
Transaction(id: 't2',  value: 189.90, currency: 'BRL', exchangeRate: 1.0, valueInBrl: 189.90,  type: expense, categoryId: 'moradia',     description: 'Conta de Luz',        date: yesterday),
Transaction(id: 't3',  value: 32.50,  currency: 'BRL', exchangeRate: 1.0, valueInBrl: 32.50,   type: expense, categoryId: 'lazer',       description: 'Starbucks',           date: yesterday),
Transaction(id: 't4',  value: 15.99,  currency: 'USD', exchangeRate: 5.85, valueInBrl: 93.54,  type: expense, categoryId: 'assinaturas', description: 'Spotify',             date: 3daysAgo),
Transaction(id: 't5',  value: 19.99,  currency: 'USD', exchangeRate: 5.85, valueInBrl: 116.94, type: expense, categoryId: 'assinaturas', description: 'ChatGPT Plus',        date: 3daysAgo),
Transaction(id: 't6',  value: 49.90,  currency: 'BRL', exchangeRate: 1.0, valueInBrl: 49.90,   type: expense, categoryId: 'transporte',  description: 'Combustível',         date: 4daysAgo),
Transaction(id: 't7',  value: 89.90,  currency: 'BRL', exchangeRate: 1.0, valueInBrl: 89.90,   type: expense, categoryId: 'saude',       description: 'Farmácia',            date: 5daysAgo),
Transaction(id: 't8',  value: 25.00,  currency: 'USD', exchangeRate: 5.85, valueInBrl: 146.25, type: expense, categoryId: 'lazer',       description: 'Steam - Jogo',        date: 6daysAgo),
Transaction(id: 't9',  value: 1800.00,currency: 'BRL', exchangeRate: 1.0, valueInBrl: 1800.00, type: expense, categoryId: 'moradia',     description: 'Aluguel',             date: 7daysAgo),
Transaction(id: 't10', value: 79.90,  currency: 'BRL', exchangeRate: 1.0, valueInBrl: 79.90,   type: expense, categoryId: 'alimentacao', description: 'iFood',               date: 8daysAgo),
// Receitas
Transaction(id: 't11', value: 5000.00,currency: 'BRL', exchangeRate: 1.0, valueInBrl: 5000.00, type: income,  categoryId: 'outros',      description: 'Salário',             date: 5daysAgo),
Transaction(id: 't12', value: 1500.00,currency: 'BRL', exchangeRate: 1.0, valueInBrl: 1500.00, type: income,  categoryId: 'outros',      description: 'Freelance',           date: 10daysAgo),
Transaction(id: 't13', value: 340.00, currency: 'BRL', exchangeRate: 1.0, valueInBrl: 340.00,  type: income,  categoryId: 'outros',      description: 'Dividendos MXRF11',   date: 12daysAgo),
Transaction(id: 't14', value: 200.00, currency: 'USD', exchangeRate: 5.85, valueInBrl: 1170.00,type: income,  categoryId: 'outros',      description: 'Venda internacional', date: 15daysAgo),
// ... mais 6 transações
```

### Assets (Portfólio — exatamente os do Lovable):
```dart
static const List<Asset> assets = [
  Asset(id: 'a1', ticker: 'MXRF11', name: 'Maxi Renda',   quantity: 150, currentPrice: 10.23,  changePercent: +1.20, currency: 'BRL'),
  Asset(id: 'a2', ticker: 'HGLG11', name: 'CSHG Logística',quantity: 20, currentPrice: 164.50, changePercent: -0.80, currency: 'BRL'),
  Asset(id: 'a3', ticker: 'AAPL34', name: 'Apple BDR',    quantity: 30,  currentPrice: 52.80,  changePercent: +2.10, currency: 'BRL'),
  Asset(id: 'a4', ticker: 'PETR4',  name: 'Petrobras PN', quantity: 100, currentPrice: 38.42,  changePercent: -1.50, currency: 'BRL'),
  Asset(id: 'a5', ticker: 'IVVB11', name: 'iShares S&P500',quantity: 45, currentPrice: 318.90, changePercent: +0.70, currency: 'BRL'),
];
```

### Cartões:
```dart
static const List<CardModel> cards = [
  CardModel(id: 'c1', name: 'Nubank', currentBill: 1234.56, dueDays: 10, color: AppColors.nubank),
  CardModel(id: 'c2', name: 'Inter',  currentBill: 876.30,  dueDays: 15, color: AppColors.inter),
];
```

### Cotações mockadas:
```dart
static const Map<String, double> exchangeRates = {
  'USD': 5.85,
  'EUR': 6.40,
  'GBP': 7.42,
  'ARS': 0.006,
  'BTC': 485000.00,
  'ETH': 25800.00,
};
```

---

## 10. TELAS — ESPECIFICAÇÃO VISUAL DETALHADA

### 10.1 LoginScreen
- Fundo: AppColors.background
- Logo "Dinero" centralizado (texto grande, cor primary)
- Campo email + campo senha (fundo surfaceInput, border borderLight)
- Botão "Entrar" (fundo primary, texto branco, borderRadius 12, width total)
- Ao fazer login: navega para DashboardScreen (sem validação real, qualquer input serve)

### 10.2 DashboardScreen (Home)
Layout vertical com scroll:
1. **Header:** "Boa noite, [nome]" + ícone de sino (notificações)
2. **Card Saldo Total:** fundo surface, "SALDO TOTAL" em textSecondary uppercase, valor grande branco, badge verde "+2,4% hoje"
3. **Row Entradas/Saídas:** dois cards lado a lado, ícone seta verde (entradas) / vermelho (saídas), valor, "Este mês"
4. **Seção Cartões:** título "Cartões" + "Ver todos >", scroll horizontal de cards de cartão
5. **Seção Transações Recentes:** título "Transações recentes" + "Ver todos >", lista de TransactionItem (máximo 5)
6. **Padding bottom:** 80px para não ficar atrás do bottomNav

### 10.3 CategoriesScreen
Layout vertical com scroll:
1. **Header:** "Categorias" + botão "+" verde (adicionar)
2. **DonutChart (fl_chart):** exibindo gasto total no centro "Total gasto / R$ X.XXX,XX"
3. **Subtítulo mês:** "Março 2026"
4. **Lista de categorias:** cada item tem emoji, nome, "R$ gasto / R$ orçamento", percentual colorido, progress bar

### 10.4 AddTransactionScreen
Layout sem scroll (tudo visível):
1. **Header:** botão voltar (<) + "Nova transação" centralizado
2. **Toggle Despesa/Receita:** dois botões, selecionado muda fundo (vermelho=despesa, verde=receita)
3. **Display do valor:** "R$ 0,00" grande e centralizado
4. **Chips de categoria:** scroll horizontal, chip selecionado borda verde
5. **Campo descrição:** placeholder "Ex: Supermercado, restaurante..."
6. **Campo local (opcional)**
7. **Keypad numérico custom:** grid 3x4, botões surfaceAlt
8. **Botão Registrar:** fundo vermelho (despesa) ou verde (receita), texto branco, width total

### 10.5 PortfolioScreen
Layout vertical com scroll:
1. **Header:** "Portfólio" + ícone busca
2. **Valor total investido:** número grande + badge de variação
3. **LineChart (fl_chart):** histórico 1A, gradiente verde, eixo X com meses
4. **Seletor de período:** "1D 1S 1M 3M 1A Tudo" (tab-style, selecionado com destaque)
5. **Botão "Pesquisar ativos":** fundo primary, ícone lupa
6. **Lista de ativos:** AssetRow com ticker, nome, quantidade, sparkline, preço atual, variação colorida

### 10.6 SettingsScreen
Layout vertical com scroll:
1. **Header:** "Configurações"
2. **Card do usuário:** avatar circular com iniciais (cor primary), nome, email, seta >
3. **Seção CONTA:** Perfil | Cartões | Todas as transações | Categorias | Notificações
4. **Seção PREFERÊNCIAS:** Moeda padrão (BRL) | Tema escuro (toggle, sempre ligado)
5. **Seção SEGURANÇA:** Alterar senha | Ajuda e suporte
6. **Botão Sair da conta:** fundo surface, texto vermelho, borda vermelha sutil

---

## 11. NAVEGAÇÃO (GoRouter)

```dart
// Rotas com bottom nav (shell route):
/          → DashboardScreen
/categorias → CategoriesScreen
/portfolio  → PortfolioScreen
/config     → SettingsScreen

// Rotas sem bottom nav (push):
/login                    → LoginScreen
/add-transaction          → AddTransactionScreen
/categorias/:id           → CategoryDetailScreen
/config/perfil            → ProfileScreen
/config/cartoes           → CardsScreen
/config/transacoes        → TransactionsScreen
/config/notificacoes      → NotificationsScreen
/config/moedas            → CurrenciesScreen
/config/alterar-senha     → ChangePasswordScreen
/portfolio/ativo/:id      → AssetDetailScreen
```

O FAB central abre `/add-transaction` via GoRouter.

---

## 12. FORMATAÇÃO (obrigatório usar intl pt_BR)

```dart
// lib/core/utils/currency_formatter.dart
class CurrencyFormatter {
  static final _brlFormat = NumberFormat.currency(
    locale: 'pt_BR',
    symbol: 'R\$ ',
    decimalDigits: 2,
  );

  static String format(double value) => _brlFormat.format(value);
  // Output: "R$ 24.857,32"
}
```

---

## 13. O QUE NÃO IMPLEMENTAR NESTA FASE

- ❌ Backend / API calls reais
- ❌ sqflite (apenas mock em memória)
- ❌ AwesomeAPI (cotações fixas no MockData)
- ❌ Push notifications reais
- ❌ Autenticação real (qualquer login funciona)
- ❌ Flutter Web (foco no mobile)
- ❌ Testes automatizados

---

## 14. CHECKLIST DE QUALIDADE

Antes de considerar uma tela completa, verifique:
- [ ] View não contém lógica de negócio
- [ ] ViewModel não importa nada de `package:flutter`
- [ ] Factory é a única forma de criar Transaction
- [ ] Cores usam apenas constantes de AppColors
- [ ] Textos monetários usam CurrencyFormatter
- [ ] Navegação usa GoRouter (sem Navigator.push direto)
- [ ] Fundo das telas é AppColors.background (#0A0A0A)
- [ ] Bottom nav aparece em todas as telas principais