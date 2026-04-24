package pt.agencia.crm.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pt.agencia.crm.dto.user.UserResumoResponse;
import pt.agencia.crm.mapper.UserMapper;
import pt.agencia.crm.service.CurrentUserService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final CurrentUserService currentUserService;

    // Chamado pelo Angular após login para obter role e dados do utilizador
    @GetMapping("/me")
    public UserResumoResponse me() {
        return UserMapper.toResumo(currentUserService.getCurrentUser());
    }
}
