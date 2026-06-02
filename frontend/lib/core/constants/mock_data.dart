import 'package:dinero/models/asset.dart';
import 'package:dinero/models/card_model.dart';
import 'package:dinero/models/category.dart';
import 'package:dinero/models/currency.dart';
import 'package:dinero/models/transaction.dart';
import 'package:dinero/core/theme/app_colors.dart';
// ignore_for_file: unused_import

class MockData {
  static final DateTime _now = DateTime(2026, 3, 24);
  static DateTime _d(int daysAgo) => _now.subtract(Duration(days: daysAgo));

  static const List<Category> categories = [
    Category(id: 'moradia',     name: 'Moradia',     emoji: '🏠', color: AppColors.catMoradia,     isDefault: true, budgetAmount: 2500.00),
    Category(id: 'alimentacao', name: 'Alimentação', emoji: '🍔', color: AppColors.catAlimentacao, isDefault: true, budgetAmount: 1000.00),
    Category(id: 'transporte',  name: 'Transporte',  emoji: '🚗', color: AppColors.catTransporte,  isDefault: true, budgetAmount: 500.00),
    Category(id: 'lazer',       name: 'Lazer',       emoji: '🎮', color: AppColors.catLazer,       isDefault: true, budgetAmount: 400.00),
    Category(id: 'assinaturas', name: 'Assinaturas', emoji: '📱', color: AppColors.catAssinaturas, isDefault: true, budgetAmount: 350.00),
    Category(id: 'saude',       name: 'Saúde',       emoji: '❤️', color: AppColors.catSaude,       isDefault: true, budgetAmount: 300.00),
    Category(id: 'educacao',    name: 'Educação',    emoji: '📚', color: AppColors.catEducacao,    isDefault: true, budgetAmount: 200.00),
    Category(id: 'outros',      name: 'Outros',      emoji: '💼', color: AppColors.catOutros,      isDefault: true),
  ];

  static List<Transaction> get transactions => [
    Transaction(id: 't1',  value: 287.43,  currency: 'BRL', exchangeRate: 1.0,  valueInBrl: 287.43,  type: TransactionType.expense, categoryId: 'alimentacao', description: 'Supermercado Condor',  date: _d(0)),
    Transaction(id: 't2',  value: 189.90,  currency: 'BRL', exchangeRate: 1.0,  valueInBrl: 189.90,  type: TransactionType.expense, categoryId: 'moradia',     description: 'Conta de Luz',        date: _d(1)),
    Transaction(id: 't3',  value: 32.50,   currency: 'BRL', exchangeRate: 1.0,  valueInBrl: 32.50,   type: TransactionType.expense, categoryId: 'lazer',       description: 'Starbucks',           date: _d(1)),
    Transaction(id: 't4',  value: 15.99,   currency: 'USD', exchangeRate: 5.85, valueInBrl: 93.54,   type: TransactionType.expense, categoryId: 'assinaturas', description: 'Spotify',             date: _d(3), isPendingSync: true),
    Transaction(id: 't5',  value: 19.99,   currency: 'USD', exchangeRate: 5.85, valueInBrl: 116.94,  type: TransactionType.expense, categoryId: 'assinaturas', description: 'ChatGPT Plus',        date: _d(3), isPendingSync: true),
    Transaction(id: 't6',  value: 49.90,   currency: 'BRL', exchangeRate: 1.0,  valueInBrl: 49.90,   type: TransactionType.expense, categoryId: 'transporte',  description: 'Combustível',         date: _d(4)),
    Transaction(id: 't7',  value: 89.90,   currency: 'BRL', exchangeRate: 1.0,  valueInBrl: 89.90,   type: TransactionType.expense, categoryId: 'saude',       description: 'Farmácia',            date: _d(5)),
    Transaction(id: 't8',  value: 25.00,   currency: 'USD', exchangeRate: 5.85, valueInBrl: 146.25,  type: TransactionType.expense, categoryId: 'lazer',       description: 'Steam - Jogo',        date: _d(6), isPendingSync: true),
    Transaction(id: 't9',  value: 1800.00, currency: 'BRL', exchangeRate: 1.0,  valueInBrl: 1800.00, type: TransactionType.expense, categoryId: 'moradia',     description: 'Aluguel',             date: _d(7)),
    Transaction(id: 't10', value: 79.90,   currency: 'BRL', exchangeRate: 1.0,  valueInBrl: 79.90,   type: TransactionType.expense, categoryId: 'alimentacao', description: 'iFood',               date: _d(8)),
    Transaction(id: 't11', value: 5000.00, currency: 'BRL', exchangeRate: 1.0,  valueInBrl: 5000.00, type: TransactionType.income,  categoryId: 'outros',      description: 'Salário',             date: _d(5)),
    Transaction(id: 't12', value: 1500.00, currency: 'BRL', exchangeRate: 1.0,  valueInBrl: 1500.00, type: TransactionType.income,  categoryId: 'outros',      description: 'Freelance',           date: _d(10)),
    Transaction(id: 't13', value: 340.00,  currency: 'BRL', exchangeRate: 1.0,  valueInBrl: 340.00,  type: TransactionType.income,  categoryId: 'outros',      description: 'Dividendos MXRF11',   date: _d(12)),
    Transaction(id: 't14', value: 200.00,  currency: 'USD', exchangeRate: 5.85, valueInBrl: 1170.00, type: TransactionType.income,  categoryId: 'outros',      description: 'Venda internacional', date: _d(15), isPendingSync: true),
    Transaction(id: 't15', value: 120.00,  currency: 'BRL', exchangeRate: 1.0,  valueInBrl: 120.00,  type: TransactionType.expense, categoryId: 'educacao',    description: 'Udemy - Cursos',      date: _d(9)),
    Transaction(id: 't16', value: 35.90,   currency: 'BRL', exchangeRate: 1.0,  valueInBrl: 35.90,   type: TransactionType.expense, categoryId: 'alimentacao', description: 'Padaria',             date: _d(11)),
    Transaction(id: 't17', value: 55.00,   currency: 'BRL', exchangeRate: 1.0,  valueInBrl: 55.00,   type: TransactionType.expense, categoryId: 'transporte',  description: 'Uber',                date: _d(13)),
    Transaction(id: 't18', value: 9.90,    currency: 'EUR', exchangeRate: 6.40, valueInBrl: 63.36,   type: TransactionType.expense, categoryId: 'assinaturas', description: 'Netflix',             date: _d(14), isPendingSync: true),
    Transaction(id: 't19', value: 250.00,  currency: 'BRL', exchangeRate: 1.0,  valueInBrl: 250.00,  type: TransactionType.income,  categoryId: 'outros',      description: 'Cashback',            date: _d(20)),
    Transaction(id: 't20', value: 45.00,   currency: 'BRL', exchangeRate: 1.0,  valueInBrl: 45.00,   type: TransactionType.expense, categoryId: 'saude',       description: 'Academia',            date: _d(16)),
  ];

