package pt.agencia.crm.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pt.agencia.crm.model.AdminIndisponibilidade;
import pt.agencia.crm.model.User;
import pt.agencia.crm.repository.IndisponibilidadeRepository;
import pt.agencia.crm.service.CurrentUserService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/disponibilidade")
@RequiredArgsConstructor
public class IndisponibilidadeController {

    private final IndisponibilidadeRepository repo;
    private final CurrentUserService currentUserService;

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
