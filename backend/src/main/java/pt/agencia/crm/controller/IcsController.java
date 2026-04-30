package pt.agencia.crm.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pt.agencia.crm.model.User;
import pt.agencia.crm.repository.UserRepository;
import pt.agencia.crm.service.CurrentUserService;

import java.util.Map;

@RestController
@RequestMapping("/api/ics")
@RequiredArgsConstructor
public class IcsController {

    private final CurrentUserService currentUserService;
    private final UserRepository     userRepository;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        User admin = currentUserService.getCurrentUser();
        boolean connected = admin.getIcsCalendarUrl() != null && !admin.getIcsCalendarUrl().isBlank();
        return ResponseEntity.ok(Map.of("connected", connected,
                "url", connected ? admin.getIcsCalendarUrl() : ""));
    }

    @PutMapping("/url")
    public ResponseEntity<Void> saveUrl(@RequestBody Map<String, String> body) {
        User admin = currentUserService.getCurrentUser();
        String url = body.getOrDefault("url", "").trim();
        admin.setIcsCalendarUrl(url.isBlank() ? null : url);
        userRepository.save(admin);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/url")
    public ResponseEntity<Void> removeUrl() {
        User admin = currentUserService.getCurrentUser();
        admin.setIcsCalendarUrl(null);
        userRepository.save(admin);
        return ResponseEntity.noContent().build();
    }
}