  static const List<Asset> assets = [
    Asset(id: 'a1', ticker: 'MXRF11', name: 'Maxi Renda',     quantity: 150, currentPrice: 10.23,  changePercent: 1.20,  priceHistory: [9.80, 9.90, 10.05, 10.10, 9.95, 10.15, 10.23],           currency: 'BRL', assetType: AssetType.fiis),
    Asset(id: 'a2', ticker: 'HGLG11', name: 'CSHG Logística', quantity: 20,  currentPrice: 164.50, changePercent: -0.80, priceHistory: [166.00, 165.50, 164.80, 165.20, 164.90, 165.10, 164.50], currency: 'BRL', assetType: AssetType.fiis),
    Asset(id: 'a3', ticker: 'AAPL34', name: 'Apple BDR',      quantity: 30,  currentPrice: 52.80,  changePercent: 2.10,  priceHistory: [50.00, 51.00, 51.50, 52.00, 51.80, 52.50, 52.80],         currency: 'BRL', assetType: AssetType.bdrs),
    Asset(id: 'a4', ticker: 'PETR4',  name: 'Petrobras PN',   quantity: 100, currentPrice: 38.42,  changePercent: -1.50, priceHistory: [39.50, 39.20, 38.90, 38.60, 38.80, 38.60, 38.42],         currency: 'BRL', assetType: AssetType.acoes),
    Asset(id: 'a5', ticker: 'IVVB11', name: 'iShares S&P500', quantity: 45,  currentPrice: 318.90, changePercent: 0.70,  priceHistory: [315.00, 316.00, 317.50, 317.00, 318.00, 318.50, 318.90],  currency: 'BRL', assetType: AssetType.etfs),
  ];

