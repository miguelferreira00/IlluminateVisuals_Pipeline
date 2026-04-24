package pt.agencia.crm.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import pt.agencia.crm.model.enums.ReuniaoEstado;

import java.time.LocalDateTime;

@Entity
@Table(name = "reunioes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reuniao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contacto_id", nullable = false)
    private Contacto contacto;

    @Column(name = "google_event_id", length = 200)
    private String googleEventId;

    @NotNull
    @Column(name = "data_reuniao", nullable = false)
    private LocalDateTime dataReuniao;

    @Column(name = "duracao_minutos", nullable = false)
    @Builder.Default
    private Integer duracaoMinutos = 30;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsavel_user_id")
    private User responsavel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private ReuniaoEstado estado = ReuniaoEstado.AGENDADA;

    @Column(columnDefinition = "TEXT")
    private String notas;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @PrePersist
    private void prePersist() {
        criadoEm = LocalDateTime.now();
    }
}
