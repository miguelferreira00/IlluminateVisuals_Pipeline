package pt.agencia.crm.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pt.agencia.crm.model.Call;

import java.time.LocalDateTime;
import java.util.List;

public interface CallRepository extends JpaRepository<Call, Long> {

    List<Call> findByContactoIdOrderByDataCallDesc(Long contactoId);

    List<Call> findByDataCallBetween(LocalDateTime inicio, LocalDateTime fim);

    long countByDataCallBetween(LocalDateTime inicio, LocalDateTime fim);
}
