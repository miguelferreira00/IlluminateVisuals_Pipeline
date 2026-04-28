package pt.agencia.crm.dto.reuniao;

import pt.agencia.crm.dto.contacto.ContactoResumoResponse;
import pt.agencia.crm.dto.user.UserResumoResponse;
import pt.agencia.crm.model.enums.ReuniaoEstado;

import java.time.LocalDateTime;

public record ReuniaoResponse(
        Long id,
        ContactoResumoResponse contacto,
        String googleEventId,
        LocalDateTime dataReuniao,
        Integer duracaoMinutos,
        UserResumoResponse responsavel,
        UserResumoResponse criadoPor,
        ReuniaoEstado estado,
        String notas,
        LocalDateTime criadoEm
) {}
