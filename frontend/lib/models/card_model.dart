import 'package:flutter/material.dart';

class CardModel {
  final String id;
  final String name;
  final double currentBill;
  final int dueDays;
  final Color color;
  final String lastFour;
  final double? creditLimit;
  final String network;
  final bool isDebit;

  const CardModel({
    required this.id,
    required this.name,
    required this.currentBill,
    required this.dueDays,
    required this.color,
    required this.lastFour,
    required this.network,
    this.creditLimit,
    this.isDebit = false,
  });
}
