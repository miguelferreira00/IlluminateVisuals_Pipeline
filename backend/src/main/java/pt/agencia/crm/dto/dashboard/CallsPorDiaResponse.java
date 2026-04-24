package pt.agencia.crm.dto.dashboard;

import java.time.LocalDate;

public record CallsPorDiaResponse(LocalDate data, long total) {}
