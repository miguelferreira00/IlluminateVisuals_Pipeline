package pt.agencia.crm.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import pt.agencia.crm.model.Contacto;
import pt.agencia.crm.model.enums.ContactoEstado;

import java.util.List;

public interface ContactoRepository extends JpaRepository<Contacto, Long>,
                                             JpaSpecificationExecutor<Contacto> {

    List<Contacto> findByEstado(ContactoEstado estado);

    long countByEstado(ContactoEstado estado);

    @Query("SELECT c.estado, COUNT(c) FROM Contacto c GROUP BY c.estado")
    List<Object[]> countGroupedByEstado();

    @Query("SELECT c.setor, AVG(c.scorePotencial) FROM Contacto c GROUP BY c.setor ORDER BY AVG(c.scorePotencial) DESC")
    List<Object[]> findSetoresByScoreMedioDesc();
}
