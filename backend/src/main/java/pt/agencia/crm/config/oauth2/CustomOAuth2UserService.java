package pt.agencia.crm.config.oauth2;

import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import pt.agencia.crm.model.User;
import pt.agencia.crm.model.enums.UserRole;
import pt.agencia.crm.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) throws OAuth2AuthenticationException {
        OAuth2User oauthUser = new DefaultOAuth2UserService().loadUser(request);

        String email = oauthUser.getAttribute("email");
        String nome = oauthUser.getAttribute("name");

        // Regista o utilizador na primeira vez que faz login
        userRepository.findByEmail(email).orElseGet(() -> {
            User novo = User.builder()
                    .email(email)
                    .nome(nome)
                    .role(UserRole.CALLER)
                    .ativo(true)
                    .build();
            return userRepository.save(novo);
        });

        return oauthUser;
    }
}
