package pt.agencia.crm.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pt.agencia.crm.dto.reuniao.ReuniaoRequest;
import pt.agencia.crm.dto.reuniao.ReuniaoResponse;
import pt.agencia.crm.service.CurrentUserService;
import pt.agencia.crm.service.ReuniaoService;

import java.util.List;

@RestController
@RequestMapping("/api/reunioes")
@RequiredArgsConstructor
public class ReuniaoController {

    private final ReuniaoService reuniaoService;
    private final CurrentUserService currentUserService;

    @PostMapping
    public ResponseEntity<ReuniaoResponse> criar(@Valid @RequestBody ReuniaoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reuniaoService.criar(request));
    }

    // Todas as reuniões agendadas (usado na agenda/callers)
    @GetMapping
    public List<ReuniaoResponse> listar() {
        return reuniaoService.listar();
    }

    // Reuniões do admin autenticado (para o dashboard de cada admin)
    @GetMapping("/minhas")
    public List<ReuniaoResponse> minhas() {
        Long userId = currentUserService.getCurrentUser().getId();
        return reuniaoService.listarMinhas(userId);
    }
}
