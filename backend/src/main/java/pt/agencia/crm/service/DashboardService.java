package pt.agencia.crm.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.agencia.crm.dto.dashboard.CallsPorDiaResponse;
import pt.agencia.crm.dto.dashboard.DashboardKpisResponse;
import pt.agencia.crm.dto.dashboard.SetorScoreResponse;
import pt.agencia.crm.model.Call;
import pt.agencia.crm.model.enums.CallProximoPasso;
import pt.agencia.crm.model.enums.ReuniaoEstado;
import pt.agencia.crm.repository.CallRepository;
import pt.agencia.crm.repository.ContactoRepository;
import pt.agencia.crm.repository.ReuniaoRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final ContactoRepository contactoRepository;
    private final CallRepository callRepository;
    private final ReuniaoRepository reuniaoRepository;

    public DashboardKpisResponse kpis() {
        LocalDate hoje = LocalDate.now();
        LocalDateTime inicioDaSemana = hoje.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY)).atStartOfDay();
        LocalDateTime fimDaSemana = inicioDaSemana.plusDays(7);

        long totalContactos = contactoRepository.count();

        long reunioesSemana = reuniaoRepository.countByEstadoAndDataReuniaoAfter(ReuniaoEstado.AGENDADA, inicioDaSemana);
        long reunioesTotal = reuniaoRepository.countByEstadoAndDataReuniaoAfter(ReuniaoEstado.AGENDADA, LocalDateTime.of(2000, 1, 1, 0, 0));

        long totalCalls = callRepository.count();
        long callsReuniao = callRepository.findAll().stream()
                .filter(c -> c.getResultado().name().equals("REUNIAO_MARCADA")).count();
        double taxaConversao = totalCalls > 0 ? (double) callsReuniao / totalCalls * 100 : 0.0;

        long followUpsVencidos = callRepository.findFollowUpsVencidos(hoje, CallProximoPasso.NENHUM).size();
        long followUpsSemana = callRepository.findFollowUpsNoPeriodo(hoje, hoje.plusDays(7), CallProximoPasso.NENHUM).size();

        Map<String, Long> porEstado = new LinkedHashMap<>();
        contactoRepository.countGroupedByEstado()
                .forEach(row -> porEstado.put(row[0].toString(), (Long) row[1]));

        List<SetorScoreResponse> topSetores = contactoRepository.findSetoresByScoreMedioDesc().stream()
                .limit(5)
                .map(row -> new SetorScoreResponse(row[0].toString(), ((Double) row[1])))
                .toList();

        return new DashboardKpisResponse(
                totalContactos, reunioesSemana, reunioesTotal,
                taxaConversao, followUpsVencidos, followUpsSemana,
                porEstado, topSetores
        );
    }

    public List<CallsPorDiaResponse> callsPorDia() {
        LocalDateTime inicio = LocalDate.now().minusDays(30).atStartOfDay();
        LocalDateTime fim = LocalDateTime.now();

        Map<LocalDate, Long> agrupado = callRepository.findByDataCallBetween(inicio, fim).stream()
                .collect(Collectors.groupingBy(c -> c.getDataCall().toLocalDate(), Collectors.counting()));

        return agrupado.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> new CallsPorDiaResponse(e.getKey(), e.getValue()))
                .toList();
    }
}
