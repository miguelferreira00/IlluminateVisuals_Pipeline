package pt.agencia.crm.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import pt.agencia.crm.config.GoogleCalendarConfig;
import pt.agencia.crm.dto.agenda.SlotDisponivelResponse;
import pt.agencia.crm.model.AdminIndisponibilidade;
import pt.agencia.crm.model.Reuniao;
import pt.agencia.crm.model.User;
import pt.agencia.crm.model.enums.ReuniaoEstado;
import pt.agencia.crm.repository.IndisponibilidadeRepository;
import pt.agencia.crm.repository.ReuniaoRepository;
import pt.agencia.crm.repository.UserRepository;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleCalendarService {

    private static final LocalTime DIA_INICIO = LocalTime.of(9, 0);
    private static final LocalTime DIA_FIM    = LocalTime.of(18, 0);
    private static final ZoneId    LISBON     = ZoneId.of("Europe/Lisbon");

    private final ReuniaoRepository           reuniaoRepository;
    private final IndisponibilidadeRepository indisponibilidadeRepository;
    private final UserRepository              userRepository;
    private final GoogleCalendarConfig        googleConfig;
    private final ObjectMapper                objectMapper;

    public List<SlotDisponivelResponse> calcularSlotsLivres(int dias, int duracaoMinutos, Long adminId) {
        LocalDate hoje      = LocalDate.now();
        LocalDateTime fimPeriodo = hoje.plusDays(dias).atTime(23, 59);

        // ── Reuniões já agendadas ──────────────────────────────────
        List<Reuniao> reunioes = reuniaoRepository
                .findByDataReuniaoBetweenOrderByDataReuniaoAsc(hoje.atStartOfDay(), fimPeriodo)
                .stream().filter(r -> r.getEstado() == ReuniaoEstado.AGENDADA).toList();

        // ── Indisponibilidade do admin ─────────────────────────────
        Set<LocalDateTime> indisponivel = new HashSet<>();

        if (adminId != null) {
            // 1. When2Meet manual
            indisponibilidadeRepository
                .findByAdmin_IdAndDataHoraBetween(adminId, hoje.atStartOfDay(), fimPeriodo)
                .stream().map(AdminIndisponibilidade::getDataHora)
                .forEach(indisponivel::add);

            // 2. Google Calendar (se conectado)
            userRepository.findById(adminId).ifPresent(admin -> {
                if (admin.getGoogleCalendarToken() != null && !admin.getGoogleCalendarToken().isBlank()) {
                    fetchGoogleBusySlots(admin, hoje, hoje.plusDays(dias), duracaoMinutos)
                        .forEach(indisponivel::add);
                }
            });
        }

        // ── Gerar slots ────────────────────────────────────────────
        List<SlotDisponivelResponse> slots = new ArrayList<>();

        for (int d = 0; d < dias; d++) {
            LocalDate dia = hoje.plusDays(d);
            DayOfWeek dow = dia.getDayOfWeek();
            if (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) continue;

            LocalTime atual = DIA_INICIO;
            while (!atual.plusMinutes(duracaoMinutos).isAfter(DIA_FIM)) {
                LocalDateTime inicio = dia.atTime(atual);
                LocalDateTime fim    = inicio.plusMinutes(duracaoMinutos);

                boolean ocupadoReuniao = reunioes.stream().anyMatch(r -> {
                    LocalDateTime rFim = r.getDataReuniao().plusMinutes(r.getDuracaoMinutos());
                    return r.getDataReuniao().isBefore(fim) && rFim.isAfter(inicio);
                });

                boolean adminIndisponivel = indisponivel.stream().anyMatch(ind ->
                    !ind.isBefore(inicio) && ind.isBefore(fim)
                );

                slots.add(new SlotDisponivelResponse(inicio, fim, !ocupadoReuniao && !adminIndisponivel));
                atual = atual.plusMinutes(duracaoMinutos);
            }
        }

        return slots;
    }

    // ── Google Calendar freebusy ───────────────────────────────────

    public List<LocalDateTime> fetchGoogleBusySlots(User admin, LocalDate inicio, LocalDate fim, int duracaoMinutos) {
        try {
            String accessToken = refreshAccessToken(admin.getGoogleCalendarToken());
            if (accessToken == null) return List.of();

            String timeMin = inicio.atStartOfDay(LISBON).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
            String timeMax = fim.plusDays(1).atStartOfDay(LISBON).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);

            String body = String.format(
                "{\"timeMin\":\"%s\",\"timeMax\":\"%s\",\"items\":[{\"id\":\"primary\"}]}",
                timeMin, timeMax);

            String response = RestClient.create()
                .post()
                .uri("https://www.googleapis.com/calendar/v3/freeBusy")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(String.class);

            return parseBusyToSlots(response, inicio, fim, duracaoMinutos);

        } catch (Exception e) {
            log.warn("Erro ao obter Google Calendar para admin {}: {}", admin.getId(), e.getMessage());
            return List.of();
        }
    }

    private List<LocalDateTime> parseBusyToSlots(String json, LocalDate inicio, LocalDate fim, int duracaoMinutos) throws Exception {
        JsonNode root = objectMapper.readTree(json);
        JsonNode busy = root.path("calendars").path("primary").path("busy");

        List<LocalDateTime> ocupados = new ArrayList<>();

        for (JsonNode period : busy) {
            ZonedDateTime busyStart = ZonedDateTime.parse(period.get("start").asText()).withZoneSameInstant(LISBON);
            ZonedDateTime busyEnd   = ZonedDateTime.parse(period.get("end").asText()).withZoneSameInstant(LISBON);

            // Iterar todos os slots de 30min que se sobrepõem com este período
            LocalDate dia = inicio;
            while (!dia.isAfter(fim)) {
                LocalTime atual = DIA_INICIO;
                while (!atual.plusMinutes(duracaoMinutos).isAfter(DIA_FIM)) {
                    ZonedDateTime slotStart = dia.atTime(atual).atZone(LISBON);
                    ZonedDateTime slotEnd   = slotStart.plusMinutes(duracaoMinutos);

                    // Slot sobrepõe-se ao período ocupado?
                    if (busyStart.isBefore(slotEnd) && busyEnd.isAfter(slotStart)) {
                        ocupados.add(slotStart.toLocalDateTime());
                    }
                    atual = atual.plusMinutes(duracaoMinutos);
                }
                dia = dia.plusDays(1);
            }
        }

        return ocupados;
    }

    private String refreshAccessToken(String refreshToken) {
        try {
            String body = "grant_type=refresh_token"
                + "&refresh_token=" + URLEncoder.encode(refreshToken, StandardCharsets.UTF_8)
                + "&client_id=" + URLEncoder.encode(googleConfig.getClientId(), StandardCharsets.UTF_8)
                + "&client_secret=" + URLEncoder.encode(googleConfig.getClientSecret(), StandardCharsets.UTF_8);

            String response = RestClient.create()
                .post()
                .uri("https://oauth2.googleapis.com/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(body)
                .retrieve()
                .body(String.class);

            return objectMapper.readTree(response).path("access_token").asText(null);

        } catch (Exception e) {
            log.warn("Erro ao renovar access token Google: {}", e.getMessage());
            return null;
        }
    }

    public String criarEvento(Reuniao reuniao, User responsavel) {
        return null; // placeholder — Google Calendar event creation
    }
}
