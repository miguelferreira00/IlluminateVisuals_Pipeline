package pt.agencia.crm.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pt.agencia.crm.model.Call;
import pt.agencia.crm.model.enums.CallProximoPasso;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface CallRepository extends JpaRepository<Call, Long> {

    List<Call> findByContactoIdOrderByDataCallDesc(Long contactoId);

    List<Call> findByDataCallBetween(LocalDateTime inicio, LocalDateTime fim);

    long countByDataCallBetween(LocalDateTime inicio, LocalDateTime fim);

    @Query("SELECT c FROM Call c WHERE c.dataFollowUp < :hoje AND c.proximoPasso <> :nenhum")
    List<Call> findFollowUpsVencidos(@Param("hoje") LocalDate hoje,
                                     @Param("nenhum") CallProximoPasso nenhum);

    @Query("SELECT c FROM Call c WHERE c.dataFollowUp BETWEEN :inicio AND :fim AND c.proximoPasso <> :nenhum")
    List<Call> findFollowUpsNoPeriodo(@Param("inicio") LocalDate inicio,
                                      @Param("fim") LocalDate fim,
                                      @Param("nenhum") CallProximoPasso nenhum);
}
