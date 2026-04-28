package pt.agencia.crm.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import pt.agencia.crm.dto.user.ChangePasswordRequest;
import pt.agencia.crm.dto.user.CreateCallerRequest;
import pt.agencia.crm.dto.user.UserResumoResponse;
import pt.agencia.crm.mapper.UserMapper;
import pt.agencia.crm.model.User;
import pt.agencia.crm.model.enums.UserRole;
import pt.agencia.crm.repository.UserRepository;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/admins")
    public List<UserResumoResponse> admins() {
        return userRepository.findByAtivoTrue().stream()
                .filter(u -> u.getRole() == UserRole.ADMIN)
                .map(UserMapper::toResumo)
                .toList();
    }

    @GetMapping
    public List<UserResumoResponse> listar() {
        return userRepository.findAll().stream()
                .sorted(Comparator.comparing(User::getRole).thenComparing(User::getNome))
                .map(UserMapper::toResumo)
                .toList();
    }

    @PostMapping("/callers")
    public ResponseEntity<?> criarCaller(@Valid @RequestBody CreateCallerRequest req) {
        if (userRepository.findByUsernameAndAtivoTrue(req.username()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username já existe"));
        }
        String email = (req.email() != null && !req.email().isBlank())
                ? req.email()
                : req.username() + "@illuminatevisuals.pt";
        User user = User.builder()
                .nome(req.nome())
                .email(email)
                .username(req.username())
                .passwordHash(passwordEncoder.encode(req.password()))
                .role(UserRole.CALLER)
                .build();
        return ResponseEntity.ok(UserMapper.toResumo(userRepository.save(user)));
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<Void> alterarPassword(@PathVariable Long id,
                                                @Valid @RequestBody ChangePasswordRequest req) {
        User user = userRepository.findById(id).orElseThrow();
        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/desativar")
    public ResponseEntity<Void> desativar(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow();
        user.setAtivo(false);
        userRepository.save(user);
        return ResponseEntity.noContent().build();
    }
}
