import 'package:dinero/core/config/api_config.dart';
import 'package:dinero/core/http/api_client.dart' as identity_http;
import 'package:dinero/core/network/api_client.dart';
import 'package:dinero/core/patterns/facade/finance_facade.dart';
import 'package:dinero/core/network/token_storage.dart';
import 'package:dinero/core/storage/token_storage.dart' as secure;
import 'package:dinero/models/subscription.dart';
import 'package:dinero/models/user.dart';
import 'package:dinero/repositories/http/http_auth_repository.dart';
import 'package:dinero/repositories/http/http_asset_repository.dart';
import 'package:dinero/repositories/http/http_card_repository.dart';
import 'package:dinero/repositories/http/http_category_repository.dart';
import 'package:dinero/repositories/http/http_preference_repository.dart';
import 'package:dinero/repositories/http/http_subscription_repository.dart';
import 'package:dinero/repositories/http/http_transaction_repository.dart';
import 'package:dinero/repositories/http/http_user_repository.dart';
import 'package:dinero/repositories/interfaces/i_asset_repository.dart';
import 'package:dinero/repositories/interfaces/i_auth_repository.dart';
import 'package:dinero/repositories/interfaces/i_card_repository.dart';
import 'package:dinero/repositories/interfaces/i_category_repository.dart';
import 'package:dinero/repositories/interfaces/i_currency_repository.dart';
import 'package:dinero/repositories/interfaces/i_preference_repository.dart';
import 'package:dinero/repositories/interfaces/i_subscription_repository.dart';
import 'package:dinero/repositories/interfaces/i_transaction_repository.dart';
import 'package:dinero/repositories/interfaces/i_user_repository.dart';
import 'package:dinero/repositories/mock/mock_currency_repository.dart';
import 'package:dinero/viewmodels/add_transaction_viewmodel.dart';
import 'package:dinero/viewmodels/asset_cache_notifier.dart';
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
import 'package:dinero/viewmodels/subscription_viewmodel.dart';
import 'package:dinero/viewmodels/transactions_viewmodel.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Tema do app (escuro por padrão)
final themeProvider = StateProvider<ThemeMode>((_) => ThemeMode.dark);

// Financial network stack (http package, in-memory token — PIID-67)
final tokenStorageProvider = Provider<TokenStorage>((_) => TokenStorage());
final apiClientProvider = Provider<ApiClient>(
  (ref) => ApiClient(ref.watch(tokenStorageProvider)),
);

// Identity stack (dio package, persistent secure token — PIID-66)
final secureTokenStorageProvider = Provider<secure.TokenStorage>(
  (_) => secure.TokenStorage(),
);
final identityApiClientProvider = Provider<identity_http.ApiClient>(
  (ref) => identity_http.ApiClient(ref.watch(secureTokenStorageProvider)),
);
final portfolioApiClientProvider = Provider<identity_http.ApiClient>(
  (ref) => identity_http.ApiClient(
    ref.watch(secureTokenStorageProvider),
    baseUrl: ApiConfig.portfolioBaseUrl,
  ),
);

// Identity repositories (HTTP)
final authRepositoryProvider = Provider<IAuthRepository>(
  (ref) => HttpAuthRepository(ref.watch(identityApiClientProvider)),
);
final userRepositoryProvider = Provider<IUserRepository>(
  (ref) => HttpUserRepository(ref.watch(identityApiClientProvider)),
);
final preferenceRepositoryProvider = Provider<IPreferenceRepository>(
  (ref) => HttpPreferenceRepository(ref.watch(identityApiClientProvider)),
);
final subscriptionRepositoryProvider = Provider<ISubscriptionRepository>(
  (ref) => HttpSubscriptionRepository(ref.watch(identityApiClientProvider)),
);

// Identity data providers
final userProvider = FutureProvider<User>(
  (ref) => ref.watch(userRepositoryProvider).getMe(),
);
final preferenceProvider = FutureProvider<String>(
  (ref) => ref.watch(preferenceRepositoryProvider).getDefaultCurrency(),
);
final subscriptionProvider = FutureProvider<Subscription>(
  (ref) => ref.watch(subscriptionRepositoryProvider).getMine(),
);

// Financial repositories (HTTP)
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
  (ref) => HttpAssetRepository(ref.watch(portfolioApiClientProvider)),
);

// Cache de ativos: carregado no login, atualizado a cada 5 min em background
final assetCacheProvider =
    StateNotifierProvider<AssetCacheNotifier, AssetCacheState>(
  (ref) => AssetCacheNotifier(ref.watch(assetRepositoryProvider)),
);
final currencyRepositoryProvider = Provider<ICurrencyRepository>(
  (_) => MockCurrencyRepository(),
);

// Facade
final financeFacadeProvider = Provider<FinanceFacade>(
  (ref) => FinanceFacade(
    ref.watch(transactionRepositoryProvider),
    ref.watch(categoryRepositoryProvider),
  ),
);

// ViewModels
final authViewModelProvider = StateNotifierProvider<AuthViewModel, AuthState>(
  (ref) => AuthViewModel(
    ref.watch(authRepositoryProvider),
    ref.watch(secureTokenStorageProvider),
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
    StateNotifierProvider.autoDispose<
      CategoryDetailViewModel,
      CategoryDetailState
    >(
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
      (ref) => SettingsViewModel(
        ref.watch(userRepositoryProvider),
        ref.watch(preferenceRepositoryProvider),
      ),
    );

final assetDetailViewModelProvider =
    StateNotifierProvider.autoDispose<AssetDetailViewModel, AssetDetailState>(
      (ref) => AssetDetailViewModel(ref.watch(assetRepositoryProvider)),
    );

final assetSearchViewModelProvider =
    StateNotifierProvider.autoDispose<AssetSearchViewModel, AssetSearchState>(
      (ref) => AssetSearchViewModel(
        ref.watch(assetRepositoryProvider),
        ref.watch(assetCacheProvider.notifier),
      ),
    );

final subscriptionViewModelProvider =
    StateNotifierProvider.autoDispose<SubscriptionViewModel, SubscriptionState>(
      (ref) => SubscriptionViewModel(ref.watch(subscriptionRepositoryProvider)),
    );
