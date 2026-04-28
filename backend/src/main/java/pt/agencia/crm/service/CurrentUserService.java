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
        String name = auth.getName();
        try {
            Long userId = Long.parseLong(name);
            return userRepository.findById(userId)
                    .filter(User::getAtivo)
                    .orElseThrow(() -> new ResourceNotFoundException("Utilizador", userId));
        } catch (NumberFormatException e) {
            return userRepository.findByEmailAndAtivoTrue(name)
                    .orElseThrow(() -> new ResourceNotFoundException("Utilizador não encontrado: " + name));
        }
    }
}
