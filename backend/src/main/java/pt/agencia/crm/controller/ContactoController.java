package pt.agencia.crm.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pt.agencia.crm.dto.contacto.ContactoRequest;
import pt.agencia.crm.dto.contacto.ContactoResponse;
import pt.agencia.crm.dto.contacto.ContactoResumoResponse;
import pt.agencia.crm.model.enums.ContactoEstado;
import pt.agencia.crm.model.enums.Setor;
import pt.agencia.crm.service.ContactoService;

@RestController
@RequestMapping("/api/contactos")
@RequiredArgsConstructor
public class ContactoController {

    private final ContactoService contactoService;

    // GET /api/contactos?estado=NOVO&setor=TECNOLOGIA&search=nos&page=0&size=20&sort=atualizadoEm,desc
    @GetMapping
    public Page<ContactoResumoResponse> listar(
            @RequestParam(required = false) ContactoEstado estado,
            @RequestParam(required = false) Setor setor,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "atualizadoEm") Pageable pageable
    ) {
        return contactoService.listar(estado, setor, search, pageable);
    }

    // GET /api/contactos/1
    @GetMapping("/{id}")
    public ContactoResponse buscarPorId(@PathVariable Long id) {
        return contactoService.buscarPorId(id);
    }

    // POST /api/contactos
    @PostMapping
    public ResponseEntity<ContactoResponse> criar(@Valid @RequestBody ContactoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(contactoService.criar(request));
    }

    // PUT /api/contactos/1
    @PutMapping("/{id}")
    public ContactoResponse atualizar(@PathVariable Long id, @Valid @RequestBody ContactoRequest request) {
        return contactoService.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        contactoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
