package pt.agencia.crm.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pt.agencia.crm.dto.agenda.SlotDisponivelResponse;
import pt.agencia.crm.model.Reuniao;
import pt.agencia.crm.model.User;
import pt.agencia.crm.model.enums.ReuniaoEstado;
import pt.agencia.crm.repository.ReuniaoRepository;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GoogleCalendarService {

    private static final LocalTime DIA_INICIO = LocalTime.of(9, 0);
    private static final LocalTime DIA_FIM    = LocalTime.of(18, 0);

    private final ReuniaoRepository reuniaoRepository;

    public List<SlotDisponivelResponse> calcularSlotsLivres(int dias, int duracaoMinutos) {
        LocalDate hoje = LocalDate.now();
        LocalDateTime periodoFim = hoje.plusDays(dias).atTime(23, 59);

        List<Reuniao> reunioes = reuniaoRepository
                .findByDataReuniaoBetweenOrderByDataReuniaoAsc(hoje.atStartOfDay(), periodoFim)
                .stream()
                .filter(r -> r.getEstado() == ReuniaoEstado.AGENDADA)
                .toList();

        List<SlotDisponivelResponse> slots = new ArrayList<>();

        for (int d = 0; d < dias; d++) {
            LocalDate dia = hoje.plusDays(d);
            DayOfWeek dow = dia.getDayOfWeek();
            if (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) continue;

            LocalTime atual = DIA_INICIO;
            while (!atual.plusMinutes(duracaoMinutos).isAfter(DIA_FIM)) {
                LocalDateTime inicio = dia.atTime(atual);
                LocalDateTime fim    = inicio.plusMinutes(duracaoMinutos);

                boolean ocupado = reunioes.stream().anyMatch(r -> {
                    LocalDateTime rFim = r.getDataReuniao().plusMinutes(r.getDuracaoMinutos());
                    return r.getDataReuniao().isBefore(fim) && rFim.isAfter(inicio);
                });

                slots.add(new SlotDisponivelResponse(inicio, fim, !ocupado));
                atual = atual.plusMinutes(duracaoMinutos);
            }
        }

        return slots;
    }

    public String criarEvento(Reuniao reuniao, User responsavel) {
        return null;
    }
}
