import 'package:intl/intl.dart';

class CurrencyFormatter {
  static final _brlFormat = NumberFormat.currency(
    locale: 'pt_BR',
    symbol: 'R\$ ',
    decimalDigits: 2,
  );

  static String format(double value) => _brlFormat.format(value);

  static final _valueFormat = NumberFormat('#,##0.00', 'pt_BR');
  static String formatValue(double value) => _valueFormat.format(value);

  static String formatCompact(double value) {
    if (value >= 1000000) {
      return 'R\$ ${(value / 1000000).toStringAsFixed(1)}M';
    } else if (value >= 1000) {
      return 'R\$ ${(value / 1000).toStringAsFixed(1)}K';
    }
    return format(value);
  }
}
