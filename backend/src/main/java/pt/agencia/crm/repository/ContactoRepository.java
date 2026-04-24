package pt.agencia.crm.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import pt.agencia.crm.model.Contacto;
import pt.agencia.crm.model.enums.ContactoEstado;

import java.util.List;

public interface ContactoRepository extends JpaRepository<Contacto, Long>,
                                             JpaSpecificationExecutor<Contacto> {

    List<Contacto> findByEstado(ContactoEstado estado);

    long countByEstado(ContactoEstado estado);
}
