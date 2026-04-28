package pt.agencia.crm.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pt.agencia.crm.model.AdminIndisponibilidade;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface IndisponibilidadeRepository extends JpaRepository<AdminIndisponibilidade, Long> {

    List<AdminIndisponibilidade> findByAdmin_IdAndDataHoraBetween(Long adminId, LocalDateTime inicio, LocalDateTime fim);

    Optional<AdminIndisponibilidade> findByAdmin_IdAndDataHora(Long adminId, LocalDateTime dataHora);
}
