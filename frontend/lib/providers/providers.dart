import 'package:dinero/core/network/api_client.dart';
import 'package:dinero/core/network/token_storage.dart';
import 'package:dinero/core/patterns/facade/finance_facade.dart';
import 'package:dinero/repositories/http/http_card_repository.dart';
import 'package:dinero/repositories/http/http_category_repository.dart';
import 'package:dinero/repositories/http/http_transaction_repository.dart';
import 'package:dinero/repositories/interfaces/i_asset_repository.dart';
import 'package:dinero/repositories/interfaces/i_card_repository.dart';
import 'package:dinero/repositories/interfaces/i_category_repository.dart';
import 'package:dinero/repositories/interfaces/i_currency_repository.dart';
import 'package:dinero/repositories/interfaces/i_transaction_repository.dart';
import 'package:dinero/repositories/mock/mock_asset_repository.dart';
import 'package:dinero/repositories/mock/mock_currency_repository.dart';
import 'package:dinero/viewmodels/add_transaction_viewmodel.dart';
import 'package:dinero/viewmodels/asset_detail_viewmodel.dart';
import 'package:dinero/viewmodels/asset_search_viewmodel.dart';
import 'package:dinero/viewmodels/auth_viewmodel.dart';
import 'package:dinero/viewmodels/cards_viewmodel.dart';
import 'package:dinero/viewmodels/categories_viewmodel.dart';
import 'package:dinero/viewmodels/category_detail_viewmodel.dart';
import 'package:dinero/viewmodels/currencies_viewmodel.dart';
import 'package:dinero/viewmodels/dashboard_viewmodel.dart';
import 'package:dinero/viewmodels/notifications_viewmodel.dart';
import 'package:dinero/viewmodels/portfolio_viewmodel.dart';
import 'package:dinero/viewmodels/settings_viewmodel.dart';
import 'package:dinero/viewmodels/transactions_viewmodel.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// ---------------------------------------------------------------------------
// Fundação de rede (PIID-66 a 70 reutilizam estes providers)
// ---------------------------------------------------------------------------
final tokenStorageProvider = Provider<TokenStorage>((_) => TokenStorage());

/// [ApiClient] pré-configurado com injeção automática de Bearer token.
///
/// O hook [onUnauthorized] será ligado ao AuthViewModel no PIID-66.
final apiClientProvider = Provider<ApiClient>(
  (ref) => ApiClient(ref.watch(tokenStorageProvider)),
);

// ---------------------------------------------------------------------------
// Repositories
// ---------------------------------------------------------------------------
final transactionRepositoryProvider = Provider<ITransactionRepository>(
  (ref) => HttpTransactionRepository(ref.watch(apiClientProvider)),
);
final categoryRepositoryProvider = Provider<ICategoryRepository>(
  (ref) => HttpCategoryRepository(ref.watch(apiClientProvider)),
);
final cardRepositoryProvider = Provider<ICardRepository>(
  (ref) => HttpCardRepository(ref.watch(apiClientProvider)),
);
final assetRepositoryProvider = Provider<IAssetRepository>(
  (_) => MockAssetRepository(),
);
final currencyRepositoryProvider = Provider<ICurrencyRepository>(
  (_) => MockCurrencyRepository(),
);

// Facade
final financeFacadeProvider = Provider<FinanceFacade>((ref) => FinanceFacade(
      ref.watch(transactionRepositoryProvider),
      ref.watch(categoryRepositoryProvider),
    ));

// ViewModels
final authViewModelProvider =
    StateNotifierProvider<AuthViewModel, AuthState>(
  (ref) => AuthViewModel(
    ref.watch(apiClientProvider),
    ref.watch(tokenStorageProvider),
  ),
);

final dashboardViewModelProvider =
    StateNotifierProvider<DashboardViewModel, DashboardState>(
  (ref) => DashboardViewModel(
    ref.watch(financeFacadeProvider),
    ref.watch(cardRepositoryProvider),
  ),
);

final transactionsViewModelProvider =
    StateNotifierProvider<TransactionsViewModel, TransactionsState>(
  (ref) => TransactionsViewModel(ref.watch(financeFacadeProvider)),
);

final addTransactionViewModelProvider =
    StateNotifierProvider.autoDispose<AddTransactionViewModel, AddTransactionState>(
  (ref) => AddTransactionViewModel(
    ref.watch(financeFacadeProvider),
    ref.watch(categoryRepositoryProvider),
  ),
);

final categoriesViewModelProvider =
    StateNotifierProvider<CategoriesViewModel, CategoriesState>(
  (ref) => CategoriesViewModel(
    ref.watch(categoryRepositoryProvider),
    ref.watch(transactionRepositoryProvider),
  ),
);

final categoryDetailViewModelProvider =
    StateNotifierProvider.autoDispose<CategoryDetailViewModel, CategoryDetailState>(
  (ref) => CategoryDetailViewModel(
    ref.watch(categoryRepositoryProvider),
    ref.watch(transactionRepositoryProvider),
  ),
);

final portfolioViewModelProvider =
    StateNotifierProvider<PortfolioViewModel, PortfolioState>(
  (ref) => PortfolioViewModel(ref.watch(assetRepositoryProvider)),
);

final cardsViewModelProvider =
    StateNotifierProvider<CardsViewModel, CardsState>(
  (ref) => CardsViewModel(ref.watch(cardRepositoryProvider)),
);

final currenciesViewModelProvider =
    StateNotifierProvider<CurrenciesViewModel, CurrenciesState>(
  (ref) => CurrenciesViewModel(ref.watch(currencyRepositoryProvider)),
);

final notificationsViewModelProvider =
    StateNotifierProvider<NotificationsViewModel, NotificationsState>(
  (_) => NotificationsViewModel(),
);

final settingsViewModelProvider =
    StateNotifierProvider<SettingsViewModel, SettingsState>(
  (_) => SettingsViewModel(),
);

final assetDetailViewModelProvider =
    StateNotifierProvider.autoDispose<AssetDetailViewModel, AssetDetailState>(
  (ref) => AssetDetailViewModel(ref.watch(assetRepositoryProvider)),
);

final assetSearchViewModelProvider =
    StateNotifierProvider.autoDispose<AssetSearchViewModel, AssetSearchState>(
  (_) => AssetSearchViewModel(),
);
