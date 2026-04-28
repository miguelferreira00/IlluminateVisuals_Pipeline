package pt.agencia.crm.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pt.agencia.crm.dto.agenda.SlotDisponivelResponse;
import pt.agencia.crm.model.AdminIndisponibilidade;
import pt.agencia.crm.model.Reuniao;
import pt.agencia.crm.model.User;
import pt.agencia.crm.model.enums.ReuniaoEstado;
import pt.agencia.crm.repository.IndisponibilidadeRepository;
import pt.agencia.crm.repository.ReuniaoRepository;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GoogleCalendarService {

    private static final LocalTime DIA_INICIO = LocalTime.of(9, 0);
    private static final LocalTime DIA_FIM    = LocalTime.of(18, 0);

    private final ReuniaoRepository reuniaoRepository;
    private final IndisponibilidadeRepository indisponibilidadeRepository;

    public List<SlotDisponivelResponse> calcularSlotsLivres(int dias, int duracaoMinutos, Long adminId) {
        LocalDate hoje = LocalDate.now();
        LocalDateTime periodoFim = hoje.plusDays(dias).atTime(23, 59);

        List<Reuniao> reunioes = reuniaoRepository
                .findByDataReuniaoBetweenOrderByDataReuniaoAsc(hoje.atStartOfDay(), periodoFim)
                .stream()
                .filter(r -> r.getEstado() == ReuniaoEstado.AGENDADA)
                .toList();

        Set<LocalDateTime> indisponivel = adminId != null
                ? indisponibilidadeRepository
                        .findByAdmin_IdAndDataHoraBetween(adminId, hoje.atStartOfDay(), periodoFim)
                        .stream().map(AdminIndisponibilidade::getDataHora).collect(Collectors.toSet())
                : Set.of();

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

                boolean adminIndisponivel = indisponivel.contains(inicio);

                slots.add(new SlotDisponivelResponse(inicio, fim, !ocupado && !adminIndisponivel));
                atual = atual.plusMinutes(duracaoMinutos);
            }
        }

        return slots;
    }

    public String criarEvento(Reuniao reuniao, User responsavel) {
        return null;
    }
}
