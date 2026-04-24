package pt.agencia.crm.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import pt.agencia.crm.model.enums.ContactoEstado;
import pt.agencia.crm.model.enums.Setor;

import java.time.LocalDateTime;

@Entity
@Table(name = "contactos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contacto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 200)
    private String empresa;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Setor setor = Setor.OUTRO;

    @Column(name = "nome_decisor", length = 150)
    private String nomeDecisor;

    @Column(length = 100)
    private String cargo;

    @Column(length = 30)
    private String telefone;

    @Email
    @Column(length = 150)
    private String email;

    @Column(name = "linkedin_url", length = 300)
    private String linkedinUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ContactoEstado estado = ContactoEstado.NOVO;

    @Min(1) @Max(10)
    @Column(name = "score_potencial", nullable = false)
    @Builder.Default
    private Integer scorePotencial = 5;

    @Column(columnDefinition = "TEXT")
    private String notas;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm;

    @PrePersist
    private void prePersist() {
        criadoEm = LocalDateTime.now();
        atualizadoEm = LocalDateTime.now();
    }

    @PreUpdate
    private void preUpdate() {
        atualizadoEm = LocalDateTime.now();
    }
}
