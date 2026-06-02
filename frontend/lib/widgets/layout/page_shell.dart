import 'package:dinero/core/theme/app_colors.dart';
import 'package:flutter/material.dart';

class PageShell extends StatelessWidget {
  final String title;
  final Widget body;
  final List<Widget>? actions;
  final bool showBackButton;

  const PageShell({
    super.key,
    required this.title,
    required this.body,
    this.actions,
    this.showBackButton = true,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        title: Text(
          title,
          style: const TextStyle(
            color: AppColors.textPrimary,
            fontSize: 18,
            fontWeight: FontWeight.w700,
          ),
        ),
        centerTitle: true,
        leading: showBackButton
            ? IconButton(
                icon: const Icon(Icons.arrow_back_ios_new, color: AppColors.textPrimary, size: 18),
                onPressed: () => Navigator.of(context).pop(),
              )
            : null,
        actions: actions,
      ),
      body: body,
    );
  }
}
