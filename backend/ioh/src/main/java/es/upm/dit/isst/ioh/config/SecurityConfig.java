package es.upm.dit.isst.ioh.config;

import javax.sql.DataSource;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.JdbcUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(auth -> {
            auth.requestMatchers("/h2-console").hasRole("ADMIN"); // Solo el admin puede acceder a la consola H2
            auth.requestMatchers("/h2-console/**").hasRole("ADMIN"); // Subrutas de la consola H2
            auth.requestMatchers("/**").permitAll(); // Ultima linea, añadir todas las restricciones antes
        })
                .csrf(csrf -> csrf.ignoringRequestMatchers("/**")) // Disable CSRF (for H2 console)
                .headers(headers -> headers.frameOptions().sameOrigin()) // Allow frames for H2 console
                .formLogin(Customizer.withDefaults())
                .logout(logout -> logout.logoutRequestMatcher(new AntPathRequestMatcher("/logout")));
        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService(DataSource dataSource) {
        JdbcUserDetailsManager userDetailsManager = new JdbcUserDetailsManager(dataSource);
        // Query to fetch user credentials
        userDetailsManager.setUsersByUsernameQuery(
                "SELECT email, contrasena, enabled FROM USUARIO WHERE email = ?");
        // Query to fetch user roles
        userDetailsManager.setAuthoritiesByUsernameQuery(
                "SELECT email, authority AS authority FROM USUARIO WHERE email = ?");
        return userDetailsManager;
    }
}