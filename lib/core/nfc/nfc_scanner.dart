import 'dart:async';
import 'package:flutter/material.dart';
import 'package:nfc_manager/nfc_manager.dart';

class NfcScanner {
  NfcScanner._();

  /// Mostra o diálogo "Aproxime o cartão" e devolve o número de série lido
  /// (hexadecimal maiúsculo, sem separadores), ou null se cancelar, der erro
  /// ou o NFC estiver indisponível.
  static Future<String?> scan(BuildContext context, String message) async {
    final messenger = ScaffoldMessenger.of(context);
    final navigator = Navigator.of(context, rootNavigator: true);

    final available = await NfcManager.instance.isAvailable();
    if (!available) {
      messenger.showSnackBar(
        const SnackBar(content: Text('NFC não disponível ou desativado neste aparelho')),
      );
      return null;
    }
    if (!context.mounted) return null;

    final completer = Completer<String?>();
    var dialogOpen = true;

    void closeDialog() {
      if (dialogOpen) {
        dialogOpen = false;
        navigator.pop();
      }
    }

    void finish(String? value) {
      if (!completer.isCompleted) completer.complete(value);
    }

    showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (_) => PopScope(
        canPop: false,
        child: AlertDialog(
          title: const Text('Aproxime o cartão'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(height: 8),
              const Icon(Icons.nfc, size: 48),
              const SizedBox(height: 16),
              Text(message, textAlign: TextAlign.center),
              const SizedBox(height: 20),
              const CircularProgressIndicator(),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                NfcManager.instance.stopSession();
                closeDialog();
                finish(null);
              },
              child: const Text('Cancelar'),
            ),
          ],
        ),
      ),
    );

    try {
      await NfcManager.instance.startSession(
        onDiscovered: (NfcTag tag) async {
          final id = tag.data['nfca']?['identifier'] ?? tag.data['mifareclassic']?['identifier'];
          await NfcManager.instance.stopSession();
          closeDialog();

          if (id is List) {
            final nfcId = id.map((b) => (b as int).toRadixString(16).padLeft(2, '0')).join().toUpperCase();
            finish(nfcId);
          } else {
            messenger.showSnackBar(
              const SnackBar(content: Text('Não foi possível ler este cartão')),
            );
            finish(null);
          }
        },
      );
    } catch (_) {
      closeDialog();
      messenger.showSnackBar(const SnackBar(content: Text('Erro ao ler o cartão')));
      finish(null);
    }

    return completer.future;
  }
}