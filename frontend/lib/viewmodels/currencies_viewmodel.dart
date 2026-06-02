import 'package:dinero/models/currency.dart';
import 'package:dinero/repositories/interfaces/i_currency_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class CurrenciesState {
  final List<Currency> currencies;
  final Map<String, double> rates;
  final bool isLoading;

  const CurrenciesState({
    this.currencies = const [],
    this.rates = const {},
    this.isLoading = true,
  });

  CurrenciesState copyWith({
    List<Currency>? currencies,
    Map<String, double>? rates,
    bool? isLoading,
  }) =>
      CurrenciesState(
        currencies: currencies ?? this.currencies,
        rates: rates ?? this.rates,
        isLoading: isLoading ?? this.isLoading,
      );
}

class CurrenciesViewModel extends StateNotifier<CurrenciesState> {
  final ICurrencyRepository _repo;

  CurrenciesViewModel(this._repo) : super(const CurrenciesState()) {
    _load();
  }

  Future<void> _load() async {
    final currencies = await _repo.getAll();
    final rates = await _repo.getRates();
    state = state.copyWith(currencies: currencies, rates: rates, isLoading: false);
  }
}
