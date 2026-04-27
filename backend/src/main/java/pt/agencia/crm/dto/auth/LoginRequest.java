package pt.agencia.crm.dto.auth;

import jakarta.validation.constraints.NotNull;
import pt.agencia.crm.model.enums.UserRole;

public record LoginRequest(

        @NotNull(message = "Role é obrigatório")
        UserRole role,

        String username,

        String password
) {}
