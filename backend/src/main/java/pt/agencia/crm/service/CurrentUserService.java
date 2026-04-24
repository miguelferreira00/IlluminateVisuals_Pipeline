package pt.agencia.crm.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import pt.agencia.crm.exception.ResourceNotFoundException;
import pt.agencia.crm.model.User;
import pt.agencia.crm.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new IllegalStateException("Utilizador não autenticado");
        }
        // O principal é o email do utilizador, guardado no login
        String email = auth.getName();
        return userRepository.findByEmailAndAtivoTrue(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilizador não encontrado: " + email));
    }
}
