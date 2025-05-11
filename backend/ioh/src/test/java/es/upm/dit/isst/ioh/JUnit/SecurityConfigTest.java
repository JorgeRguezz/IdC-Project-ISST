package es.upm.dit.isst.ioh.JUnit;

import static org.assertj.core.api.Assertions.assertThat;

import javax.sql.DataSource;
import es.upm.dit.isst.ioh.config.SecurityConfig;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.SecurityFilterChain;

@SpringBootTest
public class SecurityConfigTest {

    @Autowired
    private SecurityConfig securityConfig;

    @Autowired
    private DataSource dataSource;

    // Test that the SecurityFilterChain bean is created successfully
    @Test
    public void testSecurityFilterChainBean() throws Exception {
        SecurityFilterChain filterChain = securityConfig.filterChain(null);
        assertThat(filterChain).isNotNull();
    }

    // Test that the UserDetailsService bean is created successfully
    @Test
    public void testUserDetailsServiceBean() {
        UserDetailsService userDetailsService = securityConfig.userDetailsService(dataSource);
        assertThat(userDetailsService).isNotNull();
    }
}