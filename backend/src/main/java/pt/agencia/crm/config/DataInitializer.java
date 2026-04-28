package pt.agencia.crm.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import pt.agencia.crm.model.User;
import pt.agencia.crm.model.enums.UserRole;
import pt.agencia.crm.repository.UserRepository;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        // Admins — login sem username, password individual
        createAdminIfAbsent("Miguel", "miguel@illuminatevisuals.pt", "miguel");
        createAdminIfAbsent("Jesus",  "jesus@illuminatevisuals.pt",  "jesus");
        createAdminIfAbsent("Luis",   "luis@illuminatevisuals.pt",   "luis");

        // Callers — login com username + password
        createCallerIfAbsent("caller", "11022005", "Caller", null);
    }

    private void createAdminIfAbsent(String nome, String email, String password) {
        if (userRepository.findByEmail(email).isPresent()) return;
        userRepository.save(User.builder()
                .nome(nome)
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .role(UserRole.ADMIN)
                .build());
        log.info("Admin '{}' criado.", nome);
    }

    private void createCallerIfAbsent(String username, String password, String nome, String email) {
        if (userRepository.findByUsernameAndAtivoTrue(username).isPresent()) return;
        userRepository.save(User.builder()
                .nome(nome)
                .email(email) // pode ser null
                .username(username)
                .passwordHash(passwordEncoder.encode(password))
                .role(UserRole.CALLER)
                .build());
        log.info("Caller '{}' criado.", username);
    }
}
