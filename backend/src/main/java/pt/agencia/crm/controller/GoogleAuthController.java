package pt.agencia.crm.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.web.servlet.view.RedirectView;
import pt.agencia.crm.config.GoogleCalendarConfig;
import pt.agencia.crm.model.User;
import pt.agencia.crm.repository.UserRepository;
import pt.agencia.crm.service.CurrentUserService;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/google")
@RequiredArgsConstructor
public class GoogleAuthController {

    private static final String SCOPE = "https://www.googleapis.com/auth/calendar.readonly";

    private final GoogleCalendarConfig googleConfig;
    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    // Inicia o fluxo OAuth2 — redireciona para o Google
    @GetMapping("/authorize")
    public RedirectView authorize(HttpSession session) {
        User admin = currentUserService.getCurrentUser();
        String state = UUID.randomUUID().toString();
        session.setAttribute("google_state", state);
        session.setAttribute("google_admin_id", admin.getId());

        String url = "https://accounts.google.com/o/oauth2/v2/auth"
            + "?client_id=" + encode(googleConfig.getClientId())
            + "&redirect_uri=" + encode(googleConfig.getRedirectUri())
            + "&response_type=code"
            + "&scope=" + encode(SCOPE)
            + "&access_type=offline"
            + "&prompt=consent"
            + "&state=" + state;

        return new RedirectView(url);
    }

    // Callback do Google após autorização
    @GetMapping("/callback")
    public RedirectView callback(@RequestParam(required = false) String code,
                                 @RequestParam(required = false) String state,
                                 @RequestParam(required = false) String error,
                                 HttpSession session) {
        String frontendAgenda = googleConfig.getFrontendUrl() + "/agenda";

        if (error != null || code == null) {
            return new RedirectView(frontendAgenda + "?google_error=cancelled");
        }

        String savedState = (String) session.getAttribute("google_state");
        Long adminId     = (Long)   session.getAttribute("google_admin_id");

        if (savedState == null || !savedState.equals(state) || adminId == null) {
            return new RedirectView(frontendAgenda + "?google_error=invalid_state");
        }

        try {
            String tokenJson = RestClient.create()
                .post()
                .uri("https://oauth2.googleapis.com/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body("code=" + encode(code)
                    + "&client_id=" + encode(googleConfig.getClientId())
                    + "&client_secret=" + encode(googleConfig.getClientSecret())
                    + "&redirect_uri=" + encode(googleConfig.getRedirectUri())
                    + "&grant_type=authorization_code")
                .retrieve()
                .body(String.class);

            JsonNode json = objectMapper.readTree(tokenJson);
            String refreshToken = json.path("refresh_token").asText(null);

            if (refreshToken == null || refreshToken.isBlank()) {
                return new RedirectView(frontendAgenda + "?google_error=no_refresh_token");
            }

            User user = userRepository.findById(adminId).orElseThrow();
            user.setGoogleCalendarToken(refreshToken);
            userRepository.save(user);

            session.removeAttribute("google_state");
            session.removeAttribute("google_admin_id");

            return new RedirectView(frontendAgenda + "?google_connected=true");

        } catch (Exception e) {
            return new RedirectView(frontendAgenda + "?google_error=token_exchange");
        }
    }

    // Status da ligação do admin atual
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        User admin = currentUserService.getCurrentUser();
        boolean connected = admin.getGoogleCalendarToken() != null
                         && !admin.getGoogleCalendarToken().isBlank();
        return ResponseEntity.ok(Map.of(
            "connected", connected,
            "configured", googleConfig.isConfigured()
        ));
    }

    // Desligar conta Google
    @DeleteMapping("/disconnect")
    public ResponseEntity<Void> disconnect() {
        User admin = currentUserService.getCurrentUser();
        admin.setGoogleCalendarToken(null);
        userRepository.save(admin);
        return ResponseEntity.noContent().build();
    }

    private String encode(String value) {
        return value == null ? "" : URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
