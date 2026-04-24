package pt.agencia.crm.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import pt.agencia.crm.model.enums.CallProximoPasso;
import pt.agencia.crm.model.enums.CallResultado;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "calls")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Call {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contacto_id", nullable = false)
    private Contacto contacto;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "caller_user_id", nullable = false)
    private User callerUser;

    @NotNull
    @Column(name = "data_call", nullable = false)
    private LocalDateTime dataCall;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CallResultado resultado;

    @Enumerated(EnumType.STRING)
    @Column(name = "proximo_passo", length = 20)
    @Builder.Default
    private CallProximoPasso proximoPasso = CallProximoPasso.NENHUM;

    @Column(name = "data_follow_up")
    private LocalDate dataFollowUp;

    @Column(columnDefinition = "TEXT")
    private String notas;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @PrePersist
    private void prePersist() {
        criadoEm = LocalDateTime.now();
    }
}
