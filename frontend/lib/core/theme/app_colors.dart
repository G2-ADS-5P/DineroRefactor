import 'package:flutter/material.dart';

class AppColors extends ThemeExtension<AppColors> {
  // Instance fields – theme-dependent
  final Color background;
  final Color surface;
  final Color surfaceAlt;
  final Color surfaceInput;
  final Color textPrimary;
  final Color textSecondary;
  final Color textMuted;
  final Color border;
  final Color borderLight;

  const AppColors({
    required this.background,
    required this.surface,
    required this.surfaceAlt,
    required this.surfaceInput,
    required this.textPrimary,
    required this.textSecondary,
    required this.textMuted,
    required this.border,
    required this.borderLight,
  });

  // Static accessor – use this in every widget
  static AppColors of(BuildContext context) =>
      Theme.of(context).extension<AppColors>()!;

  // Dark preset (original values)
  static const AppColors dark = AppColors(
    background:   Color(0xFF0A0A0A),
    surface:      Color(0xFF141414),
    surfaceAlt:   Color(0xFF1C1C1C),
    surfaceInput: Color(0xFF1E1E1E),
    textPrimary:   Color(0xFFFFFFFF),
    textSecondary: Color(0xFF9CA3AF),
    textMuted:     Color(0xFF6B7280),
    border:        Color(0xFF262626),
    borderLight:   Color(0xFF2D2D2D),
  );

  // Light preset
  static const AppColors light = AppColors(
    background:   Color(0xFFF4F6F8),
    surface:      Color(0xFFFFFFFF),
    surfaceAlt:   Color(0xFFF0F2F4),
    surfaceInput: Color(0xFFE8EAED),
    textPrimary:   Color(0xFF111111),
    textSecondary: Color(0xFF6B7280),
    textMuted:     Color(0xFF9CA3AF),
    border:        Color(0xFFE0E0E0),
    borderLight:   Color(0xFFEEEEEE),
  );

  // Brand
  static const Color primary      = Color(0xFF22C55E);
  static const Color primaryDark  = Color(0xFF16A34A);

  // Semantic
  static const Color income   = Color(0xFF22C55E);
  static const Color expense  = Color(0xFFEF4444);
  static const Color warning  = Color(0xFFF59E0B);
  static const Color danger   = Color(0xFFEF4444);

  // Category colors
  static const Color catMoradia     = Color(0xFF3B82F6);
  static const Color catAlimentacao = Color(0xFFF97316);
  static const Color catTransporte  = Color(0xFF22C55E);
  static const Color catLazer       = Color(0xFFA855F7);
  static const Color catAssinaturas = Color(0xFF06B6D4);
  static const Color catSaude       = Color(0xFFEC4899);
  static const Color catEducacao    = Color(0xFFF59E0B);
  static const Color catOutros      = Color(0xFF64748B);

  // Cards
  static const Color nubank      = Color(0xFF8B5CF6);
  static const Color inter       = Color(0xFFFF6B00);
  static const Color bancoBrasil = Color(0xFFD4A017);

  @override
  AppColors copyWith({
    Color? background, Color? surface, Color? surfaceAlt, Color? surfaceInput,
    Color? textPrimary, Color? textSecondary, Color? textMuted,
    Color? border, Color? borderLight,
  }) => AppColors(
    background:    background    ?? this.background,
    surface:       surface       ?? this.surface,
    surfaceAlt:    surfaceAlt    ?? this.surfaceAlt,
    surfaceInput:  surfaceInput  ?? this.surfaceInput,
    textPrimary:   textPrimary   ?? this.textPrimary,
    textSecondary: textSecondary ?? this.textSecondary,
    textMuted:     textMuted     ?? this.textMuted,
    border:        border        ?? this.border,
    borderLight:   borderLight   ?? this.borderLight,
  );

  @override
  AppColors lerp(AppColors? other, double t) {
    if (other == null) return this;
    return AppColors(
      background:    Color.lerp(background,    other.background,    t)!,
      surface:       Color.lerp(surface,       other.surface,       t)!,
      surfaceAlt:    Color.lerp(surfaceAlt,    other.surfaceAlt,    t)!,
      surfaceInput:  Color.lerp(surfaceInput,  other.surfaceInput,  t)!,
      textPrimary:   Color.lerp(textPrimary,   other.textPrimary,   t)!,
      textSecondary: Color.lerp(textSecondary, other.textSecondary, t)!,
      textMuted:     Color.lerp(textMuted,     other.textMuted,     t)!,
      border:        Color.lerp(border,        other.border,        t)!,
      borderLight:   Color.lerp(borderLight,   other.borderLight,   t)!,
    );
  }
}
