package pt.agencia.crm.dto.user;

import jakarta.validation.constraints.NotBlank;

public record CreateCallerRequest(
        @NotBlank String nome,
        @NotBlank String username,
        @NotBlank String password,
        String email
) {}
