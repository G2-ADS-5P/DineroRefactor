import 'package:intl/intl.dart';

class DateFormatter {
  static final _dayMonth = DateFormat('d MMM', 'pt_BR');
  static final _fullDate = DateFormat('d \'de\' MMMM \'de\' y', 'pt_BR');
  static final _monthYear = DateFormat('MMMM y', 'pt_BR');
  static final _short = DateFormat('dd/MM/yyyy', 'pt_BR');

  static String dayMonth(DateTime date) => _dayMonth.format(date);
  static String full(DateTime date) => _fullDate.format(date);
  static String monthYear(DateTime date) => _monthYear.format(date);
  static String short(DateTime date) => _short.format(date);

  static String relative(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date).inDays;
    if (diff == 0) return 'Hoje';
    if (diff == 1) return 'Ontem';
    return dayMonth(date);
  }
}
