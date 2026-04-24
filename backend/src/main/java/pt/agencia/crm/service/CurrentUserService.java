package pt.agencia.crm.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
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
        if (!(auth instanceof OAuth2AuthenticationToken oauthToken)) {
            throw new IllegalStateException("Utilizador não autenticado via OAuth2");
        }
        String email = oauthToken.getPrincipal().getAttribute("email");
        return userRepository.findByEmailAndAtivoTrue(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilizador não encontrado: " + email));
    }
}
