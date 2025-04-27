package es.upm.dit.isst.ioh.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable() 
            .authorizeHttpRequests(authz -> authz
                .anyRequest().permitAll() 
            )
            .headers(headers -> headers.frameOptions().disable()); 
        return http.build();
    }
}