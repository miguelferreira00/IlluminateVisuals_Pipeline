package pt.agencia.crm.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pt.agencia.crm.model.User;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndAtivoTrue(String email);

    List<User> findByAtivoTrue();
}
