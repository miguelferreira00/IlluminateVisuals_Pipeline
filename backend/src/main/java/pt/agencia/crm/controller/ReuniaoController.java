package pt.agencia.crm.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pt.agencia.crm.dto.reuniao.ReuniaoRequest;
import pt.agencia.crm.dto.reuniao.ReuniaoResponse;
import pt.agencia.crm.service.ReuniaoService;

import java.util.List;

@RestController
@RequestMapping("/api/reunioes")
@RequiredArgsConstructor
public class ReuniaoController {

    private final ReuniaoService reuniaoService;

    @PostMapping
    public ResponseEntity<ReuniaoResponse> criar(@Valid @RequestBody ReuniaoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reuniaoService.criar(request));
    }

    @GetMapping
    public List<ReuniaoResponse> listar() {
        return reuniaoService.listar();
    }
}
