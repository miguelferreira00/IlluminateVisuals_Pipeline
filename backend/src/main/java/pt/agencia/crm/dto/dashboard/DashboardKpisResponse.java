package pt.agencia.crm.dto.dashboard;

import java.util.List;
import java.util.Map;

public record DashboardKpisResponse(
        long totalContactos,
        long reunioesSemanaAtual,
        long reunioesTotal,
        double taxaConversao,
        long followUpsPendentesVencidos,
        long followUpsSemanaAtual,
        Map<String, Long> contactosPorEstado,
        List<SetorScoreResponse> topSetores
) {}
