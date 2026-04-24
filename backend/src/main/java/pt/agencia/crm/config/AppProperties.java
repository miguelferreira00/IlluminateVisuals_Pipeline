package pt.agencia.crm.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private Admin admin = new Admin();

    @Getter
    @Setter
    public static class Admin {
        private String password;
    }
}
