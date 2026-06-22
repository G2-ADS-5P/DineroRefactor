class CreateUserData {
  final String name;
  final String email;
  final String password;
  final String? phone;
  final DateTime? birthDate;
  final String? location;

  const CreateUserData({
    required this.name,
    required this.email,
    required this.password,
    this.phone,
    this.birthDate,
    this.location,
  });

  /// Envia SÓ os campos do CreateUserDto, omitindo os nulos.
  /// O backend tem whitelist estrita e rejeita campos extras (400).
  /// birthDate vai como date ISO "yyyy-MM-dd" (sem hora).
  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{
      'name': name,
      'email': email,
      'password': password,
    };
    if (phone != null) json['phone'] = phone;
    if (birthDate != null) {
      json['birthDate'] = birthDate!.toIso8601String().split('T').first;
    }
    if (location != null) json['location'] = location;
    return json;
  }
}
