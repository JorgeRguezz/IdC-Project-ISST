package es.upm.dit.isst.ioh.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import es.upm.dit.isst.ioh.model.Propietario; // Import the Propietario class
import es.upm.dit.isst.ioh.repository.UsuarioRepository; // Import the UsuarioRepository interface


@Configuration
public class DatabaseInitializer {

    //Crea un usuario admin por defecto al iniciar la aplicación
    @Bean
    public CommandLineRunner initDatabase(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Check if the admin user already exists
            if (usuarioRepository.findByEmail("admin@example.com").isEmpty()) {
                // Create a default admin user
                Propietario admin = new Propietario(
                        "Admin", // Name
                        "admin@email.com", // Email
                        "123456789", // Phone
                        passwordEncoder.encode("admin"), // Encrypted password
                        "ROLE_ADMIN" // Role
                );
                usuarioRepository.save(admin);
                System.out.println("Default admin user created: admin@example.com");
            } else {
                System.out.println("Admin user already exists.");
            }
        };
    }
}
