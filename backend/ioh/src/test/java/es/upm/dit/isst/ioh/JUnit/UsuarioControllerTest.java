package es.upm.dit.isst.ioh.JUnit;

import es.upm.dit.isst.ioh.model.Huesped;
import es.upm.dit.isst.ioh.model.Propietario;
import es.upm.dit.isst.ioh.model.Usuario;
import es.upm.dit.isst.ioh.repository.UsuarioRepository;
import es.upm.dit.isst.ioh.controller.UsuarioController;
import es.upm.dit.isst.ioh.service.UsuarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.util.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;
 
class UsuarioControllerTest {

    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private UsuarioService usuarioService;
    @InjectMocks
    private UsuarioController usuarioController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetAllUsuarios() {
        // Arrange
        List<Usuario> usuarios = Arrays.asList(new Huesped(), new Propietario());
        when(usuarioRepository.findAll()).thenReturn(usuarios);

        // Act
        List<Usuario> result = usuarioController.getAll();

        // Assert
        assertEquals(usuarios, result);
        verify(usuarioRepository).findAll();
    }

    @Test
    void testRegistrarHuesped_Success() {
        // Arrange
        Map<String, String> datos = new HashMap<>();
        datos.put("nombre", "Test Huesped");
        datos.put("email", "test@example.com");
        Huesped guardado = new Huesped();
        guardado.setId(1L);
        guardado.setNombre("Test Huesped");
        guardado.setEmail("test@example.com");
        when(usuarioService.registrarHuesped(datos)).thenReturn(guardado);

        // Act
        ResponseEntity<?> response = usuarioController.registrarHuesped(datos);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertEquals(1L, body.get("id"));
        assertEquals("Test Huesped", body.get("nombre"));
        assertEquals("test@example.com", body.get("email"));
        assertEquals("huesped", body.get("tipo"));
    }

    @Test
    void testRegistrarHuesped_Conflict() {
        // Arrange
        Map<String, String> datos = new HashMap<>();
        datos.put("nombre", "Test Huesped");
        datos.put("email", "test@example.com");
        when(usuarioService.registrarHuesped(datos)).thenThrow(new IllegalArgumentException("Email ya registrado"));

        // Act
        ResponseEntity<?> response = usuarioController.registrarHuesped(datos);

        // Assert
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertEquals("Email ya registrado", body.get("error"));
    }

    @Test
    void testRegistrarPropietario_Success() {
        // Arrange
        Map<String, String> datos = new HashMap<>();
        datos.put("nombre", "Test Propietario");
        datos.put("email", "test@example.com");
        Propietario guardado = new Propietario();
        guardado.setId(1L);
        guardado.setNombre("Test Propietario");
        guardado.setEmail("test@example.com");
        when(usuarioService.registrarPropietario(datos)).thenReturn(guardado);

        // Act
        ResponseEntity<?> response = usuarioController.registrarPropietario(datos);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertEquals(1L, body.get("id"));
        assertEquals("Test Propietario", body.get("nombre"));
        assertEquals("test@example.com", body.get("email"));
        assertEquals("propietario", body.get("tipo"));
    }

    @Test
    void testRegistrarPropietario_Conflict() {
        // Arrange
        Map<String, String> datos = new HashMap<>();
        datos.put("nombre", "Test Propietario");
        datos.put("email", "test@example.com");
        when(usuarioService.registrarPropietario(datos)).thenThrow(new IllegalArgumentException("Email ya registrado"));

        // Act
        ResponseEntity<?> response = usuarioController.registrarPropietario(datos);

        // Assert
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertEquals("Email ya registrado", body.get("error"));
    }

    @Test
    void testGetByEmail_Found() {
        // Arrange
        Usuario usuario = new Huesped();
        usuario.setEmail("test@example.com");
        when(usuarioRepository.findByEmail("test@example.com")).thenReturn(Optional.of(usuario));

        // Act
        ResponseEntity<Usuario> response = usuarioController.getByEmail("test@example.com");

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(usuario, response.getBody());
    }

    @Test
    void testGetByEmail_NotFound() {
        // Arrange
        when(usuarioRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        // Act
        ResponseEntity<Usuario> response = usuarioController.getByEmail("test@example.com");

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void testLogin_Success_Huesped() {
        // Arrange
        Map<String, String> credenciales = new HashMap<>();
        credenciales.put("email", "test@example.com");
        credenciales.put("password", "password");
        Huesped usuario = new Huesped();
        usuario.setId(1L);
        usuario.setNombre("Test Huesped");
        usuario.setEmail("test@example.com");
        when(usuarioService.autenticarUsuario("test@example.com", "password")).thenReturn(Optional.of(usuario));

        // Act
        ResponseEntity<?> response = usuarioController.login(credenciales);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertEquals(1L, body.get("id"));
        assertEquals("Test Huesped", body.get("nombre"));
        assertEquals("test@example.com", body.get("email"));
        assertEquals("huesped", body.get("tipo"));
    }

    @Test
    void testLogin_Success_Propietario() {
        // Arrange
        Map<String, String> credenciales = new HashMap<>();
        credenciales.put("email", "test@example.com");
        credenciales.put("password", "password");
        Propietario usuario = new Propietario();
        usuario.setId(1L);
        usuario.setNombre("Test Propietario");
        usuario.setEmail("test@example.com");
        when(usuarioService.autenticarUsuario("test@example.com", "password")).thenReturn(Optional.of(usuario));

        // Act
        ResponseEntity<?> response = usuarioController.login(credenciales);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertEquals(1L, body.get("id"));
        assertEquals("Test Propietario", body.get("nombre"));
        assertEquals("test@example.com", body.get("email"));
        assertEquals("propietario", body.get("tipo"));
    }

    @Test
    void testLogin_BadRequest() {
        // Arrange
        Map<String, String> credenciales = new HashMap<>();
        credenciales.put("email", "test@example.com"); // Missing password

        // Act
        ResponseEntity<?> response = usuarioController.login(credenciales);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertEquals("Email y contraseña son requeridos", body.get("error"));
    }

    @Test
    void testLogin_Unauthorized() {
        // Arrange
        Map<String, String> credenciales = new HashMap<>();
        credenciales.put("email", "test@example.com");
        credenciales.put("password", "password");
        when(usuarioService.autenticarUsuario("test@example.com", "password")).thenReturn(Optional.empty());

        // Act
        ResponseEntity<?> response = usuarioController.login(credenciales);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertEquals("Credenciales inválidas", body.get("error"));
    }
}
