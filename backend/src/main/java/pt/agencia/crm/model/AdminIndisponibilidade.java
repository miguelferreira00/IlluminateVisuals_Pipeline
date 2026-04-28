package pt.agencia.crm.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_indisponibilidade",
       uniqueConstraints = @UniqueConstraint(columnNames = {"admin_user_id", "data_hora"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AdminIndisponibilidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_user_id", nullable = false)
    private User admin;

    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;
}