  // Catálogo completo para pesquisa (13 ativos)
  static const List<Asset> searchableAssets = [
    Asset(id: 's1',  ticker: 'PETR4',  name: 'Petrobras PN',        quantity: 0, currentPrice: 38.42,  changePercent: -1.50, priceHistory: [39.50, 39.20, 38.90, 38.60, 38.80, 38.60, 38.42],         currency: 'BRL', assetType: AssetType.acoes),
    Asset(id: 's2',  ticker: 'VALE3',  name: 'Vale ON',             quantity: 0, currentPrice: 62.15,  changePercent: -2.38, priceHistory: [64.00, 63.50, 63.00, 62.80, 63.20, 62.50, 62.15],         currency: 'BRL', assetType: AssetType.acoes),
    Asset(id: 's3',  ticker: 'ITUB4',  name: 'Itaú Unibanco PN',   quantity: 0, currentPrice: 34.78,  changePercent: 1.80,  priceHistory: [34.10, 34.20, 34.35, 34.50, 34.40, 34.60, 34.78],         currency: 'BRL', assetType: AssetType.acoes),
    Asset(id: 's4',  ticker: 'WEGE3',  name: 'WEG ON',             quantity: 0, currentPrice: 42.30,  changePercent: 3.20,  priceHistory: [40.80, 41.00, 41.20, 41.50, 41.80, 42.00, 42.30],         currency: 'BRL', assetType: AssetType.acoes),
    Asset(id: 's5',  ticker: 'MGLU3',  name: 'Magazine Luiza ON',  quantity: 0, currentPrice: 8.45,   changePercent: -0.50, priceHistory: [9.20, 9.00, 8.80, 8.70, 8.60, 8.50, 8.45],               currency: 'BRL', assetType: AssetType.acoes),
    Asset(id: 's6',  ticker: 'BBAS3',  name: 'Banco do Brasil ON', quantity: 0, currentPrice: 57.20,  changePercent: 0.90,  priceHistory: [56.50, 56.70, 57.00, 56.80, 57.10, 57.00, 57.20],         currency: 'BRL', assetType: AssetType.acoes),
    Asset(id: 's7',  ticker: 'MXRF11', name: 'Maxi Renda FII',     quantity: 0, currentPrice: 10.23,  changePercent: 1.20,  priceHistory: [9.80, 9.90, 10.05, 10.10, 9.95, 10.15, 10.23],           currency: 'BRL', assetType: AssetType.fiis),
    Asset(id: 's8',  ticker: 'HGLG11', name: 'CSHG Logística FII', quantity: 0, currentPrice: 164.50, changePercent: -0.80, priceHistory: [166.00, 165.50, 164.80, 165.20, 164.90, 165.10, 164.50], currency: 'BRL', assetType: AssetType.fiis),
    Asset(id: 's9',  ticker: 'XPML11', name: 'XP Malls FII',       quantity: 0, currentPrice: 96.40,  changePercent: 0.42,  priceHistory: [95.00, 95.50, 96.00, 95.80, 96.20, 96.10, 96.40],         currency: 'BRL', assetType: AssetType.fiis),
    Asset(id: 's10', ticker: 'AAPL34', name: 'Apple BDR',           quantity: 0, currentPrice: 52.80,  changePercent: 2.10,  priceHistory: [50.00, 51.00, 51.50, 52.00, 51.80, 52.50, 52.80],         currency: 'BRL', assetType: AssetType.bdrs),
    Asset(id: 's11', ticker: 'MSFT34', name: 'Microsoft BDR',       quantity: 0, currentPrice: 86.40,  changePercent: 1.50,  priceHistory: [84.00, 84.50, 85.00, 85.50, 86.00, 86.20, 86.40],         currency: 'BRL', assetType: AssetType.bdrs),
    Asset(id: 's12', ticker: 'IVVB11', name: 'iShares S&P500',      quantity: 0, currentPrice: 318.90, changePercent: 0.70,  priceHistory: [315.00, 316.00, 317.50, 317.00, 318.00, 318.50, 318.90],  currency: 'BRL', assetType: AssetType.etfs),
    Asset(id: 's13', ticker: 'HASH11', name: 'Hashdex Nasdaq Crypto',quantity: 0, currentPrice: 32.70,  changePercent: 4.20,  priceHistory: [30.00, 30.50, 31.00, 31.50, 32.00, 32.50, 32.70],         currency: 'BRL', assetType: AssetType.cripto),
  ];

  static const List<CardModel> cards = [
    CardModel(id: 'c1', name: 'Nubank',         currentBill: 3456.78, dueDays: 10, color: AppColors.nubank,      lastFour: '4523', network: 'MASTERCARD', creditLimit: 12000.00),
    CardModel(id: 'c2', name: 'Inter',           currentBill: 2134.50, dueDays: 15, color: AppColors.inter,       lastFour: '8891', network: 'VISA',       creditLimit: 8000.00),
    CardModel(id: 'c3', name: 'Banco do Brasil', currentBill: 0.00,    dueDays: 0,  color: AppColors.bancoBrasil, lastFour: '3312', network: 'ELO',        isDebit: true),
  ];

  static const Map<String, double> exchangeRates = {
    'USD': 5.85,
    'EUR': 6.40,
    'GBP': 7.42,
    'ARS': 0.006,
    'BTC': 485000.00,
    'ETH': 25800.00,
  };

  static const List<Currency> currencies = [
    Currency(code: 'BRL', name: 'Real Brasileiro', symbol: 'R\$', rateToBase: 1.0),
    Currency(code: 'USD', name: 'Dólar Americano', symbol: '\$', rateToBase: 5.85),
    Currency(code: 'EUR', name: 'Euro', symbol: '€', rateToBase: 6.40),
    Currency(code: 'GBP', name: 'Libra Esterlina', symbol: '£', rateToBase: 7.42),
    Currency(code: 'ARS', name: 'Peso Argentino', symbol: '\$', rateToBase: 0.006),
    Currency(code: 'BTC', name: 'Bitcoin', symbol: '₿', rateToBase: 485000.00),
    Currency(code: 'ETH', name: 'Ethereum', symbol: 'Ξ', rateToBase: 25800.00),
  ];
}
