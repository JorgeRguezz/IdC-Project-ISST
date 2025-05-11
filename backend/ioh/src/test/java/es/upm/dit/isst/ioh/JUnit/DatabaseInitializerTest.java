package es.upm.dit.isst.ioh.JUnit;

import es.upm.dit.isst.ioh.model.Propietario;
import es.upm.dit.isst.ioh.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;
import es.upm.dit.isst.ioh.config.DatabaseInitializer; // Import the DatabaseInitializer class
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;
 
class DatabaseInitializerTest {

    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    private DatabaseInitializer databaseInitializer;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        databaseInitializer = new DatabaseInitializer();
    }

    @Test
    void testInitDatabase_AdminUserNotExists() throws Exception {
        // Arrange
        when(usuarioRepository.findByEmail("admin@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("admin")).thenReturn("encodedPassword");
        // Act
        databaseInitializer.initDatabase(usuarioRepository, passwordEncoder).run(new String[]{});
        // Assert
        ArgumentCaptor<Propietario> adminCaptor = ArgumentCaptor.forClass(Propietario.class);
        verify(usuarioRepository).save(adminCaptor.capture());
        Propietario savedAdmin = adminCaptor.getValue();
        assertEquals("Admin", savedAdmin.getNombre());
        assertEquals("admin@email.com", savedAdmin.getEmail());
        assertEquals("123456789", savedAdmin.getTelefono());
        assertEquals("ROLE_ADMIN", savedAdmin.getRole());
    }

    @Test
    void testInitDatabase_AdminUserExists() throws Exception {
        // Arrange
        Propietario existingAdmin = new Propietario("Admin", "admin@example.com", "123456789", "encodedPassword", "ROLE_ADMIN");
        when(usuarioRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(existingAdmin));
        // Act
        databaseInitializer.initDatabase(usuarioRepository, passwordEncoder).run(new String[]{});
        // Assert
        verify(usuarioRepository, never()).save(any(Propietario.class));
    }
}
