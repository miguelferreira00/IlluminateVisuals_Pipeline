package pt.agencia.crm.mapper;

import pt.agencia.crm.dto.user.UserResumoResponse;
import pt.agencia.crm.model.User;

public class UserMapper {

    private UserMapper() {}

    public static UserResumoResponse toResumo(User user) {
        if (user == null) return null;
        return new UserResumoResponse(user.getId(), user.getNome(), user.getEmail(), user.getRole());
    }
}
