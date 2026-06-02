import 'package:dinero/providers/providers.dart';
import 'package:dinero/views/assets/asset_detail_screen.dart';
import 'package:dinero/views/auth/login_screen.dart';
import 'package:dinero/views/cards/cards_screen.dart';
import 'package:dinero/views/categories/categories_screen.dart';
import 'package:dinero/views/categories/category_detail_screen.dart';
import 'package:dinero/views/currencies/currencies_screen.dart';
import 'package:dinero/views/dashboard/dashboard_screen.dart';
import 'package:dinero/views/notifications/notifications_screen.dart';
import 'package:dinero/views/portfolio/asset_search_screen.dart';
import 'package:dinero/views/portfolio/portfolio_screen.dart';
import 'package:dinero/views/settings/change_password_screen.dart';
import 'package:dinero/views/settings/profile_screen.dart';
import 'package:dinero/views/settings/settings_screen.dart';
import 'package:dinero/views/transactions/add_transaction_screen.dart';
import 'package:dinero/views/transactions/transactions_screen.dart';
import 'package:dinero/widgets/layout/main_shell.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authViewModelProvider);

  return GoRouter(
    initialLocation: authState.isAuthenticated ? '/' : '/login',
    redirect: (context, state) {
      final isAuth = ref.read(authViewModelProvider).isAuthenticated;
      final isLoginPage = state.matchedLocation == '/login';
      if (!isAuth && !isLoginPage) return '/login';
      if (isAuth && isLoginPage) return '/';
      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      StatefulShellRoute.indexedStack(
        builder: (_, __, shell) => MainShell(navigationShell: shell),
        branches: [
          StatefulShellBranch(routes: [
            GoRoute(path: '/', builder: (_, __) => const DashboardScreen()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: '/categorias', builder: (_, __) => const CategoriesScreen()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: '/portfolio', builder: (_, __) => const PortfolioScreen()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: '/config', builder: (_, __) => const SettingsScreen()),
          ]),
        ],
      ),
      GoRoute(path: '/add-transaction', builder: (_, __) => const AddTransactionScreen()),
      GoRoute(
        path: '/categorias/:id',
        builder: (_, state) => CategoryDetailScreen(categoryId: state.pathParameters['id']!),
      ),
      GoRoute(path: '/config/perfil', builder: (_, __) => const ProfileScreen()),
      GoRoute(path: '/config/cartoes', builder: (_, __) => const CardsScreen()),
      GoRoute(path: '/config/transacoes', builder: (_, __) => const TransactionsScreen()),
      GoRoute(path: '/config/notificacoes', builder: (_, __) => const NotificationsScreen()),
      GoRoute(path: '/config/moedas', builder: (_, __) => const CurrenciesScreen()),
      GoRoute(path: '/config/alterar-senha', builder: (_, __) => const ChangePasswordScreen()),
      GoRoute(
        path: '/portfolio/ativo/:id',
        builder: (_, state) => AssetDetailScreen(assetId: state.pathParameters['id']!),
      ),
      GoRoute(path: '/portfolio/pesquisar', builder: (_, __) => const AssetSearchScreen()),
    ],
  );
});
