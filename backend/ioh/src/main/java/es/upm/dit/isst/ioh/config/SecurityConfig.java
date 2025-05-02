package es.upm.dit.isst.ioh.config;

import javax.sql.DataSource;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.JdbcUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(auth -> {
            auth.requestMatchers("/**").permitAll(); // ultima linea, añadir todas las restricciones antes
        })
                .csrf(csrf -> csrf.ignoringRequestMatchers("/**")) // Disable CSRF (unneeded for REST API)
                .headers(headers -> headers.frameOptions().sameOrigin()); // Allow frames for H2 console
        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService(DataSource dataSource) {
        JdbcUserDetailsManager userDetailsManager = new JdbcUserDetailsManager(dataSource);
        // Query to fetch user credentials
        userDetailsManager.setUsersByUsernameQuery(
                "SELECT username, password, enabled FROM USUARIO WHERE username = ?");
        // Query to fetch user roles
        userDetailsManager.setAuthoritiesByUsernameQuery(
                "SELECT username, authority AS authority FROM USUARIO WHERE username = ?");
        return userDetailsManager;
    }
}