package pt.agencia.crm.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pt.agencia.crm.model.Reuniao;
import pt.agencia.crm.model.enums.ReuniaoEstado;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ReuniaoRepository extends JpaRepository<Reuniao, Long> {

    List<Reuniao> findByEstadoOrderByDataReuniaoAsc(ReuniaoEstado estado);

    List<Reuniao> findByResponsavel_IdAndEstadoOrderByDataReuniaoAsc(Long responsavelId, ReuniaoEstado estado);

    List<Reuniao> findByDataReuniaoBetweenOrderByDataReuniaoAsc(LocalDateTime inicio, LocalDateTime fim);

    long countByEstadoAndDataReuniaoAfter(ReuniaoEstado estado, LocalDateTime depois);

    Optional<Reuniao> findByGoogleEventId(String googleEventId);
}
