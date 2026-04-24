package pt.agencia.crm.dto.user;

import pt.agencia.crm.model.enums.UserRole;

public record UserResumoResponse(
        Long id,
        String nome,
        String email,
        UserRole role
) {}
