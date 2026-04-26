package pt.agencia.crm.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import pt.agencia.crm.dto.agenda.SlotDisponivelResponse;
import pt.agencia.crm.model.Reuniao;
import pt.agencia.crm.model.User;

import java.util.List;

/**
 * Stub — integração Google Calendar desativada até configurar OAuth2.
 * Substituir pela implementação real quando as credenciais estiverem prontas.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleCalendarService {

    public List<SlotDisponivelResponse> calcularSlotsLivres(int dias, int duracaoMinutos) {
        log.warn("Google Calendar não configurado — a devolver lista vazia de slots.");
        return List.of();
    }

    public String criarEvento(Reuniao reuniao, User responsavel) {
        log.warn("Google Calendar não configurado — evento não criado.");
        return null;
    }
}
