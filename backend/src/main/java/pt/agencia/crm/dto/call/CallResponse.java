package pt.agencia.crm.dto.call;

import pt.agencia.crm.dto.contacto.ContactoResumoResponse;
import pt.agencia.crm.dto.user.UserResumoResponse;
import pt.agencia.crm.model.enums.CallProximoPasso;
import pt.agencia.crm.model.enums.CallResultado;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record CallResponse(
        Long id,
        ContactoResumoResponse contacto,
        UserResumoResponse callerUser,
        LocalDateTime dataCall,
        CallResultado resultado,
        CallProximoPasso proximoPasso,
        LocalDate dataFollowUp,
        String notas,
        LocalDateTime criadoEm
) {}
