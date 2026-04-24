package pt.agencia.crm.dto.contacto;

import jakarta.validation.constraints.*;
import pt.agencia.crm.model.enums.ContactoEstado;
import pt.agencia.crm.model.enums.Setor;

public record ContactoRequest(

        @NotBlank(message = "Empresa é obrigatória")
        String empresa,

        Setor setor,

        String nomeDecisor,

        String cargo,

        String telefone,

        @Email(message = "Email inválido")
        String email,

        String linkedinUrl,

        ContactoEstado estado,

        @Min(value = 1, message = "Score mínimo é 1")
        @Max(value = 10, message = "Score máximo é 10")
        Integer scorePotencial,

        String notas
) {}
