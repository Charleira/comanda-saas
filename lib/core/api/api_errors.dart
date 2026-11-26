import 'package:dio/dio.dart';

String apiErrorMessage(Object error, {String fallback = 'Algo deu errado. Tente novamente.'}) {
  if (error is DioException) {
    final data = error.response?.data;
    final code = data is Map ? data['error']?.toString() : null;

    const messages = <String, String>{
      'INSUFFICIENT_BALANCE': 'Saldo insuficiente.',
      'CARD_NOT_FOUND': 'Cartão não encontrado ou inativo.',
      'NOT_FOUND': 'Registro não encontrado.',
      'PRODUCT_NOT_FOUND': 'Produto indisponível.',
      'STALL_NOT_FOUND': 'Barraca indisponível.',
      'PRODUCT_NOT_IN_STALL': 'Este produto não pertence a esta barraca.',
      'EVENT_NOT_ACTIVE': 'O evento não está em operação. Fale com o administrador.',
      'CARD_EVENT_MISMATCH': 'Este cartão pertence a outro evento.',
      'OPERATOR_NOT_ASSIGNED_TO_STALL': 'Você não está vinculado a esta barraca.',
      'ORGANIZATION_BLOCKED': 'Organização bloqueada. Contate o suporte.',
      'CARD_ALREADY_ACTIVE': 'Este cartão já está ativo.',
      'CARD_ACTIVE_IN_ANOTHER_EVENT': 'Este cartão está ativo em outro evento.',
      'NFC_ALREADY_LINKED_TO_ANOTHER_CUSTOMER': 'Este cartão já está vinculado a um cliente.',
      'FORBIDDEN': 'Você não tem permissão para esta ação.',
    };

    if (code != null && messages.containsKey(code)) return messages[code]!;

    if (error.response?.statusCode == 401) return 'Sessão expirada. Faça login novamente.';

    if (error.type == DioExceptionType.connectionError ||
        error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.sendTimeout) {
      return 'Sem conexão com o servidor. Verifique a rede.';
    }
  }
  return fallback;
}