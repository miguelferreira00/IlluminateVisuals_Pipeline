package pt.agencia.crm.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;
import pt.agencia.crm.config.AppProperties;
import pt.agencia.crm.dto.auth.LoginRequest;
import pt.agencia.crm.dto.user.UserResumoResponse;
import pt.agencia.crm.exception.ResourceNotFoundException;
import pt.agencia.crm.mapper.UserMapper;
import pt.agencia.crm.model.User;
import pt.agencia.crm.model.enums.UserRole;
import pt.agencia.crm.repository.UserRepository;
import pt.agencia.crm.service.CurrentUserService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final AppProperties appProperties;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request,
                                   HttpServletRequest httpRequest) {

        // ADMIN exige password
        if (request.role() == UserRole.ADMIN) {
            if (request.password() == null || !request.password().equals(appProperties.getAdmin().getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Palavra-passe incorreta"));
            }
        }

        // Vai buscar o primeiro utilizador ativo com o role pedido
        User user = userRepository.findByAtivoTrue().stream()
                .filter(u -> u.getRole() == request.role())
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Nenhum utilizador ativo encontrado com role: " + request.role()));

        // Cria a autenticação e guarda na sessão
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                user.getEmail(), null,
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);

        HttpSession session = httpRequest.getSession(true);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

        return ResponseEntity.ok(UserMapper.toResumo(user));
    }

    @GetMapping("/me")
    public UserResumoResponse me() {
        return UserMapper.toResumo(currentUserService.getCurrentUser());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
        SecurityContextHolder.clearContext();
        return ResponseEntity.noContent().build();
    }
}
