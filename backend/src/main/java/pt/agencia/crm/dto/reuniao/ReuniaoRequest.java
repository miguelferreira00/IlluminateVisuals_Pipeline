package pt.agencia.crm.dto.reuniao;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record ReuniaoRequest(

        @NotNull(message = "Contacto é obrigatório")
        Long contactoId,

        @NotNull(message = "Data da reunião é obrigatória")
        LocalDateTime dataReuniao,

        Integer duracaoMinutos,

        Long responsavelUserId,

        String notas
) {}
