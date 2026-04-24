package pt.agencia.crm.config.oauth2;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import pt.agencia.crm.repository.UserRepository;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final OAuth2AuthorizedClientService authorizedClientService;
    private final UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
        OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient(
                token.getAuthorizedClientRegistrationId(), token.getName());

        // Guarda o refresh token para uso posterior na Google Calendar API
        if (client.getRefreshToken() != null) {
            String email = token.getPrincipal().getAttribute("email");
            String refreshToken = client.getRefreshToken().getTokenValue();
            userRepository.findByEmail(email).ifPresent(user -> {
                user.setGoogleCalendarToken(refreshToken);
                userRepository.save(user);
                log.info("Refresh token guardado para utilizador: {}", email);
            });
        }

        getRedirectStrategy().sendRedirect(request, response, "http://localhost:4200/pipeline");
    }
}
