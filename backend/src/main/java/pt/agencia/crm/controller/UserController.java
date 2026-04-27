package pt.agencia.crm.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pt.agencia.crm.dto.user.UserResumoResponse;
import pt.agencia.crm.mapper.UserMapper;
import pt.agencia.crm.model.enums.UserRole;
import pt.agencia.crm.repository.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    // GET /api/users/admins — lista os admins ativos (para o dropdown de responsável)
    @GetMapping("/admins")
    public List<UserResumoResponse> admins() {
        return userRepository.findByAtivoTrue().stream()
                .filter(u -> u.getRole() == UserRole.ADMIN)
                .map(UserMapper::toResumo)
                .toList();
    }
}
