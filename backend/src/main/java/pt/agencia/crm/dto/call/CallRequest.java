package pt.agencia.crm.dto.call;

import jakarta.validation.constraints.NotNull;
import pt.agencia.crm.model.enums.CallProximoPasso;
import pt.agencia.crm.model.enums.CallResultado;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record CallRequest(

        @NotNull(message = "Contacto é obrigatório")
        Long contactoId,

        @NotNull(message = "Data da call é obrigatória")
        LocalDateTime dataCall,

        @NotNull(message = "Resultado é obrigatório")
        CallResultado resultado,

        CallProximoPasso proximoPasso,

        LocalDate dataFollowUp,

        String notas
) {}
