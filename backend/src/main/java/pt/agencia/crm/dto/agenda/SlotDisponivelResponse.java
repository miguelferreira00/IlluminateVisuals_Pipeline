package pt.agencia.crm.dto.agenda;

import java.time.LocalDateTime;

public record SlotDisponivelResponse(
        LocalDateTime inicio,
        LocalDateTime fim,
        boolean livre
) {}
