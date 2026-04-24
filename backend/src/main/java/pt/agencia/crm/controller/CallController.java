package pt.agencia.crm.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pt.agencia.crm.dto.call.CallRequest;
import pt.agencia.crm.dto.call.CallResponse;
import pt.agencia.crm.service.CallService;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CallController {

    private final CallService callService;

    // POST /api/calls
    @PostMapping("/api/calls")
    public ResponseEntity<CallResponse> registar(@Valid @RequestBody CallRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(callService.registar(request));
    }

    // GET /api/contactos/1/calls
    @GetMapping("/api/contactos/{id}/calls")
    public List<CallResponse> buscarPorContacto(@PathVariable Long id) {
        return callService.buscarPorContacto(id);
    }
}
