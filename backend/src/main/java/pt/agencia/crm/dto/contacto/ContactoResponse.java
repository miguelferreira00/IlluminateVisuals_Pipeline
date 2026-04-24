package pt.agencia.crm.dto.contacto;

import pt.agencia.crm.model.enums.ContactoEstado;
import pt.agencia.crm.model.enums.Setor;

import java.time.LocalDateTime;

public record ContactoResponse(
        Long id,
        String empresa,
        Setor setor,
        String nomeDecisor,
        String cargo,
        String telefone,
        String email,
        String linkedinUrl,
        ContactoEstado estado,
        Integer scorePotencial,
        String notas,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
) {}
