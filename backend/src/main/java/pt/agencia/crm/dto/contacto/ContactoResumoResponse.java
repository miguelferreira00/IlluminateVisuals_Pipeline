package pt.agencia.crm.dto.contacto;

import pt.agencia.crm.model.enums.ContactoEstado;
import pt.agencia.crm.model.enums.Setor;

import java.time.LocalDateTime;

public record ContactoResumoResponse(
        Long id,
        String empresa,
        Setor setor,
        String nomeDecisor,
        String cargo,
        String telefone,
        ContactoEstado estado,
        Integer scorePotencial,
        LocalDateTime atualizadoEm
) {}
