import 'package:dinero/core/config/api_config.dart';
import 'package:dinero/core/http/api_client.dart';
import 'package:dinero/core/patterns/facade/finance_facade.dart';
import 'package:dinero/core/storage/token_storage.dart';
import 'package:dinero/models/subscription.dart';
import 'package:dinero/models/user.dart';
import 'package:dinero/repositories/http/http_auth_repository.dart';
import 'package:dinero/repositories/http/http_asset_repository.dart';
import 'package:dinero/repositories/http/http_preference_repository.dart';
import 'package:dinero/repositories/http/http_subscription_repository.dart';
import 'package:dinero/repositories/http/http_user_repository.dart';
import 'package:dinero/repositories/interfaces/i_asset_repository.dart';
import 'package:dinero/repositories/interfaces/i_auth_repository.dart';
import 'package:dinero/repositories/interfaces/i_category_repository.dart';
import 'package:dinero/repositories/interfaces/i_currency_repository.dart';
import 'package:dinero/repositories/interfaces/i_preference_repository.dart';
import 'package:dinero/repositories/interfaces/i_subscription_repository.dart';
import 'package:dinero/repositories/interfaces/i_transaction_repository.dart';
import 'package:dinero/repositories/interfaces/i_user_repository.dart';
import 'package:dinero/repositories/mock/mock_category_repository.dart';
import 'package:dinero/repositories/mock/mock_currency_repository.dart';
import 'package:dinero/repositories/mock/mock_transaction_repository.dart';
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
import 'package:dinero/viewmodels/subscription_viewmodel.dart';
import 'package:dinero/viewmodels/transactions_viewmodel.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Identity HTTP infra
final tokenStorageProvider = Provider<TokenStorage>((_) => TokenStorage());
final apiClientProvider = Provider<ApiClient>(
  (ref) => ApiClient(ref.watch(tokenStorageProvider)),
);
final portfolioApiClientProvider = Provider<ApiClient>(
  (ref) => ApiClient(
    ref.watch(tokenStorageProvider),
    baseUrl: ApiConfig.portfolioBaseUrl,
  ),
);

// Identity repositories (HTTP)
final authRepositoryProvider = Provider<IAuthRepository>(
  (ref) => HttpAuthRepository(ref.watch(apiClientProvider)),
);
final userRepositoryProvider = Provider<IUserRepository>(
  (ref) => HttpUserRepository(ref.watch(apiClientProvider)),
);
final preferenceRepositoryProvider = Provider<IPreferenceRepository>(
  (ref) => HttpPreferenceRepository(ref.watch(apiClientProvider)),
);
final subscriptionRepositoryProvider = Provider<ISubscriptionRepository>(
  (ref) => HttpSubscriptionRepository(ref.watch(apiClientProvider)),
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

// Repositories (mock — outros cards)
final transactionRepositoryProvider = Provider<ITransactionRepository>(
  (_) => MockTransactionRepository(),
);
final categoryRepositoryProvider = Provider<ICategoryRepository>(
  (_) => MockCategoryRepository(),
);
final assetRepositoryProvider = Provider<IAssetRepository>(
  (ref) => HttpAssetRepository(ref.watch(portfolioApiClientProvider)),
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
    ref.watch(tokenStorageProvider),
  ),
);

final dashboardViewModelProvider =
    StateNotifierProvider<DashboardViewModel, DashboardState>(
      (ref) => DashboardViewModel(ref.watch(financeFacadeProvider)),
    );

final transactionsViewModelProvider =
    StateNotifierProvider<TransactionsViewModel, TransactionsState>(
      (ref) => TransactionsViewModel(ref.watch(financeFacadeProvider)),
    );

final addTransactionViewModelProvider =
    StateNotifierProvider.autoDispose<
      AddTransactionViewModel,
      AddTransactionState
    >((ref) => AddTransactionViewModel(ref.watch(financeFacadeProvider)));

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
    StateNotifierProvider<CardsViewModel, CardsState>((_) => CardsViewModel());

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
      (ref) => AssetSearchViewModel(ref.watch(assetRepositoryProvider)),
    );

final subscriptionViewModelProvider =
    StateNotifierProvider.autoDispose<SubscriptionViewModel, SubscriptionState>(
      (ref) => SubscriptionViewModel(ref.watch(subscriptionRepositoryProvider)),
    );
