package pt.agencia.crm.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class IcsCalendarService {

    private static final ZoneId    LISBON       = ZoneId.of("Europe/Lisbon");
    private static final LocalTime DIA_INICIO   = LocalTime.of(9, 0);
    private static final LocalTime DIA_FIM      = LocalTime.of(18, 0);
    private static final DateTimeFormatter UTC_FMT   = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'");
    private static final DateTimeFormatter LOCAL_FMT  = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss");
    private static final DateTimeFormatter DATE_FMT   = DateTimeFormatter.ofPattern("yyyyMMdd");

    public List<LocalDateTime> fetchBusySlots(String icsUrl, LocalDate inicio, LocalDate fim, int duracaoMinutos) {
        try {
            String url = icsUrl.replace("webcal://", "https://");
            String ics = RestClient.create().get().uri(url).retrieve().body(String.class);
            if (ics == null) return List.of();
            return parseSlots(ics, inicio, fim, duracaoMinutos);
        } catch (Exception e) {
            log.warn("Erro ao obter ICS de {}: {}", icsUrl, e.getMessage());
            return List.of();
        }
    }

    private List<LocalDateTime> parseSlots(String ics, LocalDate inicio, LocalDate fim, int dur) {
        // Juntar linhas com fold (RFC 5545)
        String content = ics.replace("\r\n ", "").replace("\r\n", "\n").replace("\n ", "");

        List<LocalDateTime> result = new ArrayList<>();
        String[] lines = content.split("\n");

        ZonedDateTime evStart = null;
        ZonedDateTime evEnd   = null;
        boolean inEvent = false;

        for (String raw : lines) {
            String line = raw.trim();

            if (line.equals("BEGIN:VEVENT")) {
                inEvent = true;
                evStart = evEnd = null;
                continue;
            }
            if (line.equals("END:VEVENT") && inEvent) {
                inEvent = false;
                if (evStart != null && evEnd != null) {
                    generateOccupiedSlots(evStart, evEnd, inicio, fim, dur, result);
                }
                continue;
            }

            if (!inEvent) continue;

            if (line.startsWith("DTSTART")) {
                evStart = parseDateTime(line);
            } else if (line.startsWith("DTEND") || line.startsWith("DURATION")) {
                if (line.startsWith("DTEND")) evEnd = parseDateTime(line);
            }
        }
        return result;
    }

    private ZonedDateTime parseDateTime(String line) {
        try {
            String value = line.substring(line.indexOf(':') + 1).trim();

            // Dia inteiro: DTSTART;VALUE=DATE:20240508
            if (line.contains("VALUE=DATE") || (!value.contains("T"))) {
                LocalDate d = LocalDate.parse(value, DATE_FMT);
                return d.atStartOfDay(LISBON);
            }
            // UTC: 20240508T103000Z
            if (value.endsWith("Z")) {
                return LocalDateTime.parse(value, UTC_FMT).atZone(ZoneOffset.UTC).withZoneSameInstant(LISBON);
            }
            // TZID: DTSTART;TZID=Europe/Lisbon:20240508T103000
            if (line.contains("TZID=")) {
                String tzid = line.substring(line.indexOf("TZID=") + 5, line.indexOf(':'));
                ZoneId zone = safeZone(tzid);
                return LocalDateTime.parse(value, LOCAL_FMT).atZone(zone).withZoneSameInstant(LISBON);
            }
            // Local sem timezone
            return LocalDateTime.parse(value, LOCAL_FMT).atZone(LISBON);
        } catch (Exception e) {
            return null;
        }
    }

    private void generateOccupiedSlots(ZonedDateTime evStart, ZonedDateTime evEnd,
                                        LocalDate inicio, LocalDate fim, int dur,
                                        List<LocalDateTime> result) {
        LocalDateTime start = evStart.withZoneSameInstant(LISBON).toLocalDateTime();
        LocalDateTime end   = evEnd.withZoneSameInstant(LISBON).toLocalDateTime();

        // Evento de dia inteiro → bloqueia 09:00-18:00
        boolean allDay = start.toLocalTime().equals(LocalTime.MIDNIGHT) && end.toLocalTime().equals(LocalTime.MIDNIGHT);

        LocalDate dia = inicio;
        while (!dia.isAfter(fim)) {
            DayOfWeek dow = dia.getDayOfWeek();
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) {
                LocalTime hora = allDay ? DIA_INICIO : DIA_INICIO;
                while (!hora.plusMinutes(dur).isAfter(DIA_FIM)) {
                    LocalDateTime slotStart = dia.atTime(hora);
                    LocalDateTime slotEnd   = slotStart.plusMinutes(dur);
                    if (start.isBefore(slotEnd) && end.isAfter(slotStart)) {
                        result.add(slotStart);
                    }
                    hora = hora.plusMinutes(dur);
                }
            }
            dia = dia.plusDays(1);
        }
    }

    private ZoneId safeZone(String tzid) {
        try { return ZoneId.of(tzid); } catch (Exception e) { return LISBON; }
    }
}
