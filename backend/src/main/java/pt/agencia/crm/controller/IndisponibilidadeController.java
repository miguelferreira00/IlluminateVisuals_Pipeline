package pt.agencia.crm.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pt.agencia.crm.model.AdminIndisponibilidade;
import pt.agencia.crm.model.User;
import pt.agencia.crm.model.enums.UserRole;
import pt.agencia.crm.repository.IndisponibilidadeRepository;
import pt.agencia.crm.repository.UserRepository;
import pt.agencia.crm.service.CurrentUserService;
import pt.agencia.crm.service.GoogleCalendarService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/disponibilidade")
@RequiredArgsConstructor
public class IndisponibilidadeController {

    private final IndisponibilidadeRepository repo;
    private final UserRepository              userRepository;
    private final CurrentUserService          currentUserService;
    private final GoogleCalendarService       googleCalendarService;

    // Indisponibilidade de um admin específico (para o When2Meet do próprio admin)
    @GetMapping
    public List<String> get(
            @RequestParam Long adminId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim
    ) {
        return repo.findByAdmin_IdAndDataHoraBetween(
                adminId, dataInicio.atStartOfDay(), dataFim.atTime(23, 59))
                .stream()
                .map(i -> i.getDataHora().toString())
                .toList();
    }

    // Indisponibilidade de TODOS os admins — When2Meet + Google Calendar
    @GetMapping("/todos")
    public Map<String, List<Map<String, Object>>> todos(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim
    ) {
        Map<String, List<Map<String, Object>>> result = new HashMap<>();

        // 1. When2Meet manual
        repo.findByDataHoraBetween(dataInicio.atStartOfDay(), dataFim.atTime(23, 59))
            .forEach(i -> {
                String key = i.getDataHora().toString().substring(0, 16);
                result.computeIfAbsent(key, k -> new ArrayList<>())
                      .add(Map.of("id", i.getAdmin().getId(), "nome", i.getAdmin().getNome()));
            });

        // 2. Google Calendar para cada admin ligado
        userRepository.findByAtivoTrue().stream()
            .filter(u -> u.getRole() == UserRole.ADMIN)
            .filter(u -> u.getGoogleCalendarToken() != null && !u.getGoogleCalendarToken().isBlank())
            .forEach(admin -> {
                try {
                    googleCalendarService.fetchGoogleBusySlots(admin, dataInicio, dataFim, 30)
                        .forEach(slot -> {
                            String key = slot.toString().substring(0, 16);
                            List<Map<String, Object>> lista = result.computeIfAbsent(key, k -> new ArrayList<>());
                            // Evitar duplicados (admin já pode estar no When2Meet para este slot)
                            boolean jaExiste = lista.stream()
                                .anyMatch(m -> Objects.equals(m.get("id"), admin.getId()));
                            if (!jaExiste) {
                                lista.add(Map.of("id", admin.getId(), "nome", admin.getNome()));
                            }
                        });
                } catch (Exception e) {
                    // falha silenciosa — Google Calendar indisponível para este admin
                }
            });

        return result;
    }

    @PostMapping("/toggle")
    public ResponseEntity<Void> toggle(@RequestBody Map<String, String> body) {
        User admin = currentUserService.getCurrentUser();
        LocalDateTime dataHora = LocalDateTime.parse(body.get("dataHora"));
        repo.findByAdmin_IdAndDataHora(admin.getId(), dataHora)
                .ifPresentOrElse(
                        repo::delete,
                        () -> repo.save(AdminIndisponibilidade.builder().admin(admin).dataHora(dataHora).build())
                );
        return ResponseEntity.noContent().build();
    }
}
