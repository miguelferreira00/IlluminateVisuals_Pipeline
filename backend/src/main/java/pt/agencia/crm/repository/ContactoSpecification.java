package pt.agencia.crm.repository;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import pt.agencia.crm.model.Contacto;
import pt.agencia.crm.model.enums.ContactoEstado;
import pt.agencia.crm.model.enums.Setor;

import java.util.ArrayList;
import java.util.List;

public class ContactoSpecification {

    private ContactoSpecification() {}

    public static Specification<Contacto> filtrar(ContactoEstado estado, Setor setor, String search) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (estado != null) {
                predicates.add(cb.equal(root.get("estado"), estado));
            }

            if (setor != null) {
                predicates.add(cb.equal(root.get("setor"), setor));
            }

            if (search != null && !search.isBlank()) {
                String like = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("empresa")),    like),
                    cb.like(cb.lower(root.get("nomeDecisor")), like),
                    cb.like(cb.lower(root.get("cargo")),       like)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
