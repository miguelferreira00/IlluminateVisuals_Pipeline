package pt.agencia.crm.service;

import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.*;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.UserCredentials;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import pt.agencia.crm.dto.agenda.SlotDisponivelResponse;
import pt.agencia.crm.model.Contacto;
import pt.agencia.crm.model.Reuniao;
import pt.agencia.crm.model.User;
import pt.agencia.crm.model.enums.UserRole;
import pt.agencia.crm.repository.UserRepository;

import java.io.IOException;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleCalendarService {

    private static final ZoneId ZONA = ZoneId.of("Europe/Lisbon");

    private final NetHttpTransport httpTransport;
    private final JsonFactory jsonFactory;
    private final UserRepository userRepository;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String clientSecret;

    public List<SlotDisponivelResponse> calcularSlotsLivres(int dias, int duracaoMinutos) {
        List<User> socios = userRepository.findByAtivoTrue().stream()
                .filter(u -> u.getRole() != UserRole.CALLER && u.getGoogleCalendarToken() != null)
                .toList();

        if (socios.isEmpty()) return List.of();

        ZonedDateTime agora = ZonedDateTime.now(ZONA);
        ZonedDateTime fim = agora.plusDays(dias);
        DateTime timeMin = new DateTime(agora.toInstant().toEpochMilli());
        DateTime timeMax = new DateTime(fim.toInstant().toEpochMilli());

        List<TimePeriod> ocupado = new ArrayList<>();
        for (User socio : socios) {
            try {
                Calendar cal = buildCalendarService(socio.getGoogleCalendarToken());
                FreeBusyRequest fbRequest = new FreeBusyRequest()
                        .setTimeMin(timeMin)
                        .setTimeMax(timeMax)
                        .setItems(List.of(new FreeBusyRequestItem().setId("primary")));

                FreeBusyResponse response = cal.freebusy().query(fbRequest).execute();
                List<TimePeriod> busy = response.getCalendars().get("primary").getBusy();
                if (busy != null) ocupado.addAll(busy);
            } catch (IOException e) {
                log.warn("Erro ao obter freebusy do sócio {}: {}", socio.getEmail(), e.getMessage());
            }
        }

        return gerarSlots(agora, fim, duracaoMinutos, ocupado);
    }

    public String criarEvento(Reuniao reuniao, User responsavel) {
        try {
            Calendar cal = buildCalendarService(responsavel.getGoogleCalendarToken());
            Contacto c = reuniao.getContacto();

            Event event = new Event()
                    .setSummary("Reunião Agência + " + c.getEmpresa())
                    .setDescription(String.format("Empresa: %s\nDecisor: %s\nCargo: %s\nTelefone: %s",
                            c.getEmpresa(), c.getNomeDecisor(), c.getCargo(), c.getTelefone()));

            long startMillis = reuniao.getDataReuniao().atZone(ZONA).toInstant().toEpochMilli();
            long endMillis = reuniao.getDataReuniao().plusMinutes(reuniao.getDuracaoMinutos())
                    .atZone(ZONA).toInstant().toEpochMilli();

            event.setStart(new EventDateTime().setDateTime(new DateTime(startMillis)).setTimeZone(ZONA.getId()));
            event.setEnd(new EventDateTime().setDateTime(new DateTime(endMillis)).setTimeZone(ZONA.getId()));

            List<EventAttendee> attendees = new ArrayList<>();
            attendees.add(new EventAttendee().setEmail(responsavel.getEmail()));
            if (c.getEmail() != null && !c.getEmail().isBlank()) {
                attendees.add(new EventAttendee().setEmail(c.getEmail()));
            }
            event.setAttendees(attendees);

            return cal.events().insert("primary", event).execute().getId();
        } catch (IOException e) {
            log.error("Erro ao criar evento no Google Calendar: {}", e.getMessage());
            return null;
        }
    }

    private Calendar buildCalendarService(String refreshToken) throws IOException {
        UserCredentials credentials = UserCredentials.newBuilder()
                .setClientId(clientId)
                .setClientSecret(clientSecret)
                .setRefreshToken(refreshToken)
                .build();
        return new Calendar.Builder(httpTransport, jsonFactory, new HttpCredentialsAdapter(credentials))
                .setApplicationName("CRM Agência")
                .build();
    }

    private List<SlotDisponivelResponse> gerarSlots(ZonedDateTime inicio, ZonedDateTime fim,
                                                     int duracaoMinutos, List<TimePeriod> ocupado) {
        List<SlotDisponivelResponse> slots = new ArrayList<>();
        ZonedDateTime cursor = inicio.plusHours(1).truncatedTo(ChronoUnit.HOURS);

        while (cursor.plusMinutes(duracaoMinutos).isBefore(fim)) {
            int hora = cursor.getHour();
            boolean diaUtil = cursor.getDayOfWeek().getValue() <= 5;

            if (hora >= 9 && hora < 18 && diaUtil) {
                ZonedDateTime slotFim = cursor.plusMinutes(duracaoMinutos);
                long sStart = cursor.toInstant().toEpochMilli();
                long sEnd = slotFim.toInstant().toEpochMilli();

                boolean livre = ocupado.stream().noneMatch(p ->
                        p.getStart().getValue() < sEnd && p.getEnd().getValue() > sStart);

                slots.add(new SlotDisponivelResponse(cursor.toLocalDateTime(), slotFim.toLocalDateTime(), livre));
            }
            cursor = cursor.plusMinutes(duracaoMinutos);
        }
        return slots;
    }
}
